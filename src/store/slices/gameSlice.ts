import {createSlice, createAsyncThunk, PayloadAction} from "@reduxjs/toolkit";
import {gameService} from "@/services";
import type {GameProgress, Chapter, Level, GameSession, LeaderboardEntry, Badge, Museum} from "@/types";

// State interface
interface GameState {
  // Progress
  progress: GameProgress | null;
  progressLoading: boolean;

  // Chapters
  chapters: Chapter[];
  currentChapter: Chapter | null;
  chaptersLoading: boolean;

  // Levels
  levels: Level[];
  currentLevel: Level | null;
  levelsLoading: boolean;

  // Game Session
  currentSession: GameSession | null;
  sessionLoading: boolean;

  // Leaderboard
  leaderboard: LeaderboardEntry[];
  leaderboardLoading: boolean;

  // Museum
  museum: Museum | null;
  museumLoading: boolean;

  // Badges
  badges: Badge[];
  badgesLoading: boolean;

  // UI State
  error: string | null;
  successMessage: string | null;
}

const initialState: GameState = {
  progress: null,
  progressLoading: false,
  chapters: [],
  currentChapter: null,
  chaptersLoading: false,
  levels: [],
  currentLevel: null,
  levelsLoading: false,
  currentSession: null,
  sessionLoading: false,
  leaderboard: [],
  leaderboardLoading: false,
  museum: null,
  museumLoading: false,
  badges: [],
  badgesLoading: false,
  error: null,
  successMessage: null,
};

// Async Thunks

// Fetch user progress
export const fetchProgress = createAsyncThunk("game/fetchProgress", async (_, {rejectWithValue}) => {
  try {
    const data = await gameService.getProgress();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch progress");
  }
});

// Fetch chapters
export const fetchChapters = createAsyncThunk("game/fetchChapters", async (_, {rejectWithValue}) => {
  try {
    const data = await gameService.getChapters();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch chapters");
  }
});

