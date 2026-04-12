import React, { createContext, useContext, useState, useEffect } from 'react';
import { libraryService } from '../services/LibraryService';
import { useAuth } from './AuthContext';

interface Topic {
    folderId: string;
    notesFolderId: string;
    filesFolderId: string;
    createdAt: string;
}

interface Subject {
    folderId: string;
    topics: { [key: string]: Topic };
    createdAt: string;
}

interface LibraryContextType {
    subjects: { [key: string]: Subject };
    loading: boolean;
    selectedDriveId: string | null;
    activeTopic: { subjectName: string; topicName: string; data: Topic } | null;
    setActiveTopic: (topic: { subjectName: string; topicName: string; data: Topic } | null) => void;
    refreshLibrary: () => Promise<void>;
    addSubject: (name: string) => Promise<void>;
    addTopic: (subjectName: string, topicName: string) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, needsDriveConnection, primaryDriveId } = useAuth();
    const [subjects, setSubjects] = useState<{ [key: string]: Subject }>({});
    const [loading, setLoading] = useState(false);
    const [activeTopic, setActiveTopic] = useState<{ subjectName: string; topicName: string; data: Topic } | null>(null);

    const refreshLibrary = async () => {
        // Bug fix: only fetch if user has a connected drive with a real UUID
        if (!user || needsDriveConnection || !primaryDriveId) return;
        setLoading(true);
        try {
            const data = await libraryService.getLibrary(primaryDriveId);
            setSubjects(data.subjects || {});
        } catch (error) {
            console.error('Failed to sync library vault:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSubject = async (name: string) => {
        if (!primaryDriveId) return;
        await libraryService.createSubject(name, primaryDriveId);
        await refreshLibrary();
    };

    const addTopic = async (subjectName: string, topicName: string) => {
        if (!primaryDriveId) return;
        await libraryService.createTopic(subjectName, topicName, primaryDriveId);
        await refreshLibrary();
    };

    useEffect(() => {
        refreshLibrary();
    }, [user, needsDriveConnection, primaryDriveId]);

    return (
        <LibraryContext.Provider value={{ 
            subjects, 
            loading, 
            selectedDriveId: primaryDriveId,
            activeTopic, 
            setActiveTopic, 
            refreshLibrary,
            addSubject,
            addTopic
        }}>
            {children}
        </LibraryContext.Provider>
    );
};

export const useLibrary = () => {
    const context = useContext(LibraryContext);
    if (!context) throw new Error('useLibrary must be used within a LibraryProvider');
    return context;
};
