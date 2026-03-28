import api from '../api/axios';

/**
 * FileService (Frontend OOP Implementation)
 * Manages binary assets (PDFs, Images, etc.) stored within the topic hierarchy.
 */
export class FileService {
    /**
     * Lists assets stored in a specific topic's 'files/' folder.
     */
    public async listFiles(driveId: string, topicName: string) {
        const response = await api.get('/files', {
            params: { driveId, topicName }
        });
        return response.data;
    }

    /**
     * Streams an asset to Google Drive via the backend.
     * Uses FormData to handle the binary payload.
     */
    public async uploadFile(driveId: string, topicName: string, file: File, onProgress?: (progress: number) => void) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('driveId', driveId);
        formData.append('topicName', topicName);

        const response = await api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        });

        return response.data;
    }

    /**
     * Deletes a specific asset from the vault.
     */
    public async deleteFile(driveId: string, fileId: string) {
        const response = await api.delete(`/files/${fileId}`, {
            params: { driveId }
        });
        return response.data;
    }
}

// Export singleton instance
export const fileService = new FileService();
