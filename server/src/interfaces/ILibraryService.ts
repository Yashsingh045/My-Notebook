// ─── ILibraryService Contract ──────────────────────────────────
// Defines the operations for managing the hierarchical structure
// (Subjects and Topics) within the user's private digital vault.
// ─────────────────────────────────────────────────────────────

export interface SubjectMetadata {
    id: string;
    name: string;
}

export interface TopicMetadata {
    id: string;
    name: string;
    subjectName: string;
    notesFolderId: string;
    filesFolderId: string;
}

export interface LibraryTree {
    subjects: {
        [subjectName: string]: {
            folderId: string;
            topics: {
                [topicName: string]: {
                    folderId: string;
                    notesFolderId: string;
                    filesFolderId: string;
                }
            }
        }
    }
}

export interface ILibraryService {
    /**
     * Retrieves the entire subject/topic tree for a specific drive.
     */
    getLibrary(userId: string, driveId: string): Promise<LibraryTree>;

    /**
     * Creates a new Subject folder in Drive and updates metadata.
     */
    createSubject(userId: string, driveId: string, name: string): Promise<SubjectMetadata>;

    /**
     * Creates a new Topic folder (plus notes/files subfolders) within a subject.
     */
    createTopic(
        userId: string, 
        driveId: string, 
        subjectName: string, 
        topicName: string
    ): Promise<TopicMetadata>;
}
