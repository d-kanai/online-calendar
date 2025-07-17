import { AuthRepository } from '../../infra/auth.repository';
import { SignInDto } from '../dtos/sign-in.dto';
import { AuthUser } from '../../domain/auth-user.model';
import { AuthToken } from '../../domain/auth-token.value-object';

export class SignInCommand {
  constructor(
    private readonly authRepository: AuthRepository
  ) {}

  async execute(dto: SignInDto): Promise<{ authToken: AuthToken; authUser: AuthUser }> {
    const authUser = await this.authRepository.findByEmail(dto.email);

    if (!authUser) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const authToken = await authUser.signin(dto.password);

    return { authToken, authUser };
  }
}