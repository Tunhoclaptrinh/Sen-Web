import BaseService from './base.service';

export interface Category {
    id: number;
    name: string;
    description: string;
    icon?: string;
}

class CategoryService extends BaseService<Category> {
    constructor() {
        super('/categories');
    }
}

export default new CategoryService();
