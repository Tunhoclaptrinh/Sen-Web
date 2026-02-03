import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { aiService } from '@/services';
import type { AICharacter, ChatMessage, ChatResponse } from '@/types';

// Sen Character Settings interface
export interface SenSettings {
    isChibi: boolean;
    scale: number;
    accessories: {
        hat: boolean;
        glasses: boolean;
        coat: boolean;
        bag: boolean;
    };
    mouthState: 'smile' | 'smile_2' | 'sad' | 'open' | 'close' | 'half' | 'tongue' | 'angry';
    eyeState: 'normal' | 'blink' | 'close' | 'half' | 'like' | 'sleep';
    gesture: 'normal' | 'hello' | 'point' | 'like' | 'flag' | 'hand_back';
    isBlinking: boolean;
}

// State interface
interface AIState {
    // Characters
    characters: AICharacter[];
    currentCharacter: AICharacter | null;
    charactersLoading: boolean;

    // Chat
    chatHistory: ChatMessage[];
    chatLoading: boolean;
    isTyping: boolean;

    // UI State
    isOverlayOpen: boolean;
    layoutMode: 'fixed' | 'absolute';
    isMuted: boolean;
    error: string | null;

    // Sen Specific Settings
    senSettings: SenSettings;

    // Active Context for Global Overlay
    // Active Context for Global Overlay
    activeContext: {
        levelId?: number;
        artifactId?: number;
        heritageSiteId?: number;
    } | null;
}

const initialState: AIState = {
    characters: [],
    currentCharacter: null,
    charactersLoading: false,
    chatHistory: [],
    chatLoading: false,
    isTyping: false,
    isOverlayOpen: false,
    layoutMode: 'fixed',
    isMuted: false,
    error: null,
    senSettings: {
        isChibi: true, // Default to Chibi
        scale: 0.2,    // Default scale for Chibi
        accessories: {
            hat: true,
            glasses: true,
            coat: true,
            bag: true,
        },
        mouthState: 'smile',
        eyeState: 'normal',
        gesture: 'normal',
        isBlinking: true,
    },
    activeContext: null,
};

// Async Thunks

// Fetch available characters
export const fetchCharacters = createAsyncThunk(
    'ai/fetchCharacters',
    async (_, { rejectWithValue }) => {
        try {
            const data = await aiService.getCharacters();
            return data;
        } catch (error: unknown) {
            return rejectWithValue((error as Error).message || 'Failed to fetch characters');
        }
    }
);

// Fetch chat history
export const fetchChatHistory = createAsyncThunk(
    'ai/fetchChatHistory',
    async (params: { characterId?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const data = await aiService.getChatHistory(params.characterId, params.limit);
            return data;
        } catch (error: unknown) {
            return rejectWithValue((error as Error).message || 'Failed to fetch chat history');
        }
    }
);

// Send chat message
export const sendChatMessage = createAsyncThunk(
    'ai/sendChatMessage',
    async (
        params: {
            characterId?: number;
            message: string;
            context?: {
                levelId?: number;
                artifactId?: number;
                heritageSiteId?: number;
            };
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await aiService.chat(params);
            return response;
        } catch (error: unknown) {
            return rejectWithValue((error as Error).message || 'Failed to send message');
        }
    }
);

// Get hint
export const getHint = createAsyncThunk(
    'ai/getHint',
    async (params: { levelId: number; screenId?: number }, { rejectWithValue }) => {
        try {
            const data = await aiService.getHint(params.levelId, params.screenId);
            return data;
        } catch (error: unknown) {
            return rejectWithValue((error as Error).message || 'Failed to get hint');
        }
    }
);

// Get explanation
export const getExplanation = createAsyncThunk(
    'ai/getExplanation',
    async (params: { type: 'artifact' | 'heritage_site'; id: number }, { rejectWithValue }) => {
        try {
            const data = await aiService.explain(params.type, params.id);
            return data;
        } catch (error: unknown) {
            return rejectWithValue((error as Error).message || 'Failed to get explanation');
        }
    }
);

// Clear chat history
export const clearChatHistory = createAsyncThunk(
    'ai/clearChatHistory',
    async (characterId: number, { rejectWithValue }) => {
        try {
            await aiService.clearHistory(characterId);
            return characterId;
        } catch (error: unknown) {
            return rejectWithValue((error as Error).message || 'Failed to clear chat history');
        }
    }
);

// Transcribe Audio
export const transcribeAudio = createAsyncThunk(
    'ai/transcribeAudio',
    async (audioBlob: Blob, { rejectWithValue }) => {
        try {
            const text = await aiService.transcribeAudio(audioBlob);
            return text;
        } catch (error: unknown) {
            return rejectWithValue((error as Error).message || 'Failed to transcribe audio');
        }
    }
);

