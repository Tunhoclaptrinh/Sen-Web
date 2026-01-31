import BaseService from './base.service';

// AI Character
export interface AICharacter {
    id: number;
    name: string;
    avatar: string;
    personality: string;
    state: 'amnesia' | 'restored';
    description: string;
    isDefault?: boolean;
    isOwned?: boolean;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    price?: number;
    unlockLevelId?: number | null;
    canUnlock?: boolean;
}

// Chat Message
export interface ChatMessage {
    id: number;
    characterId: number;
    userId: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    audioBase64?: string; // Add audio field
    context?: {
        levelId?: number;
        artifactId?: number;
        heritageSiteId?: number;
    };
}

// Chat Response
export interface ChatResponse {
    message: ChatMessage;
    character: AICharacter;
    suggestions?: string[];
}

class AIService extends BaseService {
    constructor() {
        super('/ai');
    }

    // Chat
    async chat(data: {
        characterId?: number;
        message: string;
        context?: {
            levelId?: number;
            artifactId?: number;
            heritageSiteId?: number;
        };
    }): Promise<ChatResponse> {
        const response = await this.post('/chat', {
            message: data.message,
            context: {
                characterId: data.characterId,
                levelId: data.context?.levelId,
                artifactId: data.context?.artifactId,
                heritageSiteId: data.context?.heritageSiteId,
            }
        });
        // Backend returns: { success: true, data: { message, character, timestamp, route } }
        return {
            message: {
                id: Date.now(),
                characterId: data.characterId || response.data.character?.id || 1,
                userId: 0, // Will be set from auth
                role: 'assistant',
                content: response.data.message,
                timestamp: response.data.timestamp || new Date().toISOString(),
                audioBase64: response.data.audioBase64, // Map audio
                context: data.context,
            },
            character: response.data.character,
            suggestions: [], // Can be added later
        };
    }

    // Get chat history
    async getChatHistory(characterId?: number, limit: number = 50): Promise<ChatMessage[]> {
        const params: any = { limit };
        if (characterId) params.characterId = characterId;
        
        const response = await this.get('/history', params);
        // Backend now returns properly formatted ChatMessage[] with role user/assistant
        return response.data;
    }

    // Request hint for current level
    async getHint(levelId: number, screenId?: number): Promise<{
        hint: string;
        character: AICharacter;
    }> {
        const response = await this.post('/hint', { levelId: levelId, screenId: screenId });
        return response.data;
    }

    // Explain artifact or heritage site
    async explain(type: 'artifact' | 'heritage_site', id: number): Promise<{
        explanation: string;
        character: AICharacter;
        relatedInfo?: any;
    }> {
        const response = await this.post('/explain', { type, id });
        return response.data;
    }

    // Generate quiz questions
    async generateQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number = 5): Promise<{
        questions: Array<{
            question: string;
            options: string[];
            correctAnswer: number;
            explanation: string;
        }>;
    }> {
        const response = await this.post('/generate-quiz', { topic, difficulty, count });
        return response.data;
    }

    // Clear chat history
    async clearHistory(): Promise<{ success: boolean }> {
        const response = await this.deleteRequest('/history');
        return response.data || { success: true };
    }

    // Get owned characters
    async getCharacters(): Promise<AICharacter[]> {
        const response = await this.get('/characters');
        return response.data;
    }

    // Get characters available for purchase (unlocked but not owned)
    async getAvailableCharacters(): Promise<AICharacter[]> {
        const response = await this.get('/characters/available');
        return response.data;
    }

    // Purchase a character
    async purchaseCharacter(characterId: number): Promise<{
        success: boolean;
        message: string;
        data?: {
            character: AICharacter;
            newBalance: number;
        };
    }> {
        const response = await this.post(`/characters/${characterId}/purchase`, {});
        return response.data;
    }
}

export const aiService = new AIService();
export default aiService;
