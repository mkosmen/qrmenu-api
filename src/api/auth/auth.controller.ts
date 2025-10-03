import {
  Controller,
  Post,
  Res,
  HttpStatus,
  Body,
  UseFilters,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import SignInDto from '@/dto/SignInDto';
import SignUpDto from '@/dto/SignUpDto';
import { I18nValidationExceptionFilter } from 'nestjs-i18n';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @UseFilters(new I18nValidationExceptionFilter())
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signin(body);

    if (!result) {
      res.status(HttpStatus.UNAUTHORIZED);
    }

    return {
      status: !!result,
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
