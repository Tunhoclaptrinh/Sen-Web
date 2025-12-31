// Game System Types
export * from '../services/game.service';
export * from '../services/ai.service';
export * from '../services/learning.service';
export * from '../services/quest.service';
// Note: Exhibition types are in heritage.types.ts

// Screen Types
export const SCREEN_TYPES = {
    DIALOGUE: 'DIALOGUE',
    HIDDEN_OBJECT: 'HIDDEN_OBJECT',
    QUIZ: 'QUIZ',
    TIMELINE: 'TIMELINE',
    IMAGE_VIEWER: 'IMAGE_VIEWER',
    VIDEO: 'VIDEO',
} as const;

export type ScreenType = typeof SCREEN_TYPES[keyof typeof SCREEN_TYPES];

// Chapter Themes
export const CHAPTER_THEMES = {
    PINK: 'Văn hóa Đại Việt',
    GOLD: 'Thời Hoàng Kim',
    WHITE: 'Di Sản Bất Tử',
} as const;

// Badge Categories
export const BADGE_CATEGORIES = {
    COMPLETION: 'completion',
    COLLECTION: 'collection',
    EXPLORATION: 'exploration',
    ACHIEVEMENT: 'achievement',
} as const;

export type BadgeCategory = typeof BADGE_CATEGORIES[keyof typeof BADGE_CATEGORIES];

// Quest Types
export const QUEST_TYPES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    ACHIEVEMENT: 'achievement',
    EXPLORATION: 'exploration',
} as const;

export type QuestType = typeof QUEST_TYPES[keyof typeof QUEST_TYPES];

// Level Difficulty
export const LEVEL_DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
} as const;

export type LevelDifficulty = typeof LEVEL_DIFFICULTY[keyof typeof LEVEL_DIFFICULTY];

// Level Types
export const LEVEL_TYPES = {
    STORY: 'story',
    QUIZ: 'quiz',
    MIXED: 'mixed',
} as const;

export type LevelType = typeof LEVEL_TYPES[keyof typeof LEVEL_TYPES];
