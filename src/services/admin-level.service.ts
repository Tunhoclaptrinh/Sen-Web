import BaseService from './base.service';
import { Level } from '@/types/game.types';

class AdminLevelService extends BaseService<Level> {
    constructor() {
        super('/admin/levels');
    }
}

export default new AdminLevelService();
