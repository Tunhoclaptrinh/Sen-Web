import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { questService } from '@/services';
import type { Quest } from '@/types/quest.types';

// State interface
export interface QuestState {
    activeQuests: Quest[];
    activeLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: QuestState = {
    activeQuests: [],
    activeLoading: false,
    error: null,
    successMessage: null,
};

// Async Thunks

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

// Start quest
export const startQuest = createAsyncThunk(
    'quest/startQuest',
    async (questId: number, { rejectWithValue, dispatch }) => {
        try {
            const result = await questService.startQuest(questId);
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
        params: { questId: number; progress: number },
        { rejectWithValue, dispatch }
    ) => {
        try {
            const result = await questService.updateProgress(params.questId, params.progress);
            dispatch(fetchActiveQuests());
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
            dispatch(fetchActiveQuests());
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to claim rewards');
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
    },
    extraReducers: (builder) => {
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

        // Start Quest
        builder
            .addCase(startQuest.fulfilled, (state) => {
                state.successMessage = 'Nhiệm vụ đã được chấp nhận!';
            })
            .addCase(startQuest.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Update Quest Progress
        builder
            .addCase(updateQuestProgress.fulfilled, () => {
                // Progress updated silently or show message
            })
            .addCase(updateQuestProgress.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Complete Quest
        builder
            .addCase(completeQuest.fulfilled, (state) => {
                state.successMessage = 'Chúc mừng! Bạn đã hoàn thành nhiệm vụ!';
            })
            .addCase(completeQuest.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Claim Quest Rewards
        builder
            .addCase(claimQuestRewards.fulfilled, () => {
                // Handled in UI components to avoid duplicates
            })
            .addCase(claimQuestRewards.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    clearSuccessMessage,
} = questSlice.actions;

export default questSlice.reducer;
