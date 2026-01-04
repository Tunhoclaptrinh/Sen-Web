
/**
 * Get full image URL from API path
 * @param path - Image path from API (e.g., uploads/image.jpg) or full URL
 * @param fallback - Fallback image if path is missing
 * @returns Full image URL
 */
export const getImageUrl = (path: string | undefined | null, fallback: string = 'https://via.placeholder.com/400x300'): string => {
    if (!path) return fallback;

    // If it's already a full URL (http/https), return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // If it's a data URI (base64), return it
    if (path.startsWith('data:image')) {
        return path;
    }

    // Otherwise, assume it's a relative path from the API
    // Get API base URL from env or default
    // Note: We're assuming the API serves static files at the root or /uploads
    // If your backend serves static files at a specific route, adjust this.

    // Hardcoded for now based on typical setup, ideally from config
    const API_URL = 'http://localhost:5000';

    // Check if path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${API_URL}${cleanPath}`;
};
