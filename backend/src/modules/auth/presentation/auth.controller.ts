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
        console.log('📝 SignIn request received:', { email: body.email });
        
        const dto = SignInDtoSchema.parse(body);

        const signInCommand = new SignInCommand(this.authRepository);
        const { authToken, authUser } = await signInCommand.execute(dto);

        console.log('✅ SignIn successful:', { userId: authUser.id, email: authUser.email });

        const response: ApiResponse<{ token: string; user: any }> = {
          success: true,
          data: {
            token: authToken.value,
            user: authUser.toJSON()
          }
        };

        return c.json(response, 200);
      } catch (error) {
        console.error('❌ SignIn failed:');
        console.error('  Error type:', error?.constructor.name);
        console.error('  Error message:', error instanceof Error ? error.message : error);
        
        if (error instanceof Error && error.stack) {
          console.error('  Stack trace:', error.stack);
        }
        
        const response: ApiResponse<null> = {
          success: false,
          error: error instanceof Error ? error.message : '認証に失敗しました'
        };
        
        // Zodバリデーションエラーの場合は400を返す
        if (error?.constructor.name === 'ZodError') {
          return c.json(response, 400);
        }
        
        return c.json(response, 401);
      }
    });

    this.app.post('/signup', async (c) => {
      try {
        const body = await c.req.json();
        console.log('📝 SignUp request received:', { email: body.email, name: body.name });
        
        const dto = SignUpDtoSchema.parse(body);

        const signUpCommand = new SignUpCommand(this.authRepository);
        const { authToken, authUser } = await signUpCommand.execute(dto);

        console.log('✅ SignUp successful:', { userId: authUser.id, email: authUser.email });

        const response: ApiResponse<{ token: string; user: any }> = {
          success: true,
          data: {
            token: authToken.value,
            user: authUser.toJSON()
          }
        };

        return c.json(response, 201);
      } catch (error) {
        console.error('❌ SignUp failed:');
        console.error('  Error type:', error?.constructor.name);
        console.error('  Error message:', error instanceof Error ? error.message : error);
        
        if (error instanceof Error && error.stack) {
          console.error('  Stack trace:', error.stack);
        }
        
        const response: ApiResponse<null> = {
          success: false,
          error: error instanceof Error ? error.message : 'ユーザー登録に失敗しました'
        };
        
        // 重複エラーの場合は409を返す
        if (error instanceof Error && error.message.includes('既に登録されています')) {
          return c.json(response, 409);
        }
        
        return c.json(response, 400);
      }
    });
  }

  getApp(): Hono {
    return this.app;
  }
}