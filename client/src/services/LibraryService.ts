import api from '../api/axios';

/**
 * LibraryService (Frontend OOP Implementation)
 * Abstracts the hierarchical organization API logic.
 */
export class LibraryService {
    /**
     * Fetches the entire subject/topic tree from the user's Drive.
     * Backend requires driveId query param — defaults to 'primary'.
     */
    public async getLibrary(driveId: string = 'primary') {
        const response = await api.get('/library', { params: { driveId } });
        return response.data;
    }

    /**
     * Creates a new Subject folder in the vault.
     * Bug fix: was '/library/subject' (singular) — now '/library/subjects' (plural)
     */
    public async createSubject(name: string, driveId: string = 'primary') {
        const response = await api.post('/library/subjects', { name, driveId });
        return response.data;
    }

    /**
     * Creates a new Topic folder inside a specific Subject.
     * Bug fix: was '/library/topic' (singular) — now '/library/topics' (plural)
     */
    public async createTopic(subjectName: string, topicName: string, driveId: string = 'primary') {
        const response = await api.post('/library/topics', { subjectName, topicName, driveId });
        return response.data;
    }
}

// Export singleton instance
export const libraryService = new LibraryService();
