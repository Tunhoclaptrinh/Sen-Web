import BaseService from './base.service';

// Quest
export interface Quest {
    id: number;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'achievement' | 'exploration';
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    requirements: QuestRequirement[];
    rewards: QuestRewards;
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    progress?: QuestProgress;
    expires_at?: string;
    thumbnail?: string;
}

// Quest Requirement
export interface QuestRequirement {
    type: 'visit_site' | 'collect_artifact' | 'complete_level' | 'earn_points' | 'scan_qr';
    target: number;
    current?: number;
    description: string;
}

// Quest Rewards
export interface QuestRewards {
    coins?: number;
    petals?: number;
    experience?: number;
    badge?: string;
    character?: string;
    items?: number[];
}

// Quest Progress
export interface QuestProgress {
    quest_id: number;
    user_id: number;
    started_at: string;
    completed_at?: string;
    progress: {
        [key: string]: number;
    };
    is_completed: boolean;
}

class QuestService extends BaseService {
    constructor() {
        super('/quests');
    }

    // Get all quests
    async getQuests(filters?: {
        type?: string;
        status?: string;
        category?: string;
    }): Promise<Quest[]> {
        const response = await this.get('/', filters);
        return response.data;
    }

    // Get active quests
    async getActiveQuests(): Promise<Quest[]> {
        const response = await this.get('/active');
        return response.data;
    }

    // Get daily quests
    async getDailyQuests(): Promise<Quest[]> {
        const response = await this.get('/daily');
        return response.data;
    }

    // Get quest detail
    async getQuestDetail(id: number): Promise<Quest> {
        const response = await this.get(`/${id}`);
        return response.data;
    }

    // Start quest
    async startQuest(id: number): Promise<{
        success: boolean;
        quest: Quest;
        progress: QuestProgress;
    }> {
        const response = await this.post(`/${id}/start`);
        return response.data;
    }

    // Update quest progress
    async updateProgress(id: number, data: {
        requirement_type: string;
        value: number;
    }): Promise<{
        success: boolean;
        progress: QuestProgress;
        completed: boolean;
    }> {
        const response = await this.post(`/${id}/progress`, data);
        return response.data;
    }

    // Complete quest
    async completeQuest(id: number): Promise<{
        success: boolean;
        rewards: QuestRewards;
        next_quest?: Quest;
    }> {
        const response = await this.post(`/${id}/complete`);
        return response.data;
    }

    // Claim rewards
    async claimRewards(id: number): Promise<{
        success: boolean;
        rewards: QuestRewards;
    }> {
        const response = await this.post(`/${id}/claim`);
        return response.data;
    }

    // Get user quest history
    async getQuestHistory(limit: number = 20): Promise<Quest[]> {
        const response = await this.get('/history', { limit });
        return response.data;
    }
}

export const questService = new QuestService();
export default questService;
