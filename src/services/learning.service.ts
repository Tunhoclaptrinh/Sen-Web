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
    async getLearningPath(): Promise<{ data: LearningModule[]; progress: any }> {
        const response = await this.get<{ data: LearningModule[]; progress: any }>('/path');
        return response;
    }

    // Get module detail
    async getModuleDetail(moduleId: number): Promise<LearningModule> {
        const response = await this.getById(moduleId);
        return response.data as LearningModule;
    }

    // Complete module
    async completeModule(moduleId: number, score: number): Promise<{
        success: boolean;
        message: string;
        data: {
            module_title: string;
            score: number;
            points_earned: number;
            passed: boolean;
        }
    }> {
        type CompleteResponse = {
            success: boolean;
            message: string;
            data: {
                module_title: string;
                score: number;
                points_earned: number;
                passed: boolean;
            }
        };
        const response = await this.post<CompleteResponse>(`/${moduleId}/complete`, { score });
        return response;
    }
}


export const learningService = new LearningService();
export default learningService;
