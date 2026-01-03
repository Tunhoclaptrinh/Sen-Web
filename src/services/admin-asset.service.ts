import BaseService from './base.service';

export interface AdminAsset {
    id: number;
    code: string;
    name: string;
    type: 'artifact' | 'heritage_site' | 'other';
    reference_id: number;
    latitude?: number;
    longitude?: number;
    reward_coins?: number;
    reward_petals?: number;
    reward_character?: string;
    is_active: boolean;
}

class AdminAssetService extends BaseService<AdminAsset> {
    constructor() {
        super('/admin/assets');
    }
}

export default new AdminAssetService();
