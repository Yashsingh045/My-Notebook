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
import aiRoutes from './routes/aiRoutes';
import shareRoutes from './routes/shareRoutes';
import driveRoutes from './routes/driveRoutes';
import searchRoutes from './routes/searchRoutes';
import activityRoutes from './routes/activityRoutes';

dotenv.config();

// Connect to Database and Redis (wrapped in try-catch for serverless safety)
try { connectDB(); } catch (e) { console.error('DB connection failed:', e); }
try { connectRedis(); } catch (e) { console.error('Redis connection failed:', e); }

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activity', activityRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.send('My-Notebook API is running...');
});

// Only call app.listen() in local development.
// Vercel uses the exported `app` directly as a serverless handler.
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;

