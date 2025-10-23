import type { Request } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { User } from '@/lib/types';
import UpdateMeDto from './dto/UpdateMeDto';
import { I18nService } from 'nestjs-i18n';
import { UserService } from './user.service';
import { decrypt } from '@/lib/utils';
import PasswordVerifyDto from './dto/PasswordVerifyDto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Controller('user')
export class UserController {
  constructor(
    private readonly i18n: I18nService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  checkUserPasswordMatch(userPass: string, newPass: string) {
    const dUserPass = decrypt(userPass);
    if (dUserPass !== newPass) {
      throw new BadRequestException({
        status: false,
        messages: {
          password: [this.i18n.t('exceptions.invalidPassword')],
        },
      });
    }
  }

  getUserPasswordVerifyKey(user: User) {
    return `${user.email}_PWD_VERIFY`;
  }

  @Get('me')
  getMe(@Req() req: Request) {
    const user = <User>req['user'];

    delete user._id;
    delete user.password;

    return user;
  }

  @Put('me')
  async updateMe(@Req() req: Request, @Body() dto: UpdateMeDto) {
    const user = <User>req['user'];

    const signedTime = await this.cacheManager.get<string>(
      this.getUserPasswordVerifyKey(user),
    );

    if (!signedTime) {
      throw new BadRequestException({
        status: false,
        message: this.i18n.t('exceptions.passwordVerifySignNotFound'),
      });
    }

    await this.cacheManager.del(this.getUserPasswordVerifyKey(user));

    const result = await this.userService.update(user._id!, dto);

    return result;
  }

  @Post('password/verify')
  async passwordVerify(@Req() req: Request, @Body() dto: PasswordVerifyDto) {
    const user = <User>req['user'];

    await this.cacheManager.del(this.getUserPasswordVerifyKey(user));
    this.checkUserPasswordMatch(user.password!, dto.password);
    await this.cacheManager.set(
      this.getUserPasswordVerifyKey(user),
      new Date().getTime().toString(),
      30 * 1000,
    );

    return true;
  }
}
