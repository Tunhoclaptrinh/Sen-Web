import BaseService from './base.service';
import type {
    GameProgress,
    Chapter,
    Level,
    Screen,
    LeaderboardEntry,
    Badge,
    Achievement,
} from '@/types/game.types';

class GameService extends BaseService {
    constructor() {
        super('/game');
    }

    // ==================== Progress ====================
    async getProgress(): Promise<GameProgress> {
        const response = await this.get('/progress');
        return response.data;
    }

    // ==================== Chapters ====================
    async getChapters(): Promise<Chapter[]> {
        const response = await this.get('/chapters');
        return response.data;
    }

    async getChapterDetail(id: number): Promise<Chapter> {
        const response = await this.get(`/chapters/${id}`);
        return response.data;
    }

    async unlockChapter(id: number): Promise<{ success: boolean; message: string; data: any }> {
        const response = await this.post(`/chapters/${id}/unlock`);
        return response;
    }

    // ==================== Levels ====================
    async getLevelsByChapter(chapterId: number): Promise<Level[]> {
        const response = await this.get(`/levels/${chapterId}`);
        return response.data;
    }

    async getLevelDetail(id: number): Promise<Level> {
        const response = await this.get(`/levels/${id}/detail`);
        return response.data;
    }

    async startLevel(id: number): Promise<{ sessionId: number; level: Level; currentScreen: Screen }> {
        const response = await this.post(`/levels/${id}/start`);
        return response.data;
    }

    // ==================== Session Management ====================
    /**
     * Navigate to next screen in game session
     * @param sessionId - Game session ID
     */
    async navigateToNextScreen(sessionId: number): Promise<{
        sessionId: number;
        currentScreen: Screen;
        progress: {
            completedScreens: number;
            totalScreens: number;
            percentage: number;
        };
        levelFinished?: boolean;
        finalScore?: number;
        pointsEarned?: number; // ⚡ Added for animation
    }> {
        const response = await this.post(`/sessions/${sessionId}/next-screen`);
        return response.data;
    }

    /**
     * Submit answer for QUIZ screen
     * @param sessionId - Game session ID
     * @param answerId - Selected answer ID
     */
    async submitAnswer(sessionId: number, answerId: string): Promise<{
        isCorrect: boolean;
        pointsEarned: number;
        totalScore: number;
        explanation?: string;
        correctAnswer?: string;
    }> {
        const response = await this.post(`/sessions/${sessionId}/submit-answer`, { answerId });
        return response.data;
    }

    /**
     * Submit timeline order for TIMELINE screen
     * @param sessionId - Game session ID
     * @param eventOrder - Array of event IDs in order
     */
    async submitTimeline(sessionId: number, eventOrder: string[]): Promise<{
        isCorrect: boolean;
        pointsEarned?: number;
        totalScore?: number;
        correctOrder?: string[];
    }> {
        const response = await this.post(`/sessions/${sessionId}/submit-timeline`, { eventOrder });
        return response.data;
    }

    /**
     * Collect clue/item for HIDDEN_OBJECT screen
     * @param levelId - Level ID
     * @param clueId - Clue/item ID to collect
     */
    async collectClue(levelId: number, clueId: string): Promise<{
        item: {
            id: string;
            name: string;
            factPopup: string;
        };
        pointsEarned: number;
        totalScore: number;
        progress: {
            collected: number;
            required: number;
            allCollected: boolean;
        };
    }> {
        const response = await this.post(`/levels/${levelId}/collect-clue`, { clueId });
        return response.data;
    }

    /**
     * Complete level
     * @param levelId - Level ID
     * @param score - Final score
     * @param timeSpent - Time spent in seconds
     */
    async completeLevel(levelId: number, score: number, timeSpent: number): Promise<{
        passed: boolean;
        score: number;
        rewards: {
            petals: number;
            coins: number;
            character?: string;
        };
        newTotals: {
            petals: number;
            points: number;
            coins: number;
        };
        nextLevelId?: number;
    }> {
        const response = await this.post(`/levels/${levelId}/complete`, { score, timeSpent });
        return response.data;
    }

