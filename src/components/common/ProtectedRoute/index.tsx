import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { authUtils } from '@/utils/auth.utils';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
    redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Optionally checks for specific user roles
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRoles = [],
    redirectTo = '/login',
}) => {
    const location = useLocation();
    const isAuthenticated = authUtils.isAuthenticated();
    const user = authUtils.getCurrentUser<{ role: string }>();

    // Check authentication
    if (!isAuthenticated) {
        // Redirect to login, save the attempted location
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Check role-based access
    if (requiredRoles.length > 0 && user) {
        const hasRequiredRole = requiredRoles.includes(user.role);

        if (!hasRequiredRole) {
            // User doesn't have required role, redirect to unauthorized page
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // User is authenticated and has required role
    return <>{children}</>;
};

/**
 * Loading component for protected routes
 */
export const ProtectedRouteLoading: React.FC = () => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
            }}
        >
            <Spin size="large" />
        </div>
    );
};

export default ProtectedRoute;
