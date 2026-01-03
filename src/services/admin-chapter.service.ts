import BaseService from './base.service';
import { Chapter } from '@/types/game.types';

class AdminChapterService extends BaseService<Chapter> {
    constructor() {
        super('/admin/chapters');
    }
}

export default new AdminChapterService();
