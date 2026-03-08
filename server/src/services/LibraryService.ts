import { ILibraryService, LibraryTree, SubjectMetadata, TopicMetadata } from '../interfaces/ILibraryService';
import { IDriveService } from '../interfaces/IDriveService';
import prisma from '../config/db';

/**
 * LibraryService (OOP Implementation)
 * Manages the hierarchical vault structure (Subjects -> Topics) on Google Drive.
 * Orchestrates folder creation and _metadata.json updates.
 */
export class LibraryService implements ILibraryService {
    constructor(private driveService: IDriveService) {}

    /**
     * Fetches the entire library tree from the user's Drive.
     */
    public async getLibrary(userId: string, driveId: string): Promise<LibraryTree> {
        return await this.driveService.readDriveMetadata(userId, driveId);
    }

    /**
     * Creates a Subject folder and updates Drive metadata.
     */
    public async createSubject(userId: string, driveId: string, name: string): Promise<SubjectMetadata> {
        const drive = await this.driveService.getDriveClient(userId, driveId);
        const userDrive = await prisma.userDrive.findUnique({ where: { id: driveId } });
        if (!userDrive) throw new Error('UserDrive not found');

        const metadata = await this.driveService.readDriveMetadata(userId, driveId);

        // Find the "Subjects/" parent folder ID
        const subjectsFolderList = await drive.files.list({
            q: `name = 'Subjects' and '${userDrive.rootFolderId}' in parents and trashed = false`,
            fields: 'files(id)',
        });
        const subjectsFolderId = subjectsFolderList.data.files?.[0]?.id;
        if (!subjectsFolderId) throw new Error('Root "Subjects" folder not found in Drive.');

        // 1. Create the physical folder in Drive
        const folder = await drive.files.create({
            requestBody: {
                name,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [subjectsFolderId],
            },
            fields: 'id',
        });

        // 2. Update metadata object
        metadata.subjects[name] = {
            folderId: folder.data.id!,
            topics: {}
        };

        // 3. Write metadata back to Drive
        await this.driveService.writeDriveMetadata(userId, driveId, metadata);

        return { id: folder.data.id!, name };
    }

    /**
     * Creates a Topic folder (+ subfolders) and updates Drive metadata.
     */
    public async createTopic(
        userId: string,
        driveId: string,
        subjectName: string,
        topicName: string
    ): Promise<TopicMetadata> {
        const drive = await this.driveService.getDriveClient(userId, driveId);
        const metadata = await this.driveService.readDriveMetadata(userId, driveId);

        const subject = metadata.subjects[subjectName];
        if (!subject) throw new Error(`Subject "${subjectName}" does not exist in metadata.`);

        // 1. Create Main Topic Folder
        const topicFolder = await drive.files.create({
            requestBody: {
                name: topicName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [subject.folderId],
            },
            fields: 'id',
        });
        const topicFolderId = topicFolder.data.id!;

        // 2. Create "notes/" subfolder
        const notesFolder = await drive.files.create({
            requestBody: {
                name: 'notes',
                mimeType: 'application/vnd.google-apps.folder',
                parents: [topicFolderId],
            },
            fields: 'id',
        });

        // 3. Create "files/" subfolder
        const filesFolder = await drive.files.create({
            requestBody: {
                name: 'files',
                mimeType: 'application/vnd.google-apps.folder',
                parents: [topicFolderId],
            },
            fields: 'id',
        });

        // 4. Update Metadata
        subject.topics[topicName] = {
            folderId: topicFolderId,
            notesFolderId: notesFolder.data.id!,
            filesFolderId: filesFolder.data.id!
        };

        // 5. Write metadata back to Drive
        await this.driveService.writeDriveMetadata(userId, driveId, metadata);

        return {
            id: topicFolderId,
            name: topicName,
            subjectName,
            notesFolderId: notesFolder.data.id!,
            filesFolderId: filesFolder.data.id!
        };
    }
}
