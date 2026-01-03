import BaseService from './base.service';

export interface ShopItem {
    id: number;
    name: string;
    description: string;
    price: number;
    currency: 'coins' | 'petals';
    type: 'avatar' | 'title' | 'theme' | 'collectible';
    image: string;
    stock?: number;
    is_active: boolean;
}

class ShopService extends BaseService<ShopItem> {
    constructor() {
        super('/admin/shop'); // Assuming admin endpoint
    }
}

export default new ShopService();
