import api from '../api/axios';
import type { DriveChild } from './LibraryService';

/**
 * FileService (Frontend OOP Implementation)
 * Manages binary assets and folders stored within the Drive vault.
 */
export class FileService {
    public async listFiles(driveId: string, topicId: string) {
        const response = await api.get(`/files/topic/${topicId}`, { params: { driveId } });
        return response.data;
    }

    /**
     * Lists all direct children (files + folders) of a Drive folder.
     */
    public async listChildren(driveId: string, parentFolderId: string): Promise<DriveChild[]> {
        const response = await api.get(`/files/children/${driveId}`, {
            params: { parentFolderId },
        });
        return response.data;
    }

    /**
     * Legacy: upload to a topic's /files subfolder.
     */
    public async uploadFile(
        driveId: string,
        topicId: string,
        file: File,
        onProgress?: (progress: number) => void
    ) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('driveId', driveId);
        formData.append('topicId', topicId);

        const response = await api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
                if (onProgress && e.total) {
                    onProgress(Math.round((e.loaded * 100) / e.total));
                }
            },
        });
        return response.data;
    }

    /**
     * Uploads a file directly into a Drive folder by its ID.
     */
    public async uploadToFolder(
        driveId: string,
        parentFolderId: string,
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<DriveChild> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('driveId', driveId);
        formData.append('parentFolderId', parentFolderId);

        const response = await api.post('/files/upload-to-folder', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
                if (onProgress && e.total) {
                    onProgress(Math.round((e.loaded * 100) / e.total));
                }
            },
        });
        return response.data;
    }

    public async deleteFile(driveId: string, fileId: string) {
        const response = await api.delete(`/files/${fileId}`, { params: { driveId } });
        return response.data;
    }

    public async createFolder(
        driveId: string,
        folderName: string,
        parentFolderId: string
    ): Promise<DriveChild> {
        const response = await api.post(`/files/folders/${driveId}`, {
            folderName,
            parentFolderId,
        });
        return response.data;
    }

    public async listFolders(driveId: string, parentFolderId: string) {
        const response = await api.get(`/files/folders/${driveId}`, {
            params: { parentFolderId },
        });
        return response.data;
    }

    /**
     * Downloads a file as a Blob, bypassing CORS/auth issues with iframe src.
     * The browser's blob URL can then be used in <iframe> or <img>.
     */
    public async downloadBlobUrl(driveId: string, fileId: string): Promise<string> {
        const response = await api.get(`/files/download/${driveId}/${fileId}`, {
            responseType: 'blob',
        });
        return URL.createObjectURL(response.data);
    }

    /**
     * Downloads a file as UTF-8 text. Useful for reading JSON notes or
     * markdown files from Drive.
     */
    public async downloadText(driveId: string, fileId: string): Promise<string> {
        const response = await api.get(`/files/download/${driveId}/${fileId}`, {
            responseType: 'text',
            transformResponse: [(data) => data],
        });
        return response.data as string;
    }

    /**
     * Overwrites the content of an existing Drive file.
     */
    public async updateFileContent(
        driveId: string,
        fileId: string,
        content: string,
        mimeType = 'application/json'
    ): Promise<DriveChild> {
        const response = await api.put(`/files/${driveId}/${fileId}`, {
            content,
            mimeType,
        });
        return response.data;
    }
}

export const fileService = new FileService();
