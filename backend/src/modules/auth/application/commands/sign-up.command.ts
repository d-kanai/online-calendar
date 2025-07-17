import { AuthRepository } from '../../infra/auth.repository';
import { AuthUser } from '../../domain/auth-user.model';
import { AuthToken } from '../../domain/auth-token.value-object';
import { SignUpDto } from '../dtos/sign-up.dto';

export class SignUpCommand {
  constructor(
    private readonly authRepository: AuthRepository
  ) {}

  async execute(dto: SignUpDto): Promise<{ authToken: AuthToken; authUser: AuthUser }> {
    const existingUser = await this.authRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    const { authUser, authToken } = await AuthUser.signup({
      email: dto.email,
      name: dto.name,
      password: dto.password
    });

    await this.authRepository.save(authUser);

    return { authToken, authUser };
  }
}