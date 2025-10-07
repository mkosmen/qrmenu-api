import { UsersService } from '@/api/users/users.service';
import { decrypt } from '@/lib/utils';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const xToken = req.headers['x-token']?.toString();
    if (!xToken) {
      throw new UnauthorizedException();
    }

    const token = decrypt(xToken);
    const payload = await this.jwt.verifyAsync<{ email: string }>(token);
    const user = await this.usersService.getByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    req.user = user;

    next();
  }
}
