import React from 'react';
import { Navigate } from 'react-router-dom';
import { authUtils } from '@/utils/auth.utils';

interface PublicRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * PublicRoute Component
 * For routes that should only be accessible when NOT authenticated
 * (e.g., login, register pages)
 * Redirects authenticated users to dashboard
 */
const PublicRoute: React.FC<PublicRouteProps> = ({
    children,
    redirectTo = '/dashboard',
}) => {
    const isAuthenticated = authUtils.isAuthenticated();

    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    // User is not authenticated, show the public route
    return <>{children}</>;
};

export default PublicRoute;
