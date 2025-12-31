import BaseService from './base.service';

// Game Progress
export interface GameProgress {
    user_id: number;
    level: number;
    total_points: number;
    coins: number;
    total_sen_petals: number;
    unlocked_chapters: number[];
    completed_levels: number[];
    collected_characters: string[];
    badges: Badge[];
    achievements: Achievement[];
    museum_open: boolean;
    museum_income: number;
    stats: {
        completion_rate: number;
        chapters_unlocked: number;
        total_chapters: number;
        characters_collected: number;
        total_badges: number;
    };
}

// Chapter (Sen Flower)
export interface Chapter {
    id: number;
    name: string;
    description: string;
    theme: string;
    order: number;
    layer_index: 1 | 2 | 3;
    petal_state: 'closed' | 'blooming' | 'full';
    color: string;
    required_petals: number;
    is_unlocked: boolean;
    total_levels: number;
    completed_levels: number;
    completion_rate: number;
    can_unlock: boolean;
    levels?: Level[];
}

// Level
export interface Level {
    id: number;
    chapter_id: number;
    name: string;
    description: string;
    type: 'story' | 'quiz' | 'mixed';
    difficulty: 'easy' | 'medium' | 'hard';
    order: number;
    thumbnail?: string;
    is_completed: boolean;
    is_locked: boolean;
    player_best_score?: number;
    play_count?: number;
    rewards: Rewards;
    time_limit?: number;
    passing_score?: number;
    total_screens?: number;
    screens?: Screen[];
}

// Screen Types
export type ScreenType = 'DIALOGUE' | 'HIDDEN_OBJECT' | 'QUIZ' | 'TIMELINE' | 'IMAGE_VIEWER' | 'VIDEO';

export interface Screen {
    id: number;
    type: ScreenType;
    order: number;
    content: any; // Varies by screen type
    character_id?: number;
    next_screen_id?: number;
}

// Rewards
export interface Rewards {
    coins?: number;
    petals?: number;
    character?: string;
    badge?: string;
    museum_item?: number;
}

// Badge
export interface Badge {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: 'completion' | 'collection' | 'exploration' | 'achievement';
    earned_at?: string;
}

// Achievement
export interface Achievement {
    id: number;
    name: string;
    description: string;
    progress: number;
    target: number;
    completed: boolean;
}

// Game Session
export interface GameSession {
    session_id: number;
    level_id: number;
    user_id: number;
    current_screen_index: number;
    score: number;
    started_at: string;
    completed_at?: string;
}

// Leaderboard Entry
export interface LeaderboardEntry {
    rank: number;
    user_id: number;
    user_name: string;
    user_avatar?: string;
    total_points: number;
    level: number;
    sen_petals: number;
    characters_count: number;
}

// Museum
export interface Museum {
    user_id: number;
    is_open: boolean;
    level: number;
    artifacts: MuseumArtifact[];
    total_income: number;
    income_per_hour: number;
}

export interface MuseumArtifact {
    artifact_id: number;
    name: string;
    image: string;
    acquired_at: string;
    display_position?: number;
}

class GameService extends BaseService {
    constructor() {
        super('/game');
    }

    // Progress
    async getProgress(): Promise<GameProgress> {
        const response = await this.get('/progress');
        return response.data;
    }

    // Chapters
    async getChapters(): Promise<Chapter[]> {
        const response = await this.get('/chapters');
        return response.data;
    }

    async getChapterDetail(id: number): Promise<Chapter> {
        const response = await this.get(`/chapters/${id}`);
        return response.data;
    }

    async unlockChapter(id: number): Promise<{ success: boolean; message: string }> {
        const response = await this.post(`/chapters/${id}/unlock`);
        return response.data;
    }

    // Levels
    async getLevelsByChapter(chapterId: number): Promise<Level[]> {
        const response = await this.get(`/levels/${chapterId}`);
        return response.data;
    }

    async getLevelDetail(id: number): Promise<Level> {
        const response = await this.get(`/levels/${id}/detail`);
        return response.data;
    }

    async startLevel(id: number): Promise<{ session_id: number; level: Level; current_screen: Screen }> {
        const response = await this.post(`/levels/${id}/start`);
        return response.data;
    }

    async navigateToNextScreen(sessionId: number): Promise<{ screen: Screen; is_last: boolean }> {
        const response = await this.post(`/sessions/${sessionId}/next`);
        return response.data;
    }

    async submitAnswer(sessionId: number, data: { screen_id: number; answer: any }): Promise<{
        correct: boolean;
        score: number;
        explanation?: string;
    }> {
        const response = await this.post(`/sessions/${sessionId}/submit`, data);
        return response.data;
    }

    async completeLevel(sessionId: number): Promise<{
        success: boolean;
        final_score: number;
        rewards: Rewards;
        unlocked_items: any[];
    }> {
        const response = await this.post(`/sessions/${sessionId}/complete`);
        return response.data;
    }

    // Leaderboard
    async getLeaderboard(type: 'global' | 'weekly' | 'monthly' = 'global', limit: number = 20): Promise<LeaderboardEntry[]> {
        const response = await this.get('/leaderboard', { type, limit });
        return response.data;
    }

    // Daily Reward
    async claimDailyReward(): Promise<{ coins: number; petals: number }> {
        const response = await this.get('/daily-reward');
        return response.data;
    }

    // Museum
    async getMuseum(): Promise<Museum> {
        const response = await this.get('/museum');
        return response.data;
    }

    async upgradeMuseum(): Promise<{ success: boolean; new_level: number }> {
        const response = await this.post('/museum/upgrade');
        return response.data;
    }

    async collectMuseumIncome(): Promise<{ coins: number }> {
        const response = await this.post('/museum/collect');
        return response.data;
    }

    // Badges
    async getBadges(): Promise<Badge[]> {
        const response = await this.get('/badges');
        return response.data;
    }

    // Shop
    async getShopItems(): Promise<any[]> {
        const response = await this.get('/shop');
        return response.data;
    }

    async purchaseItem(itemId: number): Promise<{ success: boolean; item: any }> {
        const response = await this.post('/shop/purchase', { item_id: itemId });
        return response.data;
    }

    // QR Scanning
    async scanObject(qrCode: string): Promise<{
        success: boolean;
        object: any;
        rewards: Rewards;
    }> {
        const response = await this.post('/scan', { qr_code: qrCode });
        return response.data;
    }
}

export const gameService = new GameService();
export default gameService;
