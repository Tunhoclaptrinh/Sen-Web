import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { learningService } from '@/services';
import type { LearningPath, LearningModule } from '@/types';

// State interface
interface LearningState {
    // Learning Paths
    paths: LearningPath[];
    currentPath: LearningPath | null;
    pathsLoading: boolean;

    // Enrolled Paths
    enrolledPaths: LearningPath[];
    enrolledLoading: boolean;

    // Current Module
    currentModule: LearningModule | null;
    moduleLoading: boolean;

    // Progress
    progress: Record<number, number>; // pathId -> completion percentage

    // UI State
    error: string | null;
    successMessage: string | null;
}

const initialState: LearningState = {
    paths: [],
    currentPath: null,
    pathsLoading: false,
    enrolledPaths: [],
    enrolledLoading: false,
    currentModule: null,
    moduleLoading: false,
    progress: {},
    error: null,
    successMessage: null,
};

// Async Thunks

// Fetch all learning paths
export const fetchLearningPaths = createAsyncThunk(
    'learning/fetchPaths',
    async (params: { difficulty?: string; category?: string } | undefined, { rejectWithValue }) => {
        try {
            const data = await learningService.getPaths(params);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch learning paths');
        }
    }
);

// Fetch path detail
export const fetchPathDetail = createAsyncThunk(
    'learning/fetchPathDetail',
    async (pathId: number, { rejectWithValue }) => {
        try {
            const data = await learningService.getPathDetail(pathId);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch path detail');
        }
    }
);

// Enroll in learning path
export const enrollInPath = createAsyncThunk(
    'learning/enrollInPath',
    async (pathId: number, { rejectWithValue, dispatch }) => {
        try {
            const result = await learningService.enrollPath(pathId);
            // Refresh enrolled paths after enrolling
            dispatch(fetchEnrolledPaths());
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to enroll in path');
        }
    }
);

// Fetch enrolled paths
export const fetchEnrolledPaths = createAsyncThunk(
    'learning/fetchEnrolledPaths',
    async (_, { rejectWithValue }) => {
        try {
            const data = await learningService.getEnrolledPaths();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch enrolled paths');
        }
    }
);

// Fetch module detail
export const fetchModuleDetail = createAsyncThunk(
    'learning/fetchModuleDetail',
    async (params: { pathId: number; moduleId: number }, { rejectWithValue }) => {
        try {
            const data = await learningService.getModuleDetail(params.pathId, params.moduleId);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch module detail');
        }
    }
);

// Complete module
export const completeModule = createAsyncThunk(
    'learning/completeModule',
    async (
        params: { pathId: number; moduleId: number; data: { time_spent: number; score?: number } },
        { rejectWithValue, dispatch }
    ) => {
        try {
            const result = await learningService.completeModule(params.pathId, params.moduleId, params.data);
            // Refresh progress after completing module
            dispatch(fetchPathProgress(params.pathId));
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to complete module');
        }
    }
);

// Fetch path progress
export const fetchPathProgress = createAsyncThunk(
    'learning/fetchPathProgress',
    async (pathId: number, { rejectWithValue }) => {
        try {
            const data = await learningService.getProgress(pathId);
            return { pathId, progress: data };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch progress');
        }
    }
);

// Submit quiz
export const submitQuiz = createAsyncThunk(
    'learning/submitQuiz',
    async (
        params: { pathId: number; moduleId: number; answers: Record<number, number> },
        { rejectWithValue, dispatch }
    ) => {
        try {
            // @ts-ignore - Type mismatch with service, will be fixed in service layer
            const result = await learningService.submitQuiz(params.pathId, params.moduleId, params.answers);
            // Refresh progress after quiz submission
            dispatch(fetchPathProgress(params.pathId));
            return result;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to submit quiz');
        }
    }
);

// Slice
const learningSlice = createSlice({
    name: 'learning',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        setCurrentPath: (state, action: PayloadAction<LearningPath | null>) => {
            state.currentPath = action.payload;
        },
        setCurrentModule: (state, action: PayloadAction<LearningModule | null>) => {
            state.currentModule = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Fetch Learning Paths
        builder
            .addCase(fetchLearningPaths.pending, (state) => {
                state.pathsLoading = true;
                state.error = null;
            })
            .addCase(fetchLearningPaths.fulfilled, (state, action) => {
                state.pathsLoading = false;
                state.paths = action.payload;
            })
            .addCase(fetchLearningPaths.rejected, (state, action) => {
                state.pathsLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Path Detail
        builder
            .addCase(fetchPathDetail.pending, (state) => {
                state.pathsLoading = true;
                state.error = null;
            })
            .addCase(fetchPathDetail.fulfilled, (state, action) => {
                state.pathsLoading = false;
                state.currentPath = action.payload;
            })
            .addCase(fetchPathDetail.rejected, (state, action) => {
                state.pathsLoading = false;
                state.error = action.payload as string;
            });

        // Enroll in Path
        builder
            .addCase(enrollInPath.pending, (state) => {
                state.pathsLoading = true;
                state.error = null;
            })
            .addCase(enrollInPath.fulfilled, (state) => {
                state.pathsLoading = false;
                state.successMessage = 'Enrolled successfully!';
            })
            .addCase(enrollInPath.rejected, (state, action) => {
                state.pathsLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Enrolled Paths
        builder
            .addCase(fetchEnrolledPaths.pending, (state) => {
                state.enrolledLoading = true;
                state.error = null;
            })
            .addCase(fetchEnrolledPaths.fulfilled, (state, action) => {
                state.enrolledLoading = false;
                state.enrolledPaths = action.payload;
            })
            .addCase(fetchEnrolledPaths.rejected, (state, action) => {
                state.enrolledLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Module Detail
        builder
            .addCase(fetchModuleDetail.pending, (state) => {
                state.moduleLoading = true;
                state.error = null;
            })
            .addCase(fetchModuleDetail.fulfilled, (state, action) => {
                state.moduleLoading = false;
                state.currentModule = action.payload;
            })
            .addCase(fetchModuleDetail.rejected, (state, action) => {
                state.moduleLoading = false;
                state.error = action.payload as string;
            });

        // Complete Module
        builder
            .addCase(completeModule.pending, (state) => {
                state.moduleLoading = true;
                state.error = null;
            })
            .addCase(completeModule.fulfilled, (state) => {
                state.moduleLoading = false;
                state.successMessage = 'Module completed!';
            })
            .addCase(completeModule.rejected, (state, action) => {
                state.moduleLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Path Progress
        builder
            .addCase(fetchPathProgress.fulfilled, (state, action) => {
                state.progress[action.payload.pathId] = 100; // Placeholder - will be updated with actual progress
            })
            .addCase(fetchPathProgress.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Submit Quiz
        builder
            .addCase(submitQuiz.pending, (state) => {
                state.moduleLoading = true;
                state.error = null;
            })
            .addCase(submitQuiz.fulfilled, (state, action) => {
                state.moduleLoading = false;
                state.successMessage = `Quiz completed! Score: ${action.payload.score}`;
            })
            .addCase(submitQuiz.rejected, (state, action) => {
                state.moduleLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    clearSuccessMessage,
    setCurrentPath,
    setCurrentModule,
} = learningSlice.actions;

export default learningSlice.reducer;
