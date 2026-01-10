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

export interface HeritageCardProps {
    site: HeritageSite;
    onFavoriteToggle?: (id: number, isFavorite: boolean) => void;
    isFavorite?: boolean;
    loading?: boolean;
    variant?: 'portrait' | 'landscape';
}