// Fetch chapter detail
export const fetchChapterDetail = createAsyncThunk(
  "game/fetchChapterDetail",
  async (chapterId: number, {rejectWithValue}) => {
    try {
      const data = await gameService.getChapterDetail(chapterId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch chapter detail");
    }
  },
);

// Unlock chapter
export const unlockChapter = createAsyncThunk(
  "game/unlockChapter",
  async (chapterId: number, {rejectWithValue, dispatch}) => {
    try {
      const result = await gameService.unlockChapter(chapterId);
      // Refresh progress and chapters after unlocking
      dispatch(fetchProgress());
      dispatch(fetchChapters());
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to unlock chapter");
    }
  },
);

// Fetch levels by chapter
export const fetchLevelsByChapter = createAsyncThunk(
  "game/fetchLevelsByChapter",
  async (chapterId: number, {rejectWithValue}) => {
    try {
      const data = await gameService.getLevelsByChapter(chapterId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch levels");
    }
  },
);

// Fetch level detail
export const fetchLevelDetail = createAsyncThunk(
  "game/fetchLevelDetail",
  async (levelId: number, {rejectWithValue}) => {
    try {
      const data = await gameService.getLevelDetail(levelId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch level detail");
    }
  },
);

// Start level
export const startLevel = createAsyncThunk("game/startLevel", async (levelId: number, {rejectWithValue}) => {
  try {
    const data = await gameService.startLevel(levelId);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to start level");
  }
});

// Complete level
export const completeLevel = createAsyncThunk(
  "game/completeLevel",
  async (payload: {levelId: number; score: number; timeSpent: number}, {rejectWithValue, dispatch}) => {
    try {
      const result = await gameService.completeLevel(payload.levelId, payload.score, payload.timeSpent);
      // Refresh progress and chapters after completing level
      dispatch(fetchProgress());
      dispatch(fetchChapters());
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to complete level");
    }
  },
);

// Fetch leaderboard
export const fetchLeaderboard = createAsyncThunk(
  "game/fetchLeaderboard",
  async (params: {type?: "global" | "weekly" | "monthly"; limit?: number} = {}, {rejectWithValue}) => {
    try {
      const data = await gameService.getLeaderboard(params.type, params.limit);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch leaderboard");
    }
  },
);

// Claim daily reward
export const claimDailyReward = createAsyncThunk("game/claimDailyReward", async (_, {rejectWithValue, dispatch}) => {
  try {
    const result = await gameService.claimDailyReward();
    // Refresh progress after claiming reward
    dispatch(fetchProgress());
    return result;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to claim daily reward");
  }
});

// Fetch museum
export const fetchMuseum = createAsyncThunk("game/fetchMuseum", async (_, {rejectWithValue}) => {
  try {
    const data = await gameService.getMuseum();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch museum");
  }
});

// Fetch badges
export const fetchBadges = createAsyncThunk("game/fetchBadges", async (_, {rejectWithValue}) => {
  try {
    const data = await gameService.getBadges();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch badges");
  }
});

// Collect Museum Income
export const collectMuseumIncome = createAsyncThunk(
  "game/collectMuseumIncome",
  async (_, {rejectWithValue, dispatch}) => {
    try {
      const data = await gameService.collectMuseumIncome();
      // Refresh progress to update coins
      dispatch(fetchProgress());
      // Refresh museum data
      dispatch(fetchMuseum());
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to collect income");
    }
  },
);

// Use Item
export const useItem = createAsyncThunk(
  "game/useItem",
  async (payload: {itemId: number; targetId?: number}, {rejectWithValue, dispatch}) => {
    try {
      const data = await gameService.useItem(payload.itemId, payload.targetId);
      // Refresh progress and museum/inventory after use
      dispatch(fetchProgress());
      dispatch(fetchMuseum());
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to use item");
    }
  },
);

// Slice
const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentChapter: (state, action: PayloadAction<Chapter | null>) => {
      state.currentChapter = action.payload;
    },
    setCurrentLevel: (state, action: PayloadAction<Level | null>) => {
      state.currentLevel = action.payload;
    },
    clearSession: (state) => {
      state.currentSession = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Progress
    builder
      .addCase(fetchProgress.pending, (state) => {
        state.progressLoading = true;
        state.error = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.progressLoading = false;
        state.progress = action.payload;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.progressLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Chapters
    builder
      .addCase(fetchChapters.pending, (state) => {
        state.chaptersLoading = true;
        state.error = null;
      })
      .addCase(fetchChapters.fulfilled, (state, action) => {
        state.chaptersLoading = false;
        state.chapters = action.payload;
      })
      .addCase(fetchChapters.rejected, (state, action) => {
        state.chaptersLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Chapter Detail
    builder
      .addCase(fetchChapterDetail.pending, (state) => {
        state.chaptersLoading = true;
        state.error = null;
      })
      .addCase(fetchChapterDetail.fulfilled, (state, action) => {
        state.chaptersLoading = false;
        state.currentChapter = action.payload;
      })
      .addCase(fetchChapterDetail.rejected, (state, action) => {
        state.chaptersLoading = false;
        state.error = action.payload as string;
      });

    // Unlock Chapter
    builder
      .addCase(unlockChapter.pending, (state) => {
        state.chaptersLoading = true;
        state.error = null;
      })
      .addCase(unlockChapter.fulfilled, (state, action) => {
        state.chaptersLoading = false;
        state.successMessage = action.payload.message || "Chapter unlocked!";
      })
      .addCase(unlockChapter.rejected, (state, action) => {
        state.chaptersLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Levels
    builder
      .addCase(fetchLevelsByChapter.pending, (state) => {
        state.levelsLoading = true;
        state.error = null;
      })
      .addCase(fetchLevelsByChapter.fulfilled, (state, action) => {
        state.levelsLoading = false;
        state.levels = action.payload;
      })
      .addCase(fetchLevelsByChapter.rejected, (state, action) => {
        state.levelsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Level Detail
    builder
      .addCase(fetchLevelDetail.pending, (state) => {
        state.levelsLoading = true;
        state.error = null;
      })
      .addCase(fetchLevelDetail.fulfilled, (state, action) => {
        state.levelsLoading = false;
        state.currentLevel = action.payload;
      })
      .addCase(fetchLevelDetail.rejected, (state, action) => {
        state.levelsLoading = false;
        state.error = action.payload as string;
      });

    // Start Level
    builder
      .addCase(startLevel.pending, (state) => {
        state.sessionLoading = true;
        state.error = null;
      })
      .addCase(startLevel.fulfilled, (state, action) => {
        state.sessionLoading = false;
        state.currentSession = {
          sessionId: action.payload.sessionId, // Renamed
          levelId: action.payload.level.id, // Renamed
          userId: 0, // Renamed // Will be set from auth
          currentScreenIndex: 0, // Renamed
          score: 0,
          startedAt: new Date().toISOString(), // Renamed
        };
        state.currentLevel = action.payload.level;
      })
      .addCase(startLevel.rejected, (state, action) => {
        state.sessionLoading = false;
        state.error = action.payload as string;
      });

    // Complete Level
    builder
      .addCase(completeLevel.pending, (state) => {
        state.sessionLoading = true;
        state.error = null;
      })
      .addCase(completeLevel.fulfilled, (state, action) => {
        state.sessionLoading = false;
        state.currentSession = null;
        state.successMessage = `Level completed! Score: ${action.payload.score}`;
        // Optimistic Update: Update stats immediately
        if (state.progress && action.payload.newTotals) {
          state.progress.coins = action.payload.newTotals.coins;
          state.progress.totalSenPetals = action.payload.newTotals.petals;
          state.progress.totalPoints = action.payload.newTotals.points;
        }
      })
      .addCase(completeLevel.rejected, (state, action) => {
        state.sessionLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Leaderboard
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.leaderboardLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboardLoading = false;
        state.leaderboard = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.leaderboardLoading = false;
        state.error = action.payload as string;
      });

    // Claim Daily Reward
    builder
      .addCase(claimDailyReward.fulfilled, (state, action) => {
        state.successMessage = `Daily reward claimed! +${action.payload.coins} coins, +${action.payload.petals} petals`;
      })
      .addCase(claimDailyReward.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Listen to Quest Claim Rewards (from questSlice)
    builder.addCase("quest/claimRewards/fulfilled", (state, action: any) => {
      // Support both unwrapped structures to be safe
      const newProgress = action.payload?.newProgress || action.payload?.data?.newProgress;
      if (newProgress) {
        state.progress = newProgress;
      }
    });

    // Listen to Shop Purchase (from shopSlice)
    builder.addCase("shop/purchase/fulfilled", (state, action: any) => {
      if (state.progress && action.payload.newBalance) {
        state.progress.coins = action.payload.newBalance.coins;
        state.progress.totalSenPetals = action.payload.newBalance.petals;
      } else if (state.progress && action.payload.remainingCoins !== undefined) {
        // Fallback for legacy/alternative structure if any
        state.progress.coins = action.payload.remainingCoins;
      }
    });

    // Fetch Museum
    builder
      .addCase(fetchMuseum.pending, (state) => {
        state.museumLoading = true;
        state.error = null;
      })
      .addCase(fetchMuseum.fulfilled, (state, action) => {
        state.museumLoading = false;
        state.museum = action.payload;
      })
      .addCase(fetchMuseum.rejected, (state, action) => {
        state.museumLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Badges
    builder
      .addCase(fetchBadges.pending, (state) => {
        state.badgesLoading = true;
        state.error = null;
      })
      .addCase(fetchBadges.fulfilled, (state, action) => {
        state.badgesLoading = false;
        state.badges = action.payload;
      })
      .addCase(fetchBadges.rejected, (state, action) => {
        state.badgesLoading = false;
        state.error = action.payload as string;
      });

    // Collect Museum Income
    builder
      .addCase(collectMuseumIncome.fulfilled, (state, action) => {
        state.successMessage = `Thu hoạch thành công ${action.payload.collected} xu!`;
      })
      .addCase(collectMuseumIncome.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Use Item
    builder
      .addCase(useItem.fulfilled, (state, action) => {
        state.successMessage = `Sử dụng ${action.payload.item.name} thành công!`;
      })
      .addCase(useItem.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {clearError, clearSuccessMessage, setCurrentChapter, setCurrentLevel, clearSession} = gameSlice.actions;

export default gameSlice.reducer;
