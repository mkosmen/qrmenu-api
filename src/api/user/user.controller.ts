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
import { I18nService } from 'nestjs-i18n';
import { UserService } from './user.service';
import { decrypt, encrypt } from '@/lib/utils';
import UpdateMeDto from './dto/UpdateMeDto';
import PasswordVerifyDto from './dto/PasswordVerifyDto';
import UpdatePasswordDto from './dto/UpdatePasswordDto';
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

  async checkSignedTime(user: User) {
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
  }

  async updateUserByDto(req: Request, dto: any) {
    const user = <User>req['user'];
    await this.checkSignedTime(user);
    return await this.userService.update(user._id!, dto);
  }

  @Get('me')
  getMe(@Req() req: Request) {
    const user = <User>req['user'];

    delete user._id;
    delete user.password;

    return user;
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

  @Put('me')
  async updateMe(@Req() req: Request, @Body() dto: UpdateMeDto) {
    return await this.updateUserByDto(req, dto);
  }

  @Put('password/reset')
  async passwordReset(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    return await this.updateUserByDto(req, {
      password: encrypt(dto.newPassword),
    });
  }
}
