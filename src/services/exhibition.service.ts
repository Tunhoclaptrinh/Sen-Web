import BaseService from './base.service';

// Exhibition
export interface Exhibition {
    id: number;
    name: string;
    description: string;
    heritage_site_id: number;
    heritage_site?: {
        id: number;
        name: string;
    };
    theme: string;
    curator: string;
    start_date: string;
    end_date: string;
    artifact_ids: number[];
    artifacts?: Array<{
        id: number;
        name: string;
        image: string;
    }>;
    images?: string[];
    is_active: boolean;
    is_permanent: boolean;
    visitor_count?: number;
    rating?: number;
}

class ExhibitionService extends BaseService {
    constructor() {
        super('/exhibitions');
    }

    // Get all exhibitions (override for custom return type)
    async getAllExhibitions(params?: {
        page?: number;
        limit?: number;
        heritage_site_id?: number;
        is_active?: boolean;
        q?: string;
    }) {
        return await this.getAll(params);
    }

    // Get active exhibitions
    async getActive(): Promise<Exhibition[]> {
        const response = await this.get('/active');
        return response.data;
    }

    // Get exhibition detail
    async getExhibitionById(id: number) {
        return await this.getById(id);
    }

    // Create exhibition (uses base create)
    async createExhibition(data: Partial<Exhibition>) {
        return await this.create(data);
    }

    // Update exhibition (uses base update)
    async updateExhibition(id: number, data: Partial<Exhibition>) {
        return await this.update(id, data);
    }

    // Delete exhibition (Admin only)
    async deleteExhibition(id: number) {
        return await this.delete(id);
    }

    // Get exhibitions by heritage site
    async getByHeritageSite(siteId: number): Promise<Exhibition[]> {
        const response = await this.get('/', { heritage_site_id: siteId });
        return response.data;
    }
}

export const exhibitionService = new ExhibitionService();
export default exhibitionService;
