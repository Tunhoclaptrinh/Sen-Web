import React from 'react';

export interface ArtifactCardProps {
    artifact: {
        id: number | string;
        name: string;
        images?: string[];
        dynasty?: string;
        rarity?: string;
        category?: string;
    };
    actions?: React.ReactNode[];
}
