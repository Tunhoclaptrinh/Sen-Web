import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { aiService } from '@/services';
import type { AICharacter, ChatMessage, ChatResponse } from '@/types';

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
    error: string | null;
}

const initialState: AIState = {
    characters: [],
    currentCharacter: null,
    charactersLoading: false,
    chatHistory: [],
    chatLoading: false,
    isTyping: false,
    error: null,
};

// Async Thunks

// Fetch available characters
export const fetchCharacters = createAsyncThunk(
    'ai/fetchCharacters',
    async (_, { rejectWithValue }) => {
        try {
            const data = await aiService.getCharacters();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch characters');
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
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch chat history');
        }
    }
);

// Send chat message
export const sendChatMessage = createAsyncThunk(
    'ai/sendChatMessage',
    async (
        params: {
            character_id?: number;
            message: string;
            context?: {
                level_id?: number;
                artifact_id?: number;
                heritage_site_id?: number;
            };
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await aiService.chat(params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to send message');
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
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get hint');
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
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to get explanation');
        }
    }
);

// Clear chat history
export const clearChatHistory = createAsyncThunk(
    'ai/clearChatHistory',
    async (characterId: number, { rejectWithValue }) => {
        try {
            await aiService.clearHistory();
            return characterId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to clear chat history');
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
                character_id: state.currentCharacter?.id || 0,
                user_id: 0, // Will be set from auth
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
                    character_id: action.payload.character.id,
                    user_id: 0,
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
                    character_id: action.payload.character.id,
                    user_id: 0,
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
    },
});

export const {
    clearError,
    setCurrentCharacter,
    addUserMessage,
    setTyping,
} = aiSlice.actions;

export default aiSlice.reducer;
