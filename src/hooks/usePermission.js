import { useAuth } from './useAuth';
import { USER_ROLES } from '@utils/constants';

export const usePermission = () => {
  const { user } = useAuth();

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const isAdmin = () => hasRole(USER_ROLES.ADMIN);
  const isCustomer = () => hasRole(USER_ROLES.CUSTOMER);
  const isResearcher = () => hasRole(USER_ROLES.RESEARCHER);
  const isCurator = () => hasRole(USER_ROLES.CURATOR);

  return {
    hasRole,
    isAdmin,
    isCustomer,
    isResearcher,
    isCurator,
  };
};

export default usePermission;

