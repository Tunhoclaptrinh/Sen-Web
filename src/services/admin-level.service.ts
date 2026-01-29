import BaseService from './base.service';
import { Level } from '@/types/game.types';

class AdminLevelService extends BaseService<Level> {
    constructor() {
        super('/admin/levels');
    }

    reorder(chapterId: number, levelIds: number[]) {
        return this.put(`/chapters/${chapterId}/reorder`, {
            levelIds: levelIds
        });
    }
}

export default new AdminLevelService();
