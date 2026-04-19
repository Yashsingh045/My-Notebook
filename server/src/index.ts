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

// Mocks for DOM APIs requested by pdf-parse on Node.js 22 (Vercel)
if (typeof (global as any).DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class {};
}
if (typeof (global as any).ImageData === 'undefined') {
    (global as any).ImageData = class {};
}
if (typeof (global as any).Path2D === 'undefined') {
    (global as any).Path2D = class {};
}

// Connect to Database and Redis (safe for serverless cold-starts)
const startServices = async () => {
    try {
        console.log('--- Server Cold Start ---');
        await connectDB();
        await connectRedis();
    } catch (e) {
        console.error('Service initialization failed:', e);
    }
};
startServices();

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

// Export for Vercel serverless handler compatibility
export = app;

