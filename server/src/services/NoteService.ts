import { INoteService, NoteContent, NoteMetadata } from '../interfaces/INoteService';
import { IDriveService } from '../interfaces/IDriveService';

/**
 * NoteService (OOP Implementation)
 * Manages rich text notes as JSON files stored in Google Drive.
 * Implements full CRUD lifecycle with JSON serialization.
 */
export class NoteService implements INoteService {
    constructor(private driveService: IDriveService) {}

    /**
     * Creates a new JSON note inside a topic's /notes subfolder.
     */
    public async createNote(
        userId: string,
        driveId: string,
        topicId: string,
        title: string,
        content: any,
        tags: string[]
    ): Promise<NoteMetadata> {
        const drive = await this.driveService.getDriveClient(userId, driveId);

        // 1. Find the "notes" subfolder inside the topic folder
        const folderList = await drive.files.list({
            q: `'${topicId}' in parents and name = 'notes' and trashed = false`,
            fields: 'files(id)',
        });
        const notesFolderId = folderList.data.files?.[0]?.id;
        if (!notesFolderId) throw new Error('Topic "notes" subfolder not found in Drive.');

        // 2. Prepare JSON content
        const noteContent: NoteContent = {
            title,
            content,
            tags,
            updatedAt: new Date().toISOString()
        };

        // 3. Create file in Drive
        const file = await drive.files.create({
            requestBody: {
                name: `${title}.json`,
                mimeType: 'application/json',
                parents: [notesFolderId],
            },
            media: {
                mimeType: 'application/json',
                body: JSON.stringify(noteContent),
            },
            fields: 'id, name, modifiedTime',
        });

        return {
            id: file.data.id!,
            title: file.data.name!.replace('.json', ''),
            topicId,
            updatedAt: file.data.modifiedTime!
        };
    }

    /**
     * Retrieves the content of a specific note file from Drive.
     */
    public async getNote(userId: string, driveId: string, fileId: string): Promise<NoteContent> {
        const drive = await this.driveService.getDriveClient(userId, driveId);

        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'text' }
        );

        return JSON.parse(response.data as string);
    }

    /**
     * Updates an existing note JSON file on Drive.
     */
    public async updateNote(
        userId: string,
        driveId: string,
        fileId: string,
        updates: Partial<NoteContent>
    ): Promise<void> {
        const drive = await this.driveService.getDriveClient(userId, driveId);

        // Fetch current content first to merge
        const currentContent = await this.getNote(userId, driveId, fileId);
        const updatedContent = {
            ...currentContent,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Update the file in Drive
        await drive.files.update({
            fileId,
            media: {
                mimeType: 'application/json',
                body: JSON.stringify(updatedContent),
            },
            // If title changed, update the filename too
            requestBody: updates.title ? { name: `${updates.title}.json` } : {}
        });
    }

    /**
     * Deletes a note file from Drive.
     */
    public async deleteNote(userId: string, driveId: string, fileId: string): Promise<void> {
        const drive = await this.driveService.getDriveClient(userId, driveId);
        await drive.files.delete({ fileId });
    }

    /**
     * Lists all notes inside a specific topic's /notes subfolder.
     */
    public async listNotes(userId: string, driveId: string, topicId: string): Promise<NoteMetadata[]> {
        const drive = await this.driveService.getDriveClient(userId, driveId);

        // 1. Find the "notes" subfolder ID
        const folderList = await drive.files.list({
            q: `'${topicId}' in parents and name = 'notes' and trashed = false`,
            fields: 'files(id)',
        });
        const notesFolderId = folderList.data.files?.[0]?.id;
        if (!notesFolderId) return [];

        // 2. List all JSON files in that subfolder
        const fileList = await drive.files.list({
            q: `'${notesFolderId}' in parents and mimeType = 'application/json' and trashed = false`,
            fields: 'files(id, name, modifiedTime)',
            orderBy: 'modifiedTime desc'
        });

        return (fileList.data.files || []).map(file => ({
            id: file.id!,
            title: file.name!.replace('.json', ''),
            topicId,
            updatedAt: file.modifiedTime!
        }));
    }
}
