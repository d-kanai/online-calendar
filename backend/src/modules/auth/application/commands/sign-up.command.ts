import { AuthRepository } from '../../infra/auth.repository';
import { AuthService } from '../../domain/auth.service';
import { AuthUser } from '../../domain/auth-user.model';
import { SignUpDto } from '../dtos/sign-up.dto';

export class SignUpCommand {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authService: AuthService
  ) {}

  async execute(dto: SignUpDto): Promise<{ token: string; user: any }> {
    const existingUser = await this.authRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    const authUser = await AuthUser.create({
      email: dto.email,
      name: dto.name,
      password: dto.password
    });

    await this.authRepository.save(authUser);

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