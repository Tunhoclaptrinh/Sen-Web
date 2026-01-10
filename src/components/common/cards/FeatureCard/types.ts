export interface HeritageSite {
    id: number;
    name: string;
    description: string;
    image?: string;
    region: string;
    type: string;
    rating?: number;
    total_reviews?: number;
    unesco_listed?: boolean;
}

export interface CommonCardData {
    id: number | string;
    name: string;
    image?: string;
    main_image?: string;
    type?: string; 
    rating?: number;
    total_reviews?: number;
    unesco_listed?: boolean;
    region?: string;
    dynasty?: string;
    description?: string;
    [key: string]: any;
}

export interface FeatureCardProps {
    data: CommonCardData;
    cardType?: 'heritage' | 'artifact';
    variant?: 'portrait' | 'landscape';
}
