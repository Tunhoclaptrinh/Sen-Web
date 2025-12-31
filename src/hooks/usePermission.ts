import { useAppSelector } from '@/store/hooks';
import { USER_ROLES } from '@/config/constants';
import type { UserRole } from '@/types';

interface UsePermissionResult {
    hasRole: (roles: UserRole | UserRole[]) => boolean;
    isAdmin: () => boolean;
    isCustomer: () => boolean;
    isResearcher: () => boolean;
    isCurator: () => boolean;
}

export const usePermission = (): UsePermissionResult => {
    const { user } = useAppSelector((state) => state.auth);

    const hasRole = (roles: UserRole | UserRole[]): boolean => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    const isAdmin = (): boolean => hasRole(USER_ROLES.ADMIN as UserRole);
    const isCustomer = (): boolean => hasRole(USER_ROLES.CUSTOMER as UserRole);
    const isResearcher = (): boolean => hasRole(USER_ROLES.RESEARCHER as UserRole);
    const isCurator = (): boolean => hasRole(USER_ROLES.CURATOR as UserRole);

    return {
        hasRole,
        isAdmin,
        isCustomer,
        isResearcher,
        isCurator,
    };
};

export default usePermission;
