import BaseService from './base.service';
import type { ShopItem } from '@/types/shop.types';

class ShopService extends BaseService<ShopItem> {
    constructor() {
        super('/admin/shop'); // Assuming admin endpoint
    }
}

export default new ShopService();
