import api from '../api/axios';

export type TabName = 'Studies' | 'Internships' | 'Jobs' | 'Archive';

export interface DriveChild {
    id: string;
    name: string;
    type: 'file' | 'folder';
    mimeType?: string;
    size?: string;
    webViewLink?: string;
    modifiedTime?: string;
}

/**
 * LibraryService (Frontend OOP Implementation)
 * Abstracts the hierarchical organization API logic.
 */
export class LibraryService {
    /**
     * Fetches the entire subject/topic metadata tree.
     */
    public async getLibrary(driveId: string) {
        const response = await api.get('/library', { params: { driveId } });
        return response.data;
    }

    /**
     * Returns the top-level tab folder IDs for the vault,
     * ensuring tabs + readme.pdf exist.
     */
    public async getTabs(driveId: string): Promise<Record<TabName, string>> {
        const response = await api.get('/library/tabs', { params: { driveId } });
        return response.data.folders as Record<TabName, string>;
    }

    public async createSubject(name: string, driveId: string) {
        const response = await api.post('/library/subjects', { name, driveId });
        return response.data;
    }

    public async createTopic(subjectName: string, topicName: string, driveId: string) {
        const response = await api.post('/library/topics', {
            subjectName,
            topicName,
            driveId,
        });
        return response.data;
    }
}

export const libraryService = new LibraryService();
