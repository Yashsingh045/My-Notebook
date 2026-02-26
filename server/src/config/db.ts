import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('PostgreSQL (Prisma) Connected');
    } catch (error) {
        console.error(`Database Error: ${(error as Error).message}`);
        process.exit(1);
    }
};

export default prisma;
