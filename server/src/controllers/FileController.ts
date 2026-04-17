import { Request, Response } from 'express';
import { Readable } from 'stream';
import { IFileService } from '../interfaces/IFileService';
import { IDriveService } from '../interfaces/IDriveService';
import prisma from '../config/db';

/**
 * FileController (OOP Implementation)
 * Provides HTTP endpoints for asset uploads and folder management.
 */
export class FileController {
    constructor(
        private fileService: IFileService,
        private driveService: IDriveService
    ) {}

    /**
     * POST /api/files/upload
     * Legacy route: uploads into topicId's /files subfolder.
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

            const fileStream = new Readable();
            fileStream.push(file.buffer);
            fileStream.push(null);

            const uploaded = await this.fileService.uploadFile(
                userId,
                driveId,
                topicId,
                file.originalname,
                file.mimetype,
                fileStream
            );
            res.status(201).json(uploaded);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * POST /api/files/upload-to-folder
     * Body (multipart): file, driveId, parentFolderId
     * Uploads the file directly into the given Drive folder.
     */
    public uploadToFolder = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const { driveId, parentFolderId } = req.body;
            const file = req.file;

            if (!driveId || !parentFolderId || !file) {
                res.status(400).json({
                    message: 'Missing driveId, parentFolderId, or file content.',
                });
                return;
            }

            const stream = new Readable();
            stream.push(file.buffer);
            stream.push(null);

            const uploaded = await this.driveService.uploadFileStream(
                userId,
                driveId,
                file.originalname,
                file.mimetype,
                stream,
                parentFolderId
            );
            res.status(201).json(uploaded);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/files/topic/:topicId?driveId=...
     */
    public listByTopic = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const topicId = req.params.topicId as string;
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
     * GET /api/files/children/:driveId?parentFolderId=...
     * Returns a mixed list of files and folders directly under parentFolderId.
     */
    public listChildren = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const driveId = req.params.driveId as string;
            const { parentFolderId } = req.query;
            if (!parentFolderId) {
                res.status(400).json({ message: 'Missing parentFolderId parameter.' });
                return;
            }
            const children = await this.driveService.listFolderChildren(
                userId,
                driveId,
                parentFolderId as string
            );
            res.json(children);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * DELETE /api/files/:id?driveId=...
     */
    /**
     * PUT /api/files/:driveId/:fileId
     * Body: { content: string, mimeType?: string }
     * Overwrites the content of an existing Drive file. Intended for text
     * payloads (TipTap JSON notes, JSON metadata, markdown).
     */
    public updateFileContent = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const driveId = req.params.driveId as string;
            const fileId = req.params.fileId as string;
            const { content, mimeType } = req.body;
            if (content === undefined || content === null) {
                res.status(400).json({ message: 'Missing content field.' });
                return;
            }
            const payload =
                typeof content === 'string' ? content : JSON.stringify(content);
            const updated = await this.driveService.updateFileContent(
                userId,
                driveId,
                fileId,
                mimeType || 'application/json',
                payload
            );
            res.json(updated);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    public deleteFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const id = req.params.id as string;
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

    /**
     * POST /api/files/folders/:driveId
     * Body: { folderName, parentFolderId (optional - defaults to root) }
     */
    public createFolder = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const driveId = req.params.driveId as string;
            let { folderName, parentFolderId } = req.body;

            if (!folderName) {
                res.status(400).json({ message: 'Missing folderName.' });
                return;
            }

            if (!parentFolderId) {
                const userDrive = await prisma.userDrive.findUnique({ where: { id: driveId } });
                if (!userDrive || !userDrive.rootFolderId) {
                    res.status(400).json({
                        message: 'Drive not initialized. Connect Google Drive first.',
                    });
                    return;
                }
                parentFolderId = userDrive.rootFolderId;
            }

            const folderId = await this.driveService.createFolder(
                userId,
                driveId,
                folderName,
                parentFolderId
            );
            res.status(201).json({
                id: folderId,
                name: folderName,
                type: 'folder',
                mimeType: 'application/vnd.google-apps.folder',
            });
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/files/folders/:driveId?parentFolderId=...
     */
    public listFolders = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const driveId = req.params.driveId as string;
            const { parentFolderId } = req.query;
            if (!parentFolderId) {
                res.status(400).json({ message: 'Missing parentFolderId parameter.' });
                return;
            }
            const folders = await this.driveService.listFolders(
                userId,
                driveId,
                parentFolderId as string
            );
            res.json(folders);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };

    /**
     * GET /api/files/download/:driveId/:fileId
     * Streams the raw file bytes back to the client.
     */
    public downloadFile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
            const driveId = req.params.driveId as string;
            const fileId = req.params.fileId as string;
            const { stream, mimeType, name, size } = await this.driveService.downloadFile(
                userId,
                driveId,
                fileId
            );
            res.setHeader('Content-Type', mimeType);
            res.setHeader(
                'Content-Disposition',
                `inline; filename="${encodeURIComponent(name)}"`
            );
            if (size) res.setHeader('Content-Length', size);
            stream.pipe(res);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    };
}
