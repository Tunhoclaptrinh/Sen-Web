import BaseService from "./base.service";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  parentId?: number;
}

class CategoryService extends BaseService<Category> {
  constructor() {
    super("/categories");
  }
}

export default new CategoryService();
