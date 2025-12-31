import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { USER_ROLES } from "@/config/constants";

import { RootState } from "@/types";

const AdminRoute = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== USER_ROLES.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
