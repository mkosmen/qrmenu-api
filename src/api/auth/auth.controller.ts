import {
  Controller,
  Post,
  Res,
  HttpStatus,
  Body,
  Inject,
  Get,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import SignInDto from './dto/SignInDto';
import SignUpDto from './dto/SignUpDto';
import { I18nService } from 'nestjs-i18n';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { encrypt } from '@/lib/utils';
import { User } from '@/lib/types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwt: JwtService,
    private readonly i18n: I18nService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('signin')
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.signin(body);
    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED);

      return {
        message: this.i18n.t('exceptions.not_found', {
          args: {
            prop: this.i18n.t('custom.user'),
          },
        }),
      };
    }

    let jwtToken = await this.cacheManager.get<string | undefined>(user.email);
    if (!jwtToken) {
      jwtToken = await this.jwt.signAsync({ email: user.email });
      await this.cacheManager.set(user.email, jwtToken);
    }

    return {
      token: encrypt(jwtToken),
    };
  }

  @Post('signup')
  async signup(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(body);

    if (!result.status) {
      res.status(HttpStatus.BAD_REQUEST).json(result);
      return;
    }

    return result;
  }

  @Get('signout')
  async signout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = <User>req['user'];
    const result = await this.cacheManager.del(user.email);

    if (!result) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result;
  }
}
