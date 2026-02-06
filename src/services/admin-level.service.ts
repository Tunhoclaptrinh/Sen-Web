import ReviewableBaseService from './reviewable.service';
import { Level } from '@/types/game.types';

class AdminLevelService extends ReviewableBaseService<Level> {
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
