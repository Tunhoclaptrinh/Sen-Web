export const USER_ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
  RESEARCHER: "researcher",
  CURATOR: "curator",
} as const;

// Storage keys used across the app
export const STORAGE_KEYS = {
  TOKEN: "sen_token",
  USER: "sen_user",
} as const;

export const HERITAGE_TYPES = {
  MONUMENT: "monument",
  TEMPLE: "temple",
  MUSEUM: "museum",
  ARCHAEOLOGICAL_SITE: "archaeologicalSite",
  HISTORIC_BUILDING: "historicBuilding",
  NATURAL_HERITAGE: "naturalHeritage",
  INTANGIBLE_HERITAGE: "intangibleHeritage",
} as const;

export const HERITAGE_TYPE_LABELS = {
  [HERITAGE_TYPES.MONUMENT]: "Di tích",
  [HERITAGE_TYPES.TEMPLE]: "Đền chùa",
  [HERITAGE_TYPES.MUSEUM]: "Bảo tàng",
  [HERITAGE_TYPES.ARCHAEOLOGICAL_SITE]: "Khu khảo cổ",
  [HERITAGE_TYPES.HISTORIC_BUILDING]: "Công trình lịch sử",
  [HERITAGE_TYPES.NATURAL_HERITAGE]: "Di sản thiên nhiên",
  [HERITAGE_TYPES.INTANGIBLE_HERITAGE]: "Di sản phi vật thể",
} as const;

export const ARTIFACT_TYPES = {
  SCULPTURE: "sculpture",
  PAINTING: "painting",
  DOCUMENT: "document",
  POTTERY: "pottery",
  TEXTILE: "textile",
  TOOL: "tool",
  WEAPON: "weapon",
  JEWELRY: "jewelry",
  MANUSCRIPT: "manuscript",
  PHOTOGRAPH: "photograph",
  OTHER: "other",
} as const;

export const ARTIFACT_TYPE_LABELS = {
  [ARTIFACT_TYPES.SCULPTURE]: "Điêu khắc",
  [ARTIFACT_TYPES.PAINTING]: "Tranh vẽ",
  [ARTIFACT_TYPES.DOCUMENT]: "Tài liệu",
  [ARTIFACT_TYPES.POTTERY]: "Gốm sứ",
  [ARTIFACT_TYPES.TEXTILE]: "Dệt may",
  [ARTIFACT_TYPES.TOOL]: "Công cụ",
  [ARTIFACT_TYPES.WEAPON]: "Vũ khí",
  [ARTIFACT_TYPES.JEWELRY]: "Trang sức",
  [ARTIFACT_TYPES.MANUSCRIPT]: "Bản thảo",
  [ARTIFACT_TYPES.PHOTOGRAPH]: "Ảnh",
  [ARTIFACT_TYPES.OTHER]: "Khác",
} as const;

export const ARTIFACT_CONDITIONS = {
  EXCELLENT: "excellent",
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor",
} as const;

export const CONDITION_LABELS = {
  [ARTIFACT_CONDITIONS.EXCELLENT]: "Tuyệt vời",
  [ARTIFACT_CONDITIONS.GOOD]: "Tốt",
  [ARTIFACT_CONDITIONS.FAIR]: "Khá",
  [ARTIFACT_CONDITIONS.POOR]: "Kém",
} as const;

export const SIGNIFICANCE_LEVELS = {
  LOCAL: "local",
  NATIONAL: "national",
  INTERNATIONAL: "international",
} as const;

export const SIGNIFICANCE_LABELS = {
  [SIGNIFICANCE_LEVELS.LOCAL]: "Địa phương",
  [SIGNIFICANCE_LEVELS.NATIONAL]: "Quốc gia",
  [SIGNIFICANCE_LEVELS.INTERNATIONAL]: "Quốc tế",
} as const;

export const REGIONS = [
  "Hà Nội",
  "Hải Phòng",
  "Quảng Ninh",
  "Ninh Bình",
  "Thanh Hóa",
  "Nghệ An",
  "Huế",
  "Đà Nẵng",
  "Quảng Nam",
  "Quảng Ngãi",
  "Khánh Hòa",
  "Lâm Đồng",
  "TP. Hồ Chí Minh",
  "An Giang",
  "Cần Thơ",
] as const;

export const TIMELINE_CATEGORIES = {
  FOUNDED: "founded",
  DAMAGED: "damaged",
  RESTORED: "restored",
  DISCOVERY: "discovery",
  EVENT: "event",
  RECOGNITION: "recognition",
} as const;

export const TIMELINE_CATEGORY_LABELS = {
  [TIMELINE_CATEGORIES.FOUNDED]: "Thành lập",
  [TIMELINE_CATEGORIES.DAMAGED]: "Hư hại",
  [TIMELINE_CATEGORIES.RESTORED]: "Tu bổ",
  [TIMELINE_CATEGORIES.DISCOVERY]: "Phát hiện",
  [TIMELINE_CATEGORIES.EVENT]: "Sự kiện",
  [TIMELINE_CATEGORIES.RECOGNITION]: "Công nhận",
} as const;

export const PAGINATION_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

// Game System Constants
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

export const QUEST_TYPES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  ACHIEVEMENT: "achievement",
  EXPLORATION: "exploration",
} as const;

export const LEVEL_DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export const LEVEL_TYPES = {
  STORY: "story",
  QUIZ: "quiz",
  MIXED: "mixed",
} as const;

export const PETAL_STATES = {
  CLOSED: "closed",
  BLOOMING: "blooming",
  FULL: "full",
} as const;

// Type exports
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type HeritageType = (typeof HERITAGE_TYPES)[keyof typeof HERITAGE_TYPES];
export type ArtifactType = (typeof ARTIFACT_TYPES)[keyof typeof ARTIFACT_TYPES];
export type ArtifactCondition =
  (typeof ARTIFACT_CONDITIONS)[keyof typeof ARTIFACT_CONDITIONS];
export type SignificanceLevel =
  (typeof SIGNIFICANCE_LEVELS)[keyof typeof SIGNIFICANCE_LEVELS];
export type TimelineCategory =
  (typeof TIMELINE_CATEGORIES)[keyof typeof TIMELINE_CATEGORIES];
export type ScreenType = (typeof SCREEN_TYPES)[keyof typeof SCREEN_TYPES];
export type BadgeCategory = (typeof BADGE_CATEGORIES)[keyof typeof BADGE_CATEGORIES];
export type QuestType = (typeof QUEST_TYPES)[keyof typeof QUEST_TYPES];
export type LevelDifficulty = (typeof LEVEL_DIFFICULTY)[keyof typeof LEVEL_DIFFICULTY];
export type LevelType = (typeof LEVEL_TYPES)[keyof typeof LEVEL_TYPES];
export type PetalState = (typeof PETAL_STATES)[keyof typeof PETAL_STATES];

