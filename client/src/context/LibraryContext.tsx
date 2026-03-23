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
    activeTopic: { subjectName: string; topicName: string; data: Topic } | null;
    setActiveTopic: (topic: { subjectName: string; topicName: string; data: Topic } | null) => void;
    refreshLibrary: () => Promise<void>;
    addSubject: (name: string) => Promise<void>;
    addTopic: (subjectName: string, topicName: string) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, needsDriveConnection } = useAuth();
    const [subjects, setSubjects] = useState<{ [key: string]: Subject }>({});
    const [loading, setLoading] = useState(false);
    const [activeTopic, setActiveTopic] = useState<{ subjectName: string; topicName: string; data: Topic } | null>(null);

    const refreshLibrary = async () => {
        if (!user || needsDriveConnection) return;
        setLoading(true);
        try {
            const data = await libraryService.getLibrary();
            setSubjects(data.subjects || {});
        } catch (error) {
            console.error('Failed to sync library vault:', error);
        } finally {
            setLoading(false);
        }
    };

    const addSubject = async (name: string) => {
        await libraryService.createSubject(name);
        await refreshLibrary();
    };

    const addTopic = async (subjectName: string, topicName: string) => {
        await libraryService.createTopic(subjectName, topicName);
        await refreshLibrary();
    };

    useEffect(() => {
        refreshLibrary();
    }, [user, needsDriveConnection]);

    return (
        <LibraryContext.Provider value={{ 
            subjects, 
            loading, 
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
