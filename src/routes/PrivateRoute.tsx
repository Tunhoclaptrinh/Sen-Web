import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

import { RootState } from "@/types";

const PrivateRoute = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
