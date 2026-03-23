import api from '../api/axios';

/**
 * LibraryService (Frontend OOP Implementation)
 * Abstracts the hierarchical organization API logic.
 */
export class LibraryService {
    /**
     * Fetches the entire subject/topic tree from the user's Drive.
     */
    public async getLibrary() {
        // Assume first drive for now, or implement drive selector in later phase
        const response = await api.get('/library');
        return response.data;
    }

    /**
     * Creates a new Subject folder in the vault.
     */
    public async createSubject(name: string) {
        const response = await api.post('/library/subject', { name });
        return response.data;
    }

    /**
     * Creates a new Topic folder inside a specific Subject.
     */
    public async createTopic(subjectName: string, topicName: string) {
        const response = await api.post('/library/topic', { subjectName, topicName });
        return response.data;
    }
}

// Export singleton instance
export const libraryService = new LibraryService();
