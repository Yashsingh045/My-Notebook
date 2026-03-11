import { Request, Response } from 'express';
import { Readable } from 'stream';
import { IFileService } from '../interfaces/IFileService';

/**
 * FileController (OOP Implementation)
 * Provides HTTP endpoints for asset uploads and management.
 * Injects IFileService to handle Drive orchestration.
 */
export class FileController {
    constructor(private fileService: IFileService) {}

    /**
     * POST /api/files/upload
     * Body: { driveId, topicId }
     * File: 'file' (multipart)
     */
    public uploadFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId, topicId } = req.body;
            const file = req.file;

            if (!driveId || !topicId || !file) {
                res.status(400).json({ message: 'Missing driveId, topicId, or file content.' });
                return;
            }

            // Convert Multer Buffer to a Readable Stream for the Drive API
            const fileStream = new Readable();
            fileStream.push(file.buffer);
            fileStream.push(null); // Signal EOF

            const uploadedFile = await this.fileService.uploadFile(
                userId,
                driveId,
                topicId,
                file.originalname,
                file.mimetype,
                fileStream
            );

            res.status(201).json(uploadedFile);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/files/topic/:topicId
     * Query Params: driveId (required)
     */
    public listByTopic = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { topicId } = req.params;
            const { driveId } = req.query;

            if (!driveId) {
                res.status(400).json({ message: 'Missing driveId parameter.' });
                return;
            }

            const files = await this.fileService.listFiles(userId, driveId as string, topicId);
            res.json(files);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * DELETE /api/files/:id
     * Query Params: driveId (required)
     */
    public deleteFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;
            const { driveId } = req.query;

            if (!driveId) {
                res.status(400).json({ message: 'Missing driveId parameter.' });
                return;
            }

            await this.fileService.deleteFile(userId, driveId as string, id);
            res.json({ message: 'File deleted successfully.' });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };
}
