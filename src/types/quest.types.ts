export interface QuestProgress {
    current_value: number;
    is_completed: boolean;
    is_claimed: boolean;
    status: 'in_progress' | 'completed' | 'claimed';
    started_at: string;
    completed_at?: string;
    claimed_at?: string;
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