// Slice
const aiSlice = createSlice({
    name: 'ai',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentCharacter: (state, action: PayloadAction<AICharacter | null>) => {
            state.currentCharacter = action.payload;
            state.chatHistory = []; // Clear history when switching characters
        },
        addUserMessage: (state, action: PayloadAction<string>) => {
            const userMessage: ChatMessage = {
                id: Date.now(),
                characterId: state.currentCharacter?.id || 0,
                userId: 0, // Will be set from auth
                role: 'user',
                content: action.payload,
                timestamp: new Date().toISOString(),
            };
            state.chatHistory.push(userMessage);
            state.isTyping = true;
        },
        setTyping: (state, action: PayloadAction<boolean>) => {
            state.isTyping = action.payload;
        },
        setOverlayOpen: (state, action: PayloadAction<boolean | { open: boolean, mode: 'fixed' | 'absolute' }>) => {
            if (typeof action.payload === 'boolean') {
                state.isOverlayOpen = action.payload;
            } else {
                state.isOverlayOpen = action.payload.open;
                state.layoutMode = action.payload.mode;
            }
        },
        setMuted: (state, action: PayloadAction<boolean>) => {
            state.isMuted = action.payload;
        },
        updateSenSettings: (state, action: PayloadAction<Partial<SenSettings>>) => {
            state.senSettings = { ...state.senSettings, ...action.payload };
            
            // Auto adjust scale if isChibi changed and scale was NOT explicitly provided
            if (action.payload.isChibi !== undefined && action.payload.scale === undefined) {
                state.senSettings.scale = action.payload.isChibi ? 0.2 : 0.25;
            }
        },
        toggleSenAccessory: (state, action: PayloadAction<keyof SenSettings['accessories']>) => {
            state.senSettings.accessories[action.payload] = !state.senSettings.accessories[action.payload];
        },
        setActiveContext: (state, action: PayloadAction<AIState['activeContext']>) => {
            state.activeContext = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Fetch Characters
        builder
            .addCase(fetchCharacters.pending, (state) => {
                state.charactersLoading = true;
                state.error = null;
            })
            .addCase(fetchCharacters.fulfilled, (state, action) => {
                state.charactersLoading = false;
                state.characters = action.payload;
            })
            .addCase(fetchCharacters.rejected, (state, action) => {
                state.charactersLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Chat History
        builder
            .addCase(fetchChatHistory.pending, (state) => {
                state.chatLoading = true;
                state.error = null;
            })
            .addCase(fetchChatHistory.fulfilled, (state, action) => {
                state.chatLoading = false;
                // Sắp xếp tin nhắn theo thời gian tăng dần (cũ trước, mới sau)
                state.chatHistory = [...action.payload].sort((a, b) => {
                    const timeA = new Date(a.timestamp || 0).getTime();
                    const timeB = new Date(b.timestamp || 0).getTime();
                    if (timeA !== timeB) return timeA - timeB;
                    return (a.id as number) - (b.id as number);
                });
            })
            .addCase(fetchChatHistory.rejected, (state, action) => {
                state.chatLoading = false;
                state.error = action.payload as string;
            });

        // Send Chat Message
        builder
            .addCase(sendChatMessage.pending, (state) => {
                state.chatLoading = true;
                state.isTyping = true;
                state.error = null;
            })
            .addCase(sendChatMessage.fulfilled, (state, action: PayloadAction<ChatResponse>) => {
                state.chatLoading = false;
                state.isTyping = false;
                state.chatHistory.push(action.payload.message);
            })
            .addCase(sendChatMessage.rejected, (state, action) => {
                state.chatLoading = false;
                state.isTyping = false;
                state.error = action.payload as string;
            });

        // Get Hint
        builder
            .addCase(getHint.pending, (state) => {
                state.chatLoading = true;
                state.isTyping = true;
            })
            .addCase(getHint.fulfilled, (state, action) => {
                state.chatLoading = false;
                state.isTyping = false;
                // Add hint as a system message
                const hintMessage: ChatMessage = {
                    id: Date.now(),
                    characterId: action.payload.character.id,
                    userId: 0,
                    role: 'assistant',
                    content: action.payload.hint,
                    timestamp: new Date().toISOString(),
                };
                state.chatHistory.push(hintMessage);
            })
            .addCase(getHint.rejected, (state, action) => {
                state.chatLoading = false;
                state.isTyping = false;
                state.error = action.payload as string;
            });

        // Get Explanation
        builder
            .addCase(getExplanation.pending, (state) => {
                state.chatLoading = true;
                state.isTyping = true;
            })
            .addCase(getExplanation.fulfilled, (state, action) => {
                state.chatLoading = false;
                state.isTyping = false;
                // Add explanation as a system message
                const explanationMessage: ChatMessage = {
                    id: Date.now(),
                    characterId: action.payload.character.id,
                    userId: 0,
                    role: 'assistant',
                    content: action.payload.explanation,
                    timestamp: new Date().toISOString(),
                };
                state.chatHistory.push(explanationMessage);
            })
            .addCase(getExplanation.rejected, (state, action) => {
                state.chatLoading = false;
                state.isTyping = false;
                state.error = action.payload as string;
            });

        // Clear Chat History
        builder
            .addCase(clearChatHistory.fulfilled, (state) => {
                state.chatHistory = [];
            })
            .addCase(clearChatHistory.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Transcribe Audio
        builder
            .addCase(transcribeAudio.pending, (state) => {
                state.chatLoading = true; 
            })
            .addCase(transcribeAudio.fulfilled, (state) => {
                state.chatLoading = false;
                state.error = null;
            })
            .addCase(transcribeAudio.rejected, (state, action) => {
                state.chatLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    setCurrentCharacter,
    addUserMessage,
    setTyping,
    setOverlayOpen,
    setMuted,
    updateSenSettings,
    toggleSenAccessory,
    setActiveContext,
} = aiSlice.actions;

export default aiSlice.reducer;
