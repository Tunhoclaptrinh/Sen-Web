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

    // --- Methods for Redux Slice ---

    // Get all paths
    async getPaths(params?: { difficulty?: string; category?: string }): Promise<LearningPath[]> {
        const response = await this.get<LearningPath[]>('/paths', params);
        return response || [];
    }

    // Get path detail
    async getPathDetail(pathId: number): Promise<LearningPath> {
        const response = await this.getById(pathId);
        return response.data as any; // Cast to LearningPath
    }

    // Enroll in path
    async enrollPath(pathId: number): Promise<{ success: boolean; message: string }> {
        const response = await this.post(`/${pathId}/enroll`);
        return response as any;
    }

    // Get enrolled paths
    async getEnrolledPaths(): Promise<LearningPath[]> {
        const response = await this.get<LearningPath[]>('/enrolled');
        return response || [];
    }

    // Get module detail (Overloaded or Flexible)
    async getModuleDetail(pathIdOrModuleId: number, moduleId?: number): Promise<LearningModule> {
        // If 2 args provided (pathId, moduleId), use moduleId. If 1 arg, use it as moduleId
        const targetModuleId = moduleId || pathIdOrModuleId;
        const response = await this.getById(targetModuleId);
        return response.data as any;
    }

    // Complete module
    async completeModule(_pathId: number, moduleId: number, data: { time_spent: number; score?: number }): Promise<{
        success: boolean;
        message: string;
        data: {
            module_title: string;
            score: number;
            points_earned: number;
            passed: boolean;
        }
    }> {
        // Match the signature in slice: completeModule(params.pathId, params.moduleId, params.data)
        // Ignoring pathId for now if backend doesn't need it, or pass it if payload requires
        const response = await this.post(`/${moduleId}/complete`, data);
        return response as any;
    }

    // Get progress
    async getProgress(pathId: number): Promise<number> {
        const response = await this.get<{ percentage: number }>(`/${pathId}/progress`);
        return response?.percentage || 0;
    }

    // Submit Quiz
    async submitQuiz(_pathId: number, moduleId: number, answers: Record<number, number>): Promise<{ score: number; passed: boolean }> {
        const response = await this.post(`/${moduleId}/quiz/submit`, { answers });
        return response as any;
    }
}


export const learningService = new LearningService();
export default learningService;
