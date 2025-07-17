import { AuthRepository } from '../../infra/auth.repository';
import { AuthService } from '../../domain/auth.service';
import { SignInDto } from '../dtos/sign-in.dto';

export class SignInCommand {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authService: AuthService
  ) {}

  async execute(dto: SignInDto): Promise<{ token: string; user: any }> {
    const authUser = await this.authRepository.findByEmail(dto.email);

    if (!authUser) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const isPasswordValid = await authUser.validatePassword(dto.password);
    if (!isPasswordValid) {
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    const token = this.authService.generateToken({
      id: authUser.id,
      email: authUser.email
    });

    return {
      token,
      user: authUser.toJSON()
    };
  }
}