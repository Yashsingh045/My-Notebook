import api from '../api/axios';

export type ActivityAction =
    | 'create-folder'
    | 'upload-file'
    | 'create-note'
    | 'save-note'
    | 'delete-file'
    | 'add-drive'
    | 'remove-drive'
    | 'update-username';

export interface ActivityEntry {
    id: string;
    action: ActivityAction;
    targetName: string;
    targetId: string | null;
    details: string | null;
    createdAt: string;
}

export interface ActivityResponse {
    username: string;
    accountCreatedAt: string | null;
    entries: ActivityEntry[];
}

export class ActivityService {
    public async list(): Promise<ActivityResponse> {
        const response = await api.get('/activity');
        return response.data;
    }
}

export const activityService = new ActivityService();
