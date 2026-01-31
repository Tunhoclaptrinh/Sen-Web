import BaseService from './base.service';

export interface AdminAsset {
    id: number;
    code: string;
    name: string;
    type: 'artifact' | 'heritageSite' | 'other';
    referenceId: number;
    latitude?: number;
    longitude?: number;
    rewardCoins?: number;
    rewardPetals?: number;
    rewardCharacter?: string;
    isActive: boolean;
}

class AdminAssetService extends BaseService<AdminAsset> {
    constructor() {
        super('/admin/assets');
    }
}

export default new AdminAssetService();
