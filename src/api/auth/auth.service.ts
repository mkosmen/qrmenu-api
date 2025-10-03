import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AuthService {
  signin(req: Request): any {
    return req.body;
  }
}
