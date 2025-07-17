import { z } from 'zod';

export const SignUpDtoSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  name: z.string().min(1, '名前を入力してください').max(100, '名前は100文字以内で入力してください')
});

export type SignUpDto = z.infer<typeof SignUpDtoSchema>;