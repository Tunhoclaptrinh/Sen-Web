import { useEffect } from 'react';
import artifactService from '@/services/artifact.service';
import heritageService from '@/services/heritage.service';
import historyService from '@/services/history.service';
import { logger } from '@/utils/logger.utils';

type ViewType = 'artifact' | 'heritage' | 'history';

/**
 * Hook to track views for different entities
 * Uses localStorage to prevent duplicate counts within a time window (e.g., 24h)
 */
export const useViewTracker = (type: ViewType, id: number | string | undefined) => {
  useEffect(() => {
    if (!id) return;

    const trackView = async () => {
      try {
        const storageKey = `viewed_${type}_${id}`;
        const lastViewed = localStorage.getItem(storageKey);
        const now = Date.now();
        const expiration = 24 * 60 * 60 * 1000; // 24 hours

        if (lastViewed && now - parseInt(lastViewed) < expiration) {
          // Already viewed recently
          return;
        }

        // Increment view count via service
        switch (type) {
          case 'artifact':
            await artifactService.incrementViewCount(id);
            break;
          case 'heritage':
            await heritageService.incrementViewCount(id);
            break;
          case 'history':
            await historyService.incrementViewCount(id);
            break;
        }

        // Mark as viewed
        localStorage.setItem(storageKey, now.toString());
      } catch (error) {
        logger.warn(`[useViewTracker] Failed to track view for ${type} ${id}:`, error);
      }
    };

    trackView();
  }, [type, id]);
};
