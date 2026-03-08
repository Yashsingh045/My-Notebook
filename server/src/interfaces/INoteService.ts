// ─── INoteService Contract ────────────────────────────────────
// Defines the operations for managing rich text notes stored as
// JSON files within the user's private Google Drive hierarchy.
// ─────────────────────────────────────────────────────────────

export interface NoteContent {
    title: string;
    content: any; // rich text object (e.g. TipTap JSON)
    tags: string[];
    updatedAt: string;
}

export interface NoteMetadata {
    id: string;
    title: string;
    topicId: string;
    updatedAt: string;
}

export interface INoteService {
    /**
     * Creates a new JSON note inside a topic's /notes subfolder.
     */
    createNote(
        userId: string, 
        driveId: string, 
        topicId: string, 
        title: string, 
        content: any, 
        tags: string[]
    ): Promise<NoteMetadata>;

    /**
     * Retrieves the content of a specific note file from Drive.
     */
    getNote(userId: string, driveId: string, fileId: string): Promise<NoteContent>;

    /**
     * Updates an existing note JSON file on Drive.
     */
    updateNote(
        userId: string, 
        driveId: string, 
        fileId: string, 
        updates: Partial<NoteContent>
    ): Promise<void>;

    /**
     * Deletes a note file from Drive.
     */
    deleteNote(userId: string, driveId: string, fileId: string): Promise<void>;

    /**
     * Lists all notes inside a specific topic's /notes subfolder.
     */
    listNotes(userId: string, driveId: string, topicId: string): Promise<NoteMetadata[]>;
}
