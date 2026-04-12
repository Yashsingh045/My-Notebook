import api from '../api/axios';

/**
 * NoteService (Frontend OOP Implementation)
 * Handles the persistence of rich-text notes as structured JSON files.
 */
export class NoteService {
    /**
     * Fetches the content of a specific note from the vault.
     * Bug fix: was GET /notes?noteId= — now GET /notes/:id?driveId=
     */
    public async getNote(driveId: string, noteId: string) {
        const response = await api.get(`/notes/${noteId}`, {
            params: { driveId }
        });
        return response.data;
    }

    /**
     * Persists the serialized editor state back to Google Drive.
     * Bug fix: was PUT /notes — now PATCH /notes/:id (correct method + route)
     */
    public async updateNote(driveId: string, noteId: string, content: any) {
        const response = await api.patch(`/notes/${noteId}`, {
            driveId,
            content
        });
        return response.data;
    }

    /**
     * Creates a new note initialized with empty content.
     */
    public async createNote(driveId: string, topicId: string, title: string) {
        const response = await api.post('/notes', {
            driveId,
            topicId,
            title,
            content: { type: 'doc', content: [] },
            tags: []
        });
        return response.data;
    }

    /**
     * Lists all notes for a given topic folder.
     */
    public async listNotes(driveId: string, topicId: string) {
        const response = await api.get(`/notes/topic/${topicId}`, {
            params: { driveId }
        });
        return response.data;
    }

    /**
     * Deletes a note from the vault.
     */
    public async deleteNote(driveId: string, noteId: string) {
        const response = await api.delete(`/notes/${noteId}`, {
            params: { driveId }
        });
        return response.data;
    }
}

// Export singleton instance
export const noteService = new NoteService();
