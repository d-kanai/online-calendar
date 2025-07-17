import { z } from 'zod';

export const SignInDtoSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください')
});

export type SignInDto = z.infer<typeof SignInDtoSchema>;