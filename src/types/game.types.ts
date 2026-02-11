// ============================================
// Game System Types
// ============================================

// Re-export from other services
export * from "../services/ai.service";
export * from "../services/learning.service";

// ==================== Game Progress ====================
export interface GameProgress {
  userId: number;
  level: number;
  totalPoints: number;
  coins: number;
  totalSenPetals: number;
  unlockedChapters: number[];
  completedLevels: number[];
  collectedCharacters: string[];
  badges: Badge[];
  achievements: Achievement[];
  museumOpen: boolean;
  museumIncome: number;
  streakDays: number;
  lastRewardClaim: string | null;
  currentRank: string;
  rankIcon: string;
  nextRankName: string | null;
  pointsToNextRank: number;
  progressPercent: number;
  stats: {
    completionRate: number;
    chaptersUnlocked: number;
    totalChapters: number;
    charactersCollected: number;
    totalBadges: number;
  };
}

// ==================== Chapter (Sen Flower) ====================
export interface Chapter {
  id: number;
  name: string;
  description: string;
  theme: string;
  order: number;
  petalState: "closed" | "blooming" | "full" | "locked";
  color: string;
  image?: string;
  requiredPetals: number;
  totalLevels: number;
  completedLevels: number;
  completionRate: number;
  canUnlock: boolean;
  isActive: boolean;
  levels?: Level[];
}

// ==================== Level ====================
export interface Level {
  id: number;
  chapterId: number;
  name: string;
  description: string;
  type: "story" | "quiz" | "mixed";
  difficulty: "easy" | "medium" | "hard";
  order: number;
  backgroundImage?: string;
  thumbnail?: string; // Keeping as optional/legacy just in case, but prefer backgroundImage
  isCompleted: boolean;
  isLocked: boolean;
  playerBestScore?: number;
  playCount?: number;
  rewards: Rewards;
  timeLimit?: number;
  passingScore?: number;
  requiredLevel?: number | null;
  totalScreens?: number;
  screens?: Screen[];
  knowledgeBase?: string;
  backgroundMusic?: string;
}

// ==================== Screen Types ====================
export type ScreenType = "DIALOGUE" | "HIDDEN_OBJECT" | "QUIZ" | "TIMELINE" | "IMAGE_VIEWER" | "VIDEO";

export interface Screen {
  id: string;
  type: ScreenType;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  backgroundImage?: string;
  skipAllowed?: boolean;
  content?: any; // Varies by screen type
  potentialScore?: number; // ⚡ Max points available for this screen
  isCompleted?: boolean;
}

// Dialogue Screen
export interface DialogueScreen extends Screen {
  type: "DIALOGUE";
  content: Array<{
    speaker: "AI" | "USER" | "NARRATOR";
    text: string;
    avatar?: string;
    emotion?: string;
    audio?: string; // Base64 audio string
  }>;
}

// Quiz Screen
export interface QuizScreen extends Screen {
  type: "QUIZ";
  question?: string;
  description?: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  timeLimit?: number;
  points?: number;
}

// Timeline Screen
export interface TimelineScreen extends Screen {
  type: "TIMELINE";
  events: Array<{
    id: string;
    title: string;
    year: number;
    description: string;
  }>;
  correctOrder: string[];
}

// Hidden Object Screen
export interface HiddenObjectScreen extends Screen {
  type: "HIDDEN_OBJECT";
  backgroundImage: string;
  description?: string;
  items: Array<{
    id: string;
    name: string;
    image?: string;
    coordinates?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    // Legacy support if needed
    x?: number;
    y?: number;
    factPopup: string;
  }>;
  requiredItems: number;
  guideText?: string;
}

// ==================== Session Responses ====================
export interface SessionProgress {
  completedScreens: number;
  totalScreens: number;
  percentage: number;
}

export interface NavigateScreenResponse {
  sessionId: number;
  currentScreen: Screen;
  progress: SessionProgress;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  pointsEarned: number;
  totalScore: number;
  explanation?: string;
  correctAnswer?: string;
}

export interface SubmitTimelineResponse {
  isCorrect: boolean;
  pointsEarned?: number;
  totalScore?: number;
  correctOrder?: string[];
}

export interface CollectClueResponse {
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
}

export interface CompleteLevelResponse {
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
}

// ==================== Rewards ====================
export interface Rewards {
  coins?: number;
  petals?: number;
  character?: string;
  badge?: string;
  museumItem?: number;
}

// ==================== Badge ====================
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: "completion" | "collection" | "exploration" | "achievement";
  earnedAt?: string;
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
  sessionId: number;
  levelId: number;
  userId: number;
  currentScreenIndex: number;
  score: number;
  startedAt: string;
  completedAt?: string;
}

// ==================== Leaderboard ====================
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  totalPoints: number;
  level: number;
  senPetals: number;
  charactersCount: number;
}

// ==================== Museum ====================
export interface Museum {
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
}

export interface MuseumToggleResponse {
  isOpen: boolean;
  incomePerHour: number;
}

export interface MuseumCollectResponse {
  collected: number;
  totalCoins: number;
  totalMuseumIncome: number;
  nextCollectionIn: string;
}

// ==================== Inventory ====================
export interface InventoryItem {
  itemId: number;
  name: string;
  type: string;
  quantity: number;
  acquiredAt: string;
}

export interface ShopItem {
  id: number;
  name: string;
  description: string;
  type: "hint" | "boost" | "cosmetic" | "premiumAi" | "character" | "characterSkin" | "theme" | "decoration" | "other";
  price: number;
  currency: "coins" | "petals";
  image?: string;
  icon?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  isConsumable: boolean;
  maxStack?: number;
  createdAt?: string;
}

export interface PurchaseItemResponse {
  item: {
    id: number;
    name: string;
    type: string;
  };
  quantity: number;
  totalCost: number;
  remainingCoins: number;
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
  newTotals: {
    coins: number;
    petals: number;
  };
  isNewDiscovery: boolean;
}

// ==================== Constants ====================
export const SCREEN_TYPES = {
  DIALOGUE: "DIALOGUE",
  HIDDEN_OBJECT: "HIDDEN_OBJECT",
  QUIZ: "QUIZ",
  TIMELINE: "TIMELINE",
  IMAGE_VIEWER: "IMAGE_VIEWER",
  VIDEO: "VIDEO",
} as const;

export const CHAPTER_THEMES = {
  PINK: "Văn hóa Đại Việt",
  GOLD: "Thời Hoàng Kim",
  WHITE: "Di Sản Bất Tử",
} as const;

export const BADGE_CATEGORIES = {
  COMPLETION: "completion",
  COLLECTION: "collection",
  EXPLORATION: "exploration",
  ACHIEVEMENT: "achievement",
} as const;

export type BadgeCategory = (typeof BADGE_CATEGORIES)[keyof typeof BADGE_CATEGORIES];

export const QUEST_TYPES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  ACHIEVEMENT: "achievement",
  EXPLORATION: "exploration",
} as const;

export type QuestType = (typeof QUEST_TYPES)[keyof typeof QUEST_TYPES];

export const LEVEL_DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export type LevelDifficulty = (typeof LEVEL_DIFFICULTY)[keyof typeof LEVEL_DIFFICULTY];

export const LEVEL_TYPES = {
  STORY: "story",
  QUIZ: "quiz",
  MIXED: "mixed",
} as const;

export type LevelType = (typeof LEVEL_TYPES)[keyof typeof LEVEL_TYPES];
