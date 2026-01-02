import BaseService from './base.service';
import type {
    GameProgress,
    Chapter,
    Level,
    Screen,
    Rewards,
    Badge,
    Achievement,
    LeaderboardEntry,
    Museum,
    MuseumToggleResponse,
    MuseumCollectResponse,
    NavigateScreenResponse,
    SubmitAnswerResponse,
    SubmitTimelineResponse,
    CollectClueResponse,
    CompleteLevelResponse,
    InventoryItem,
    ShopItem,
    PurchaseItemResponse,
    UseItemResponse,
    ScanObjectResponse,
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

    async startLevel(id: number): Promise<{ session_id: number; level: Level; current_screen: Screen }> {
        const response = await this.post(`/levels/${id}/start`);
        return response.data;
    }

    // ==================== Session Management ====================
    /**
     * Navigate to next screen in game session
     * @param sessionId - Game session ID
     */
    async navigateToNextScreen(sessionId: number): Promise<{
        session_id: number;
        current_screen: Screen;
        progress: {
            completed_screens: number;
            total_screens: number;
            percentage: number;
        };
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
        is_correct: boolean;
        points_earned: number;
        total_score: number;
        explanation?: string;
        correct_answer?: string;
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
        points_earned?: number;
        total_score?: number;
        correct_order?: string[];
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
            fact_popup: string;
        };
        points_earned: number;
        total_score: number;
        progress: {
            collected: number;
            required: number;
            all_collected: boolean;
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
        new_totals: {
            petals: number;
            points: number;
            coins: number;
        };
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
        is_open: boolean;
        income_per_hour: number;
        total_income_generated: number;
        pending_income: number;
        hours_accumulated: number;
        capped: boolean;
        characters: string[];
        visitor_count: number;
        can_collect: boolean;
        next_collection_in: string;
    }> {
        const response = await this.get('/museum');
        return response.data;
    }

    /**
     * Toggle museum open/close status
     * @param isOpen - true to open, false to close
     */
    async toggleMuseum(isOpen: boolean): Promise<{
        is_open: boolean;
        income_per_hour: number;
    }> {
        const response = await this.post('/museum/toggle', { isOpen });
        return response.data;
    }

    /**
     * Collect accumulated museum income
     */
    async collectMuseumIncome(): Promise<{
        collected: number;
        total_coins: number;
        total_museum_income: number;
        next_collection_in: string;
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
        total_cost: number;
        remaining_coins: number;
    }> {
        const response = await this.post('/shop/purchase', { itemId, quantity });
        return response.data;
    }

    /**
     * Get user inventory
     */
    async getInventory(): Promise<{
        items: Array<{
            item_id: number;
            name: string;
            type: string;
            quantity: number;
            acquired_at: string;
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
        new_totals: {
            coins: number;
            petals: number;
        };
        is_new_discovery: boolean;
    }> {
        const response = await this.post('/scan', { code, latitude, longitude });
        return response.data;
    }
}

export const gameService = new GameService();
export default gameService;
