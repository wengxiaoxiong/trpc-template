
import { z } from 'zod';
import { publicProcedure, router } from '@/utils/trpc';
import { prisma } from '@/utils/prisma';
import bcrypt from 'bcrypt';
import { generateToken } from '@/utils/jwt';

export const authRouter = router({
    register: publicProcedure
        .input(
            z.object({
                username: z.string(),
                password: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const { username, password } = input;
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                },
            });
            const token = generateToken(user.id);
            const sanitizedUser = { ...user, password: undefined };
            return { token, user: sanitizedUser };
        }),

    login: publicProcedure
        .input(
            z.object({
                username: z.string(),
                password: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            const { username, password } = input;
            const user = await prisma.user.findUnique({ where: { username } });
            if (!user) {
                throw new Error('User not found');
            }
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                throw new Error('Invalid password');
            }
            const token = generateToken(user.id);
            const sanitizedUser = { ...user, password: undefined };
            return { token, user: sanitizedUser };
        }),
});