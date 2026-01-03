import BaseService from './base.service';

export interface Badge {
    id: number;
    name: string;
    description: string;
    icon: string;
    condition_type: string;
    condition_value: number;
    reward_coins?: number;
    reward_petals?: number;
    is_active: boolean;
}

class BadgeService extends BaseService<Badge> {
    constructor() {
        super('/badges'); // Fix 404: backend uses /badges
    }
}

export default new BadgeService();
