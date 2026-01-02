import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/components/common/Loading";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
}) => {
  const { isAuthenticated, isInitialized, hasRole, loading } = useAuth();
  const location = useLocation();

  // 1. Chờ Auth khởi tạo xong (check token từ local storage)
  if (!isInitialized || (loading && !isAuthenticated)) {
    return <Loading fullScreen message="Đang xác thực..." />;
  }

  // 2. Nếu yêu cầu đăng nhập mà chưa đăng nhập -> Redirect Login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Nếu đã đăng nhập nhưng route yêu cầu Roles cụ thể
  if (requireAuth && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    // User không đủ quyền -> Chuyển về trang 403 hoặc Home
    // Ở đây tạm thời chuyển về Home và báo lỗi (có thể thêm state notification)
    return <Navigate to="/" replace />;
  }

  // 4. Nếu route public (ví dụ Login) mà user đã đăng nhập -> Redirect vào trong
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
