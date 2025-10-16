import type { Request } from 'express';
import { Controller, Get, Req } from '@nestjs/common';
import { User } from '@/lib/types';

@Controller('user')
export class UserController {
  @Get('me')
  me(@Req() req: Request) {
    const user = <User>req['user'];

    delete user._id;
    delete user.password;

    return user;
  }
}
