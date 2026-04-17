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

export interface VaultTab {
    id: string;
    name: string;
    isStandard: boolean;
}

export interface VaultTabsResponse {
    rootFolderId: string;
    folders: Record<TabName, string>;
    tabs: VaultTab[];
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
     * Returns the vault's root folder id, the standard tab map, and the full
     * list of top-level folders (standard + user-created). Self-heals.
     */
    public async getTabs(driveId: string): Promise<VaultTabsResponse> {
        const response = await api.get('/library/tabs', { params: { driveId } });
        return response.data as VaultTabsResponse;
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
