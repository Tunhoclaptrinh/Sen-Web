import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
    redirectTo?: string;
}

/**
 * RoleGuard component - Protects routes based on user role
 * @param children - Child components to render if authorized
 * @param allowedRoles - Array of roles that can access this route
 * @param redirectTo - Optional redirect path (defaults to /login)
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
    children,
    allowedRoles,
    redirectTo = '/login'
}) => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated but no role or role not allowed
    if (!user?.role || !allowedRoles.includes(user.role)) {
        return <Navigate to={redirectTo} replace />;
    }

    // Authorized - render children
    return <>{children}</>;
};

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute component - Requires authentication only
 * @param children - Child components to render if authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

/**
 * Helper function to get default route based on user role
 */
export const getDefaultRouteForRole = (role: string): string => {
    switch (role) {
        case 'admin':
            return '/admin/dashboard';
        case 'researcher':
            return '/researcher/heritage-sites';
        case 'customer':
            return '/game/chapters';
        default:
            return '/';
    }
};
