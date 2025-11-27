import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";
import { getMe } from "./src/store/slices/authSlice";
import MainLayout from "./src/layouts/MainLayout";
import AdminLayout from "./src/layouts/AdminLayout";
import AuthLayout from "./src/layouts/AuthLayout";
import PrivateRoute from "./src/routes/PrivateRoute";
import AdminRoute from "./src/routes/AdminRoute";

// Pages
import Home from "./src/pages/Home/Home";
import HeritageListPage from "./src/pages/Heritage/HeritageListPage";
import HeritageDetailPage from "./src/pages/Heritage/HeritageDetailPage";
import ArtifactListPage from "./src/pages/Artifact/ArtifactListPage";
import ArtifactDetailPage from "./src/pages/Artifact/ArtifactDetailPage";
import Login from "./src/pages/Auth/Login";
import Profile from "./src/pages/Profile/Profile";
import Collections from "./src/pages/Profile/Collections";
import NotFound from "./src/pages/NotFound/NotFound";

// Admin Pages
import Dashboard from "./src/pages/Admin/Dashboard";
import HeritageManagement from "./src/pages/Admin/HeritageManagement";
import ArtifactManagement from "./src/pages/Admin/ArtifactManagement";
import UserManagement from "./src/pages/Admin/UserManagement";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const { theme: uiTheme } = useSelector((state) => state.ui);

  useEffect(() => {
    if (token && isAuthenticated) {
      dispatch(getMe());
    }
  }, [dispatch, token, isAuthenticated]);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          uiTheme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/login" element={<RegisLoginter />} /> */}
        </Route>

        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/heritage-sites" element={<HeritageListPage />} />
          <Route path="/heritage-sites/:id" element={<HeritageDetailPage />} />
          <Route path="/artifacts" element={<ArtifactListPage />} />
          <Route path="/artifacts/:id" element={<ArtifactDetailPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/collections" element={<Collections />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/heritage" element={<HeritageManagement />} />
            <Route path="/admin/artifacts" element={<ArtifactManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