    // ==================== Leaderboard ====================
    async getLeaderboard(type: 'global' | 'weekly' | 'monthly' = 'global', limit: number = 20): Promise<LeaderboardEntry[]> {
        const response = await this.get('/leaderboard', { type, limit });
        return response.data;
    }

    // ==================== Daily Reward ====================
    async claimDailyReward(): Promise<{ coins: number; petals: number }> {
        const response = await this.get('/daily-reward');
        return response.data;
    }

    // ==================== Museum ====================
    async getMuseum(): Promise<{
        isOpen: boolean;
        level: number;
        incomePerHour: number;
        totalIncomeGenerated: number;
        pendingIncome: number;
        hoursAccumulated: number;
        capped: boolean;
        characters: string[];
        artifacts: {
            artifactId: number;
            name: string;
            image: string;
            acquiredAt: string;
        }[];
        visitorCount: number;
        canCollect: boolean;
        nextCollectionIn: string;
    }> {
        const response = await this.get('/museum');
        return response.data;
    }

    /**
     * Toggle museum open/close status
     * @param isOpen - true to open, false to close
     */
    async toggleMuseum(isOpen: boolean): Promise<{
        isOpen: boolean;
        incomePerHour: number;
    }> {
        const response = await this.post('/museum/toggle', { isOpen });
        return response.data;
    }

    /**
     * Collect accumulated museum income
     */
    async collectMuseumIncome(): Promise<{
        collected: number;
        totalCoins: number;
        totalMuseumIncome: number;
        nextCollectionIn: string;
    }> {
        const response = await this.post('/museum/collect');
        return response.data;
    }

    // ==================== Badges & Achievements ====================
    async getBadges(): Promise<Badge[]> {
        const response = await this.get('/badges');
        return response.data;
    }

    async getAchievements(): Promise<Achievement[]> {
        const response = await this.get('/achievements');
        return response.data;
    }

    // ==================== Shop & Inventory ====================
    async getShopItems(): Promise<any[]> {
        const response = await this.get('/shop');
        return response.data;
    }

    /**
     * Purchase item from shop
     * @param itemId - Item ID to purchase
     * @param quantity - Quantity to purchase (default: 1)
     */
    async purchaseItem(itemId: number, quantity: number = 1): Promise<{
        item: {
            id: number;
            name: string;
            type: string;
        };
        quantity: number;
        totalCost: number;
        remainingCoins: number;
    }> {
        const response = await this.post('/shop/purchase', { itemId, quantity });
        return response.data;
    }

    /**
     * Get user inventory
     */
    async getInventory(): Promise<{
        items: Array<{
            itemId: number;
            name: string;
            type: string;
            quantity: number;
            acquiredAt: string;
        }>;
    }> {
        const response = await this.get('/inventory');
        return response.data;
    }

    /**
     * Use item from inventory
     * @param itemId - Item ID to use
     * @param targetId - Target ID (e.g., level ID for hint)
     */
    async useItem(itemId: number, targetId?: number): Promise<{
        item: {
            id: number;
            name: string;
        };
        effect: string;
    }> {
        const response = await this.post('/inventory/use', { itemId, targetId });
        return response.data;
    }

    // ==================== QR Scanning ====================
    /**
     * Scan QR code at heritage site
     * @param code - QR code value
     * @param latitude - User's latitude
     * @param longitude - User's longitude
     */
    async scanObject(code: string, latitude?: number, longitude?: number): Promise<{
        artifact: {
            id: number;
            name: string;
            description: string;
            image: string;
        };
        rewards: {
            coins: number;
            petals: number;
            character?: string;
        };
        newTotals: {
            coins: number;
            petals: number;
        };
        isNewDiscovery: boolean;
    }> {
        const response = await this.post('/scan', { code, latitude, longitude });
        return response.data;
    }
}

export const gameService = new GameService();
export default gameService;
