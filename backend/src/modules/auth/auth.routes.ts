import { PrismaClient } from '@prisma/client';
import { AuthController } from './presentation/auth.controller.js';

const prisma = new PrismaClient();
const authController = new AuthController(prisma);

export const authRoutes = authController.getApp();