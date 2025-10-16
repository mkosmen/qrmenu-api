import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { User } from '@/lib/types';
import { decrypt, encrypt } from '@/lib/utils';
import SignInDto from '@/api/auth/dto/SignInDto';
import SignUpDto from '@/api/auth/dto/SignUpDto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly i18n: I18nService,
    private readonly userService: UserService,
  ) {}

  async signin(dto: SignInDto): Promise<User | null> {
    const user = await this.userService.getByEmail(dto.email);

    if (user) {
      const decryptedPass = decrypt(user.password!);

      const result = decryptedPass === dto.password;

      if (result) {
        return user;
      }
    }

    return null;
  }

  async signup(dto: SignUpDto): Promise<{ status: boolean; message?: string }> {
    const user = await this.userService.getByEmail(dto.email);

    if (user) {
      return {
        status: false,
        message: this.i18n.t('exceptions.exists', {
          args: {
            prop: this.i18n.t('custom.email'),
          },
        }),
      };
    }

    const status = await this.userService.add({
      ...dto,
      password: encrypt(dto.password),
    });

    return {
      status,
    };
  }
}
