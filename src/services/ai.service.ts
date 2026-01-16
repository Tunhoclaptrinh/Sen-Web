import BaseService from './base.service';

// AI Character
export interface AICharacter {
    id: number;
    name: string;
    avatar: string;
    personality: string;
    state: 'amnesia' | 'restored';
    description: string;
}

// Chat Message
export interface ChatMessage {
    id: number;
    character_id: number;
    user_id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    audio_base64?: string; // Add audio field
    context?: {
        level_id?: number;
        artifact_id?: number;
        heritage_site_id?: number;
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
        character_id?: number;
        message: string;
        context?: {
            level_id?: number;
            artifact_id?: number;
            heritage_site_id?: number;
        };
    }): Promise<ChatResponse> {
        const response = await this.post('/chat', {
            message: data.message,
            context: {
                characterId: data.character_id,
                levelId: data.context?.level_id,
                artifactId: data.context?.artifact_id,
                heritageSiteId: data.context?.heritage_site_id,
            }
        });
        // Backend returns: { success: true, data: { message, character, timestamp, route } }
        return {
            message: {
                id: Date.now(),
                character_id: data.character_id || response.data.character?.id || 1,
                user_id: 0, // Will be set from auth
                role: 'assistant',
                content: response.data.message,
                timestamp: response.data.timestamp || new Date().toISOString(),
                audio_base64: response.data.audio_base64, // Map audio
                context: data.context,
            },
            character: response.data.character,
            suggestions: [], // Can be added later
        };
    }

    // Get chat history
    async getChatHistory(characterId?: number, limit: number = 50): Promise<ChatMessage[]> {
        const params: any = { limit };
        if (characterId) params.character_id = characterId;
        
        const response = await this.get('/history', params);
        // Backend now returns properly formatted ChatMessage[] with role user/assistant
        return response.data;
    }

    // Request hint for current level
    async getHint(levelId: number, screenId?: number): Promise<{
        hint: string;
        character: AICharacter;
    }> {
        const response = await this.post('/hint', { level_id: levelId, screen_id: screenId });
        return response.data;
    }

    // Explain artifact or heritage site
    async explain(type: 'artifact' | 'heritage_site', id: number): Promise<{
        explanation: string;
        character: AICharacter;
        related_info?: any;
    }> {
        const response = await this.post('/explain', { type, id });
        return response.data;
    }

    // Generate quiz questions
    async generateQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number = 5): Promise<{
        questions: Array<{
            question: string;
            options: string[];
            correct_answer: number;
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

    // Get available characters
    async getCharacters(): Promise<AICharacter[]> {
        const response = await this.get('/characters');
        return response.data;
    }
}

export const aiService = new AIService();
export default aiService;
