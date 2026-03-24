import api from '../api/axios';

/**
 * NoteService (Frontend OOP Implementation)
 * Handles the persistence of rich-text notes as structured JSON files.
 */
export class NoteService {
    /**
     * Fetches the content of a specific note from the vault.
     */
    public async getNote(driveId: string, noteId: string) {
        const response = await api.get('/notes', {
            params: { driveId, noteId }
        });
        return response.data;
    }

    /**
     * Persists the serialized editor state back to Google Drive.
     */
    public async updateNote(driveId: string, noteId: string, content: any) {
        const response = await api.put('/notes', {
            driveId,
            noteId,
            content
        });
        return response.data;
    }

    /**
     * Optional: Create a new note initialized with empty content.
     */
    public async createNote(driveId: string, topicName: string, title: string) {
        const response = await api.post('/notes', {
            driveId,
            topicName,
            title,
            content: { type: 'doc', content: [] } // Empty TipTap doc
        });
        return response.data;
    }
}

// Export singleton instance
export const noteService = new NoteService();
