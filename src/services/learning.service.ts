import BaseService from './base.service';

// Learning Path
export interface LearningPath {
    id: number;
    title: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    durationMinutes: number;
    thumbnail?: string;
    modules: LearningModule[];
    isEnrolled: boolean;
    progress?: number;
    completedModulesCount?: number;
    totalModules?: number;
}

// Learning Module
export interface LearningModule {
    id: number;
    pathId: number;
    title: string;
    description: string;
    order: number;
    contentType: 'video' | 'article' | 'quiz' | 'interactive';
    contentUrl?: string;
    durationMinutes: number;
    isCompleted: boolean;
    quiz?: Quiz;
    // UI props
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedDuration?: number;
    score?: number;
    thumbnail?: string;
}

// Quiz
export interface Quiz {
    id: number;
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number;
}

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    point?: number;
}

// User Progress
export interface LearningProgress {
    pathId: number;
    userId: number;
    enrolledAt: string;
    completedModules: number[];
    currentModuleId?: number;
    progressPercentage: number;
    completedAt?: string;
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
            nextModuleId?: number;
            totalTimeSpent?: number;
        } 
    }> {
        const response = await this.get<{ data: LearningModule[]; progress: any }>('/path');
        return response;
    }

    // Get all learning paths
    async getPaths(params?: { difficulty?: string; category?: string }): Promise<LearningPath[]> {
        const response = await this.get<LearningPath[]>('/paths', { params });
        return response;
    }

    // Get path detail
    async getPathDetail(id: number): Promise<LearningPath> {
        const response = await this.get<LearningPath>(`/paths/${id}`);
        return response;
    }

    // Enroll in path
    async enrollPath(id: number): Promise<any> {
        const response = await this.post(`/paths/${id}/enroll`);
        return response;
    }

    // Get enrolled paths
    async getEnrolledPaths(): Promise<LearningPath[]> {
        const response = await this.get<LearningPath[]>('/paths/enrolled');
        return response;
    }

    // Get path progress
    async getProgress(pathId: number): Promise<any> {
        const response = await this.get(`/paths/${pathId}/progress`);
        return response;
    }

    // Submit Quiz
    async submitQuiz(pathId: number, moduleId: number, answers: Record<number, number>): Promise<{
        score: number;
        passed: boolean;
        pointsEarned: number;
    }> {
        const response = await this.post(`/paths/${pathId}/modules/${moduleId}/quiz/submit`, { answers });
        return response as any;
    }

    // Get module detail
    async getModuleDetail(moduleId: number): Promise<LearningModule> {
        const response = await this.getById(moduleId);
        return response.data as any;
    }

    // Complete module
    async completeModule(moduleId: number, data: { timeSpent: number; score?: number; answers?: Record<number, number> }): Promise<{
        success: boolean;
        message: string;
        data: {
            moduleTitle: string;
            score: number;
            pointsEarned: number;
            passed: boolean;
        }
    }> {
        const response = await this.post(`/${moduleId}/complete`, data);
        return response as any;
    }
}


export const learningService = new LearningService();
export default learningService;
