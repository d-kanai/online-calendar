import { AuthRepository } from '../../infra/auth.repository';
import { SignInDto } from '../dtos/sign-in.dto';

export class SignInCommand {
  constructor(
    private readonly authRepository: AuthRepository
  ) {}

  async execute(dto: SignInDto): Promise<{ token: string; user: any }> {
    const authUser = await this.authRepository.findByEmail(dto.email);

    if (!authUser) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const token = await authUser.signin(dto.password);

    return {
      token,
      user: authUser.toJSON()
    };
  }
}