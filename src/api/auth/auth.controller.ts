import {
  Controller,
  Post,
  Res,
  HttpStatus,
  Body,
  UseFilters,
  Inject,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import SignInDto from '@/dto/SignInDto';
import SignUpDto from '@/dto/SignUpDto';
import { I18nService, I18nValidationExceptionFilter } from 'nestjs-i18n';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { encrypt } from '@/lib/utils';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwt: JwtService,
    private readonly i18n: I18nService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('signin')
  @UseFilters(new I18nValidationExceptionFilter())
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.signin(body);
    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED);

      return {
        message: this.i18n.t('custom.signup.user.not_found'),
      };
    }

    const id = user._id!.toString();
    let jwtToken = await this.cacheManager.get<string | undefined>(id);
    if (!jwtToken) {
      jwtToken = await this.jwt.signAsync({ id });
      await this.cacheManager.set(id, jwtToken);
    }

    const token = encrypt(jwtToken);

    return {
      token,
    };
  }

  @Post('signup')
  async signup(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(body);

    if (!result.status) {
      res.status(HttpStatus.BAD_REQUEST);
    }

    return result;
  }
}
