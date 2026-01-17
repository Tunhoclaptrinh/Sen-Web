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

    // Hardcoded for now based on typical setup, ideally from config
    const API_URL = import.meta.env.VITE_API_BASE_URL; // e.g., http://localhost:3000/api

    // If API_URL ends with /api, strip it to get the server root for static files
    const serverRoot = API_URL.endsWith('/api') 
        ? API_URL.slice(0, -4) // remove last 4 chars "/api"
        : API_URL;

    // Check if path starts with /
    const cleanPath = resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`;

    return `${serverRoot}${cleanPath}`;
};
