import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface PermissionGuardProps {
    resource?: string;
    action: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * PermissionGuard - Granular permission check for UI elements
 * @param resource - The resource name (e.g., 'game_content', 'heritage_sites'). If null, permission is granted.
 * @param action - The action name (e.g., 'create', 'update', 'delete', 'publish')
 * @param children - Element to show if permission is granted
 * @param fallback - Optional element to show if permission is denied
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    resource,
    action,
    children,
    fallback = null
}) => {
    const { hasPermission, isInitialized } = useAuth();

    if (!isInitialized) return null;

    // If no resource is provided, we skip the permission check and render children
    if (!resource || hasPermission(resource, action)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

export default PermissionGuard;
