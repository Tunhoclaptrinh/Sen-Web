/**
 * Resolves an image source which might be a string, an array of strings, or undefined.
 * Returns the first valid string or null.
 */
export const resolveImage = (src: any): string | null => {
    if (!src) return null;
    if (Array.isArray(src)) {
        const first = src[0];
        return typeof first === 'string' ? first : null;
    }
    return typeof src === 'string' ? src : null;
};

/**
 * Get full image URL from API path
 * @param path - Image path from API (e.g., uploads/image.jpg) or full URL
 * @param fallback - Fallback image if path is missing
 * @returns Full image URL
 */
export const getImageUrl = (path: string | string[] | undefined | null, fallback: string = 'https://via.placeholder.com/400x300'): string => {
    const resolvedPath = resolveImage(path);
    if (!resolvedPath) return fallback;

    // If it's already a full URL (http/https), return it
    if (resolvedPath.startsWith('http://') || resolvedPath.startsWith('https://')) {
        return resolvedPath;
    }

    // If it's a data URI (base64), return it
    if (resolvedPath.startsWith('data:image')) {
        return resolvedPath;
    }

    // Otherwise, assume it's a relative path from the API
    // Get API base URL from env or default
    // Note: We're assuming the API serves static files at the root or /uploads
    // If your backend serves static files at a specific route, adjust this.

    // Hardcoded for now based on typical setup, ideally from config
    const API_URL = 'http://localhost:5000';

    // Check if path starts with /
    const cleanPath = resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`;

    return `${API_URL}${cleanPath}`;
};
