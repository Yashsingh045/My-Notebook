import api from '../api/axios';
import type { DriveChild } from './LibraryService';

export class SearchService {
    public async search(driveId: string, q: string): Promise<DriveChild[]> {
        if (!q || q.trim().length < 2) return [];
        const response = await api.get('/search', { params: { driveId, q: q.trim() } });
        return response.data;
    }
}

export const searchService = new SearchService();
