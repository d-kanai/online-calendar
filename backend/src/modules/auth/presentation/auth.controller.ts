import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../../../shared/types/api';
import { AuthRepository } from '../infra/auth.repository';
import { SignInCommand } from '../application/commands/sign-in.command';
import { SignUpCommand } from '../application/commands/sign-up.command';
import { SignInDtoSchema } from '../application/dtos/sign-in.dto';
import { SignUpDtoSchema } from '../application/dtos/sign-up.dto';

export class AuthController {
  private readonly app: Hono;
  private readonly authRepository: AuthRepository;

  constructor(prisma: PrismaClient) {
    this.app = new Hono();
    this.authRepository = new AuthRepository(prisma);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.app.post('/signin', async (c) => {
      try {
        const body = await c.req.json();
        const dto = SignInDtoSchema.parse(body);

        const signInCommand = new SignInCommand(this.authRepository);
        const { authToken, authUser } = await signInCommand.execute(dto);

        const response: ApiResponse<{ token: string; user: any }> = {
          success: true,
          data: {
            token: authToken.value,
            user: authUser.toJSON()
          }
        };

        return c.json(response, 200);
      } catch (error) {
        const response: ApiResponse<null> = {
          success: false,
          error: error instanceof Error ? error.message : '認証に失敗しました'
        };
        return c.json(response, 401);
      }
    });

    this.app.post('/signup', async (c) => {
      try {
        const body = await c.req.json();
        const dto = SignUpDtoSchema.parse(body);

        const signUpCommand = new SignUpCommand(this.authRepository);
        const { authToken, authUser } = await signUpCommand.execute(dto);

        const response: ApiResponse<{ token: string; user: any }> = {
          success: true,
          data: {
            token: authToken.value,
            user: authUser.toJSON()
          }
        };

        return c.json(response, 201);
      } catch (error) {
        const response: ApiResponse<null> = {
          success: false,
          error: error instanceof Error ? error.message : 'ユーザー登録に失敗しました'
        };
        return c.json(response, 400);
      }
    });
  }

  getApp(): Hono {
    return this.app;
  }
}