
// Authentication Utilities


const TOKEN_KEY = 'sen_auth_token';
const USER_KEY = 'sen_user';
const REFRESH_TOKEN_KEY = 'sen_refresh_token';

/**
 * Token Storage Management
 */
export const tokenStorage = {
    /**
     * Get access token from localStorage
     */
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * Set access token to localStorage
     */
    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },

    /**
     * Remove access token from localStorage
     */
    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    },

    /**
     * Get refresh token from localStorage
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    /**
     * Set refresh token to localStorage
     */
    setRefreshToken(token: string): void {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    /**
     * Remove refresh token from localStorage
     */
    removeRefreshToken(): void {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    /**
     * Clear all auth tokens
     */
    clearTokens(): void {
        this.removeToken();
        this.removeRefreshToken();
    },
};

/**
 * User Storage Management
 */
export const userStorage = {
    /**
     * Get user from localStorage
     */
    getUser<T = any>(): T | null {
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr) as T;
        } catch (error) {
            console.error('[Auth] Failed to parse user from localStorage:', error);
            return null;
        }
    },

    /**
     * Set user to localStorage
     */
    setUser<T = any>(user: T): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    /**
     * Remove user from localStorage
     */
    removeUser(): void {
        localStorage.removeItem(USER_KEY);
    },
};

/**
 * JWT Token Utilities
 */
export const jwtUtils = {
    /**
     * Decode JWT token (without verification)
     */
    decode(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('[Auth] Failed to decode token:', error);
            return null;
        }
    },

    /**
     * Check if token is expired
     */
    isExpired(token: string): boolean {
        const decoded = this.decode(token);
        if (!decoded || !decoded.exp) return true;

        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    },

    /**
     * Get token expiration time
     */
    getExpiration(token: string): Date | null {
        const decoded = this.decode(token);
        if (!decoded || !decoded.exp) return null;

        return new Date(decoded.exp * 1000);
    },

    /**
     * Get time until token expires (in seconds)
     */
    getTimeUntilExpiry(token: string): number {
        const decoded = this.decode(token);
        if (!decoded || !decoded.exp) return 0;

        const currentTime = Date.now() / 1000;
        return Math.max(0, decoded.exp - currentTime);
    },
};

/**
 * Authentication State Management
 */
export const authUtils = {
    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = tokenStorage.getToken();
        if (!token) return false;

        return !jwtUtils.isExpired(token);
    },

    /**
     * Get current user
     */
    getCurrentUser<T = any>(): T | null {
        if (!this.isAuthenticated()) return null;
        return userStorage.getUser<T>();
    },

    /**
     * Clear all auth data
     */
    clearAuth(): void {
        tokenStorage.clearTokens();
        userStorage.removeUser();
    },

    /**
     * Check if user has specific role
     */
    hasRole(role: string): boolean {
        const user = this.getCurrentUser<{ role: string }>();
        return user?.role === role;
    },

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles: string[]): boolean {
        const user = this.getCurrentUser<{ role: string }>();
        return user ? roles.includes(user.role) : false;
    },

    /**
     * Check if user is admin
     */
    isAdmin(): boolean {
        return this.hasRole('admin');
    },

    /**
     * Check if user is researcher
     */
    isResearcher(): boolean {
        return this.hasRole('researcher');
    },

    /**
     * Get user ID
     */
    getUserId(): number | null {
        const user = this.getCurrentUser<{ id: number }>();
        return user?.id ?? null;
    },
};

/**
 * Auto-logout on token expiry
 */
export const setupAutoLogout = (onLogout: () => void): (() => void) => {
    const checkTokenExpiry = () => {
        const token = tokenStorage.getToken();
        if (!token) return;

        if (jwtUtils.isExpired(token)) {
            authUtils.clearAuth();
            onLogout();
        }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    // Check immediately
    checkTokenExpiry();

    // Return cleanup function
    return () => clearInterval(interval);
};

/**
 * Setup token refresh before expiry
 */
export const setupTokenRefresh = (
    onRefresh: () => Promise<void>,
    minutesBeforeExpiry: number = 5
): (() => void) => {
    const checkAndRefresh = async () => {
        const token = tokenStorage.getToken();
        if (!token) return;

        const timeUntilExpiry = jwtUtils.getTimeUntilExpiry(token);
        const refreshThreshold = minutesBeforeExpiry * 60; // Convert to seconds

        if (timeUntilExpiry > 0 && timeUntilExpiry < refreshThreshold) {
            try {
                await onRefresh();
            } catch (error) {
                console.error('[Auth] Failed to refresh token:', error);
            }
        }
    };

    // Check every minute
    const interval = setInterval(checkAndRefresh, 60 * 1000);

    // Check immediately
    checkAndRefresh();

    // Return cleanup function
    return () => clearInterval(interval);
};
