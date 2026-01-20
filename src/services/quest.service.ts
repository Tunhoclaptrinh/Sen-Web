import BaseService from './base.service';
import type { Quest } from '@/types/quest.types';

class QuestService extends BaseService {
    constructor() {
        super('/quests');
    }

    // Get active quests
    async getActiveQuests(): Promise<Quest[]> {
        const response = await this.get('/active');
        return response.data;
    }

    // Start quest
    async startQuest(id: number): Promise<{
        success: boolean;
        data: any;
    }> {
        const response = await this.post(`/${id}/start`);
        return response.data;
    }

    // Update quest progress
    async updateProgress(id: number, currentValue: number): Promise<{
        success: boolean;
        data: any;
    }> {
        const response = await this.post(`/${id}/progress`, { current_value: currentValue });
        return response.data;
    }

    // Complete quest
    async completeQuest(id: number): Promise<{
        success: boolean;
        data: any;
    }> {
        const response = await this.post(`/${id}/complete`);
        return response.data;
    }

    // Claim rewards
    async claimRewards(id: number): Promise<{
        success: boolean;
        data: any;
    }> {
        const response = await this.post(`/${id}/claim`);
        return response.data;
    }

    // Get leaderboard
    async getLeaderboard(limit: number = 10): Promise<any[]> {
        const response = await this.get('/leaderboard', { limit });
        return response.data;
    }
}

export const questService = new QuestService();
export default questService;
