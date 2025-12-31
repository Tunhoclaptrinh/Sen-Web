import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Spin } from "antd";
import { RootState } from "@/store";
import { initializeAuth } from "@/store/slices/authSlice";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  redirectTo = "/login",
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, isInitialized, loading } = useSelector(
    (state: RootState) => state.auth,
  );

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth() as any);
    }
  }, [dispatch, isInitialized]);

  // Show loading spinner during initialization
  if (!isInitialized || loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
