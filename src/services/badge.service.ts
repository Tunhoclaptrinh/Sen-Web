import BaseService from './base.service';

export interface Badge {
    id: number;
    name: string;
    description: string;
    icon: string;
    conditionType: string;
    conditionValue: number;
    rewardCoins?: number;
    rewardPetals?: number;
    isActive: boolean;
}

class BadgeService extends BaseService<Badge> {
    constructor() {
        super('/badges'); // Fix 404: backend uses /badges
    }
}

export default new BadgeService();
