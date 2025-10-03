import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { User } from '@/lib/types';
import { getDb } from '@/lib/mongo/client';
import { decrypt, encrypt } from '@/lib/utils';
import SignInDto from '@/dto/SignInDto';
import SignUpDto from '@/dto/SignUpDto';

@Injectable()
export class AuthService {
  constructor(private readonly i18n: I18nService) {}

  async signin(dto: SignInDto): Promise<User | null> {
    const user = await getDb()
      .collection<User>('users')
      .findOne({ email: dto.email });

    if (user) {
      const decryptedPass = decrypt(user.password);

      const result = decryptedPass === dto.password;

      if (result) {
        return user;
      }
    }

    return null;
  }

  async signup(dto: SignUpDto): Promise<{ status: boolean; message?: string }> {
    const coll = getDb().collection<User>('users');
    const dbUser = await coll.findOne({ email: dto.email });

    if (dbUser) {
      return {
        status: false,
        message: this.i18n.t('custom.signup.user.exists'),
      };
    }

    await coll.insertOne({
      ...dto,
      password: encrypt(dto.password),
    });

    return {
      status: true,
    };
  }
}
