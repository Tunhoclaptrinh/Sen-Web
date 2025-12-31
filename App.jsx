import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ConfigProvider, theme as antdTheme, Spin } from "antd";
import { initializeAuth, forceLogout } from "./src/store/slices/authSlice";
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

import CharacterShowcase from "./src/pages/CharacterShowcase";

import { GlobalCharacterProvider } from "@/contexts/GlobalCharacterContext";
import GlobalCharacterOverlay from "@/components/GlobalCharacterOverlay";

// LOADING SCREEN COMPONENT
const LoadingScreen = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)",
    }}
  >
    <Spin size="large" tip="Đang tải..." />
  </div>
);

// MAIN APP COMPONENT
function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, loading } = useSelector(
    (state) => state.auth,
  );
  const { theme: uiTheme } = useSelector((state) => state.ui);

  // Initialize Auth on Mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Listen for Storage Changes (Multi-tab Logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // If token is removed in another tab, logout here too
      if (e.key === "sen_token" && !e.newValue) {
        dispatch(forceLogout());
        navigate("/login");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch, navigate]);

  // Show Loading Screen During Initialization
  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  // RENDER APP
  return (
    <ConfigProvider
      theme={{
        algorithm:
          uiTheme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#d4a574",
          borderRadius: 6,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      }}
    >
      <GlobalCharacterProvider>
        <GlobalCharacterOverlay />

        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <Login />
              }
            />
          </Route>

          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/heritage-sites" element={<HeritageListPage />} />
            <Route
              path="/heritage-sites/:id"
              element={<HeritageDetailPage />}
            />
            <Route path="/artifacts" element={<ArtifactListPage />} />
            <Route path="/artifacts/:id" element={<ArtifactDetailPage />} />
            <Route path="/character-showcase" element={<CharacterShowcase />} />
          </Route>

          {/* Protected Routes (Require Login) */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/collections" element={<Collections />} />
            </Route>
          </Route>

          {/* Admin Routes (Require Admin Role) */}
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

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </GlobalCharacterProvider>
    </ConfigProvider>
  );
}

export default App;
