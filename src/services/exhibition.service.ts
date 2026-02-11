import ReviewableBaseService from './reviewable.service';

// Exhibition
export interface Exhibition {
    id: number;
    name: string;
    description: string;
    heritageSiteId: number;
    heritageSite?: {
        id: number;
        name: string;
    };
    theme: string;
    curator: string;
    startDate: string;
    endDate: string;
    artifactIds: number[];
    artifacts?: Array<{
        id: number;
        name: string;
        image: string;
    }>;
    image?: string;
    images?: string[];
    isActive: boolean;
    isPermanent: boolean;
    visitorCount?: number;
    rating?: number;
    status: 'draft' | 'pending' | 'published' | 'rejected';
    createdBy?: number;
    authorName?: string;
    review_comment?: string;
}

class ExhibitionService extends ReviewableBaseService<Exhibition> {
    constructor() {
        super('/exhibitions');
    }

    // Get active exhibitions
    async getActive(): Promise<Exhibition[]> {
        const response = await this.get('/active');
        return response.data;
    }

    // Get exhibitions by heritage site
    async getByHeritageSite(siteId: number): Promise<Exhibition[]> {
        const response = await this.get('/', { heritageSiteId: siteId });
        return response.data;
    }
}

export const exhibitionService = new ExhibitionService();
export default exhibitionService;
