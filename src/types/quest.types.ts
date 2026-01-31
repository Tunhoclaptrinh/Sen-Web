export interface QuestProgress {
    currentValue: number;
    isCompleted: boolean;
    isClaimed: boolean;
    status: 'inProgress' | 'completed' | 'claimed';
    startedAt: string;
    completedAt?: string;
    claimedAt?: string;
}

export interface QuestRewards {
    coins?: number;
    petals?: number;
    experience?: number;
    badge?: string;
}

export interface QuestRequirement {
    type: string;
    target: number;
    description: string;
}

export interface Quest {
    id: number;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'achievement' | 'exploration';
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    requirements: QuestRequirement[];
    rewards: QuestRewards;
    thumbnail?: string;
    progress?: QuestProgress | null;
}
