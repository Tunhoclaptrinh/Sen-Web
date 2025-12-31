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
        character_id: number;
        message: string;
        context?: {
            level_id?: number;
            artifact_id?: number;
            heritage_site_id?: number;
        };
    }): Promise<ChatResponse> {
        const response = await this.post('/chat', data);
        return response.data;
    }

    // Get chat history
    async getChatHistory(characterId: number, limit: number = 50): Promise<ChatMessage[]> {
        const response = await this.get('/history', { character_id: characterId, limit });
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
    async clearHistory(characterId: number): Promise<{ success: boolean }> {
        const response = await this.deleteRequest(`/history/${characterId}`);
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
