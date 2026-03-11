import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import authRoutes from './routes/authRoutes';
import libraryRoutes from './routes/libraryRoutes';
import noteRoutes from './routes/noteRoutes';
import fileRoutes from './routes/fileRoutes';

dotenv.config();

// Connect to Database and Redis
connectDB();
connectRedis();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.send('My-Notebook API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
