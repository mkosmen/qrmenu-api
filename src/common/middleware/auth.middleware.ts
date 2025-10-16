import { UserService } from '@/api/user/user.service';
import { decrypt } from '@/lib/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: JwtService,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const xToken = <string | undefined>req.headers['x-token'];
    if (!xToken) {
      throw new UnauthorizedException();
    }

    let token: string | undefined;
    try {
      token = decrypt(xToken);
    } catch {
      throw new UnauthorizedException();
    }

    const { email } = await this.jwt.verifyAsync<{ email: string }>(token);

    const user = await this.userService.getByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const cacheResult = await this.cacheManager.get<string>(email);
    if (!cacheResult) {
      throw new UnauthorizedException();
    }

    req.user = user;

    next();
  }
}
