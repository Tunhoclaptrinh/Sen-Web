// ============================================
// Game System Types
// ============================================

// Re-export from other services
export * from '../services/ai.service';
export * from '../services/learning.service';

// ==================== Game Progress ====================
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

// ==================== Chapter (Sen Flower) ====================
export interface Chapter {
    id: number;
    name: string;
    description: string;
    theme: string;
    order: number;
    layer_index: 1 | 2 | 3;
    petal_state: 'closed' | 'blooming' | 'full' | 'locked';
    color: string;
    image?: string;
    required_petals: number;
    total_levels: number;
    completed_levels: number;
    completion_rate: number;
    can_unlock: boolean;
    is_active: boolean;
    levels?: Level[];
}

// ==================== Level ====================
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

// ==================== Screen Types ====================
export type ScreenType = 'DIALOGUE' | 'HIDDEN_OBJECT' | 'QUIZ' | 'TIMELINE' | 'IMAGE_VIEWER' | 'VIDEO';

export interface Screen {
    id: string;
    type: ScreenType;
    index: number;
    is_first: boolean;
    is_last: boolean;
    background_image?: string;
    skip_allowed?: boolean;
    content?: any; // Varies by screen type
}

// Dialogue Screen
export interface DialogueScreen extends Screen {
    type: 'DIALOGUE';
    content: Array<{
        speaker: 'AI' | 'USER' | 'NARRATOR';
        text: string;
        avatar?: string;
        emotion?: string;
    }>;
}

// Quiz Screen
export interface QuizScreen extends Screen {
    type: 'QUIZ';
    question?: string;
    description?: string;
    options: Array<{
        text: string;
        is_correct: boolean;
    }>;
    time_limit?: number;
    points?: number;
}

// Timeline Screen
export interface TimelineScreen extends Screen {
    type: 'TIMELINE';
    events: Array<{
        id: string;
        title: string;
        year: number;
        description: string;
    }>;
    correct_order: string[];
}

// Hidden Object Screen
export interface HiddenObjectScreen extends Screen {
    type: 'HIDDEN_OBJECT';
    background_image: string;
    description?: string;
    items: Array<{
        id: string;
        name: string;
        x: number;
        y: number;
        fact_popup: string;
    }>;
    required_items: number;
}

// ==================== Session Responses ====================
export interface SessionProgress {
    completed_screens: number;
    total_screens: number;
    percentage: number;
}

export interface NavigateScreenResponse {
    session_id: number;
    current_screen: Screen;
    progress: SessionProgress;
}

export interface SubmitAnswerResponse {
    is_correct: boolean;
    points_earned: number;
    total_score: number;
    explanation?: string;
    correct_answer?: string;
}

export interface SubmitTimelineResponse {
    isCorrect: boolean;
    points_earned?: number;
    total_score?: number;
    correct_order?: string[];
}

export interface CollectClueResponse {
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
}

export interface CompleteLevelResponse {
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
}

// ==================== Rewards ====================
export interface Rewards {
    coins?: number;
    petals?: number;
    character?: string;
    badge?: string;
    museum_item?: number;
}

// ==================== Badge ====================
export interface Badge {
    id: number;
    name: string;
    description: string;
    icon: string;
    category: 'completion' | 'collection' | 'exploration' | 'achievement';
    earned_at?: string;
}

// ==================== Achievement ====================
export interface Achievement {
    id: number;
    name: string;
    description: string;
    progress: number;
    target: number;
    completed: boolean;
}

// ==================== Game Session ====================
export interface GameSession {
    session_id: number;
    level_id: number;
    user_id: number;
    current_screen_index: number;
    score: number;
    started_at: string;
    completed_at?: string;
}

// ==================== Leaderboard ====================
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

// ==================== Museum ====================
export interface Museum {
    is_open: boolean;
    level: number;
    income_per_hour: number;
    total_income_generated: number;
    pending_income: number;
    hours_accumulated: number;
    capped: boolean;
    characters: string[];
    artifacts: {
        artifact_id: number;
        name: string;
        image: string;
        acquired_at: string;
    }[];
    visitor_count: number;
    can_collect: boolean;
    next_collection_in: string;
}

export interface MuseumToggleResponse {
    is_open: boolean;
    income_per_hour: number;
}

export interface MuseumCollectResponse {
    collected: number;
    total_coins: number;
    total_museum_income: number;
    next_collection_in: string;
}

// ==================== Inventory ====================
export interface InventoryItem {
    item_id: number;
    name: string;
    type: string;
    quantity: number;
    acquired_at: string;
}

export interface ShopItem {
    id: number;
    name: string;
    description: string;
    type: 'hint' | 'boost' | 'cosmetic' | 'other';
    price: number;
    icon?: string;
}

export interface PurchaseItemResponse {
    item: {
        id: number;
        name: string;
        type: string;
    };
    quantity: number;
    total_cost: number;
    remaining_coins: number;
}

export interface UseItemResponse {
    item: {
        id: number;
        name: string;
    };
    effect: string;
}

// ==================== Scan ====================
export interface ScanObjectResponse {
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
}

// ==================== Constants ====================
export const SCREEN_TYPES = {
    DIALOGUE: 'DIALOGUE',
    HIDDEN_OBJECT: 'HIDDEN_OBJECT',
    QUIZ: 'QUIZ',
    TIMELINE: 'TIMELINE',
    IMAGE_VIEWER: 'IMAGE_VIEWER',
    VIDEO: 'VIDEO',
} as const;

export const CHAPTER_THEMES = {
    PINK: 'Văn hóa Đại Việt',
    GOLD: 'Thời Hoàng Kim',
    WHITE: 'Di Sản Bất Tử',
} as const;

export const BADGE_CATEGORIES = {
    COMPLETION: 'completion',
    COLLECTION: 'collection',
    EXPLORATION: 'exploration',
    ACHIEVEMENT: 'achievement',
} as const;

export type BadgeCategory = typeof BADGE_CATEGORIES[keyof typeof BADGE_CATEGORIES];

export const QUEST_TYPES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    ACHIEVEMENT: 'achievement',
    EXPLORATION: 'exploration',
} as const;

export type QuestType = typeof QUEST_TYPES[keyof typeof QUEST_TYPES];

export const LEVEL_DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
} as const;

export type LevelDifficulty = typeof LEVEL_DIFFICULTY[keyof typeof LEVEL_DIFFICULTY];

export const LEVEL_TYPES = {
    STORY: 'story',
    QUIZ: 'quiz',
    MIXED: 'mixed',
} as const;

export type LevelType = typeof LEVEL_TYPES[keyof typeof LEVEL_TYPES];

