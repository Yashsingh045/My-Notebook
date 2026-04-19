import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('PostgreSQL (Prisma) Connected');
    } catch (error) {
        // Do NOT call process.exit() in a serverless environment.
        // Vercel re-uses Lambda containers; exiting kills all future requests.
        console.error(`Database Error: ${(error as Error).message}`);
    }
};

export default prisma;
