import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { questService } from '@/services';
import type { Quest } from '@/types';

// State interface
interface QuestState {
    // All Quests
    quests: Quest[];
    questsLoading: boolean;

    // Active Quests
    activeQuests: Quest[];
    activeLoading: boolean;

    // Daily Quests
    dailyQuests: Quest[];
    dailyLoading: boolean;

    // Current Quest
    currentQuest: Quest | null;

    // Quest History
    history: Quest[];
    historyLoading: boolean;

    // UI State
    error: string | null;
    successMessage: string | null;
}

const initialState: QuestState = {
    quests: [],
    questsLoading: false,
    activeQuests: [],
    activeLoading: false,
    dailyQuests: [],
    dailyLoading: false,
    currentQuest: null,
    history: [],
    historyLoading: false,
    error: null,
    successMessage: null,
};

// Async Thunks

// Fetch all quests
export const fetchQuests = createAsyncThunk(
    'quest/fetchQuests',
    async (params: { type?: string; status?: string } | undefined, { rejectWithValue }) => {
        try {
            const data = await questService.getQuests(params);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch quests');
        }
    }
);

// Fetch active quests
export const fetchActiveQuests = createAsyncThunk(
    'quest/fetchActiveQuests',
    async (_, { rejectWithValue }) => {
        try {
            const data = await questService.getActiveQuests();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch active quests');
        }
    }
);

// Fetch daily quests
export const fetchDailyQuests = createAsyncThunk(
    'quest/fetchDailyQuests',
    async (_, { rejectWithValue }) => {
        try {
            const data = await questService.getDailyQuests();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch daily quests');
        }
    }
);

// Fetch quest detail
export const fetchQuestDetail = createAsyncThunk(
    'quest/fetchQuestDetail',
    async (questId: number, { rejectWithValue }) => {
        try {
            const data = await questService.getQuestDetail(questId);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch quest detail');
        }
    }
);

// Start quest
export const startQuest = createAsyncThunk(
    'quest/startQuest',
    async (questId: number, { rejectWithValue, dispatch }) => {
        try {
            const result = await questService.startQuest(questId);
            // Refresh active quests after starting
            dispatch(fetchActiveQuests());
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to start quest');
        }
    }
);

// Update quest progress
export const updateQuestProgress = createAsyncThunk(
    'quest/updateProgress',
    async (
        params: { questId: number; data: { progress: number; metadata?: any } },
        { rejectWithValue, dispatch }
    ) => {
        try {
            const result = await questService.updateProgress(params.questId, params.data as any);
            // Refresh quest detail after updating progress
            dispatch(fetchQuestDetail(params.questId));
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update progress');
        }
    }
);

// Complete quest
export const completeQuest = createAsyncThunk(
    'quest/completeQuest',
    async (questId: number, { rejectWithValue, dispatch }) => {
        try {
            const result = await questService.completeQuest(questId);
            // Refresh active quests after completing
            dispatch(fetchActiveQuests());
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to complete quest');
        }
    }
);

// Claim quest rewards
export const claimQuestRewards = createAsyncThunk(
    'quest/claimRewards',
    async (questId: number, { rejectWithValue, dispatch }) => {
        try {
            const result = await questService.claimRewards(questId);
            // Refresh active quests after claiming rewards
            dispatch(fetchActiveQuests());
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to claim rewards');
        }
    }
);

// Fetch quest history
export const fetchQuestHistory = createAsyncThunk(
    'quest/fetchHistory',
    async (limit: number = 20, { rejectWithValue }) => {
        try {
            const data = await questService.getQuestHistory(limit);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch quest history');
        }
    }
);

// Slice
const questSlice = createSlice({
    name: 'quest',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        setCurrentQuest: (state, action: PayloadAction<Quest | null>) => {
            state.currentQuest = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Fetch Quests
        builder
            .addCase(fetchQuests.pending, (state) => {
                state.questsLoading = true;
                state.error = null;
            })
            .addCase(fetchQuests.fulfilled, (state, action) => {
                state.questsLoading = false;
                state.quests = action.payload;
            })
            .addCase(fetchQuests.rejected, (state, action) => {
                state.questsLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Active Quests
        builder
            .addCase(fetchActiveQuests.pending, (state) => {
                state.activeLoading = true;
                state.error = null;
            })
            .addCase(fetchActiveQuests.fulfilled, (state, action) => {
                state.activeLoading = false;
                state.activeQuests = action.payload;
            })
            .addCase(fetchActiveQuests.rejected, (state, action) => {
                state.activeLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Daily Quests
        builder
            .addCase(fetchDailyQuests.pending, (state) => {
                state.dailyLoading = true;
                state.error = null;
            })
            .addCase(fetchDailyQuests.fulfilled, (state, action) => {
                state.dailyLoading = false;
                state.dailyQuests = action.payload;
            })
            .addCase(fetchDailyQuests.rejected, (state, action) => {
                state.dailyLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Quest Detail
        builder
            .addCase(fetchQuestDetail.pending, (state) => {
                state.questsLoading = true;
                state.error = null;
            })
            .addCase(fetchQuestDetail.fulfilled, (state, action) => {
                state.questsLoading = false;
                state.currentQuest = action.payload;
            })
            .addCase(fetchQuestDetail.rejected, (state, action) => {
                state.questsLoading = false;
                state.error = action.payload as string;
            });

        // Start Quest
        builder
            .addCase(startQuest.pending, (state) => {
                state.questsLoading = true;
                state.error = null;
            })
            .addCase(startQuest.fulfilled, (state) => {
                state.questsLoading = false;
                state.successMessage = 'Quest started!';
            })
            .addCase(startQuest.rejected, (state, action) => {
                state.questsLoading = false;
                state.error = action.payload as string;
            });

        // Update Quest Progress
        builder
            .addCase(updateQuestProgress.fulfilled, (state) => {
                state.successMessage = 'Progress updated!';
            })
            .addCase(updateQuestProgress.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Complete Quest
        builder
            .addCase(completeQuest.pending, (state) => {
                state.questsLoading = true;
                state.error = null;
            })
            .addCase(completeQuest.fulfilled, (state) => {
                state.questsLoading = false;
                state.successMessage = 'Quest completed!';
            })
            .addCase(completeQuest.rejected, (state, action) => {
                state.questsLoading = false;
                state.error = action.payload as string;
            });

        // Claim Quest Rewards
        builder
            .addCase(claimQuestRewards.fulfilled, (state) => {
                state.successMessage = 'Rewards claimed!';
            })
            .addCase(claimQuestRewards.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Fetch Quest History
        builder
            .addCase(fetchQuestHistory.pending, (state) => {
                state.historyLoading = true;
                state.error = null;
            })
            .addCase(fetchQuestHistory.fulfilled, (state, action) => {
                state.historyLoading = false;
                state.history = action.payload;
            })
            .addCase(fetchQuestHistory.rejected, (state, action) => {
                state.historyLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    clearSuccessMessage,
    setCurrentQuest,
} = questSlice.actions;

export default questSlice.reducer;
