import BaseService from './base.service';

// Learning Path
export interface LearningPath {
    id: number;
    title: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration_minutes: number;
    thumbnail?: string;
    modules: LearningModule[];
    is_enrolled: boolean;
    progress?: number;
    completed_modules?: number;
    total_modules?: number;
}

// Learning Module
export interface LearningModule {
    id: number;
    path_id: number;
    title: string;
    description: string;
    order: number;
    content_type: 'video' | 'article' | 'quiz' | 'interactive';
    content_url?: string;
    duration_minutes: number;
    is_completed: boolean;
    quiz?: Quiz;
    // UI props
    difficulty?: 'easy' | 'medium' | 'hard';
    estimated_duration?: number;
    score?: number;
    thumbnail?: string;
}

// Quiz
export interface Quiz {
    id: number;
    questions: QuizQuestion[];
    passing_score: number;
    time_limit?: number;
}

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correct_answer: number;
    explanation?: string;
    point?: number;
}

// User Progress
export interface LearningProgress {
    path_id: number;
    user_id: number;
    enrolled_at: string;
    completed_modules: number[];
    current_module_id?: number;
    progress_percentage: number;
    completed_at?: string;
}

class LearningService extends BaseService {
    constructor() {
        super('/learning');
    }

    // Get learning path with progress
    async getLearningPath(): Promise<{ 
        data: LearningModule[]; 
        progress: {
            completed: number;
            total: number;
            percentage: number;
            next_module_id?: number;
            total_time_spent?: number;
        } 
    }> {
        const response = await this.get<{ data: LearningModule[]; progress: any }>('/path');
        return response;
    }

    // Get module detail
    async getModuleDetail(moduleId: number): Promise<LearningModule> {
        const response = await this.getById(moduleId);
        return response.data as any;
    }

    // Complete module
    async completeModule(moduleId: number, data: { time_spent: number; score?: number; answers?: Record<number, number> }): Promise<{
        success: boolean;
        message: string;
        data: {
            module_title: string;
            score: number;
            points_earned: number;
            passed: boolean;
        }
    }> {
        const response = await this.post(`/${moduleId}/complete`, data);
        return response as any;
    }
}


export const learningService = new LearningService();
export default learningService;
