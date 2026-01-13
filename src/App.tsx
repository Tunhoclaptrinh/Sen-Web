import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRoutes, useNavigate } from "react-router-dom";
import { ConfigProvider, theme as antdTheme, App as AntApp } from "antd";
import viVN from "antd/locale/vi_VN";
import { forceLogout, initializeAuth } from "./store/slices/authSlice";
import { RootState } from "./store";
import routes from "./routes/routes.config";
import Loading from "./components/common/Loading";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ToastProvider } from "./components/common/Toast";
import { GlobalCharacterProvider } from "./contexts/GlobalCharacterContext";
import GlobalCharacterOverlay from "./components/GlobalCharacterOverlay";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const routing = useRoutes(routes);

  const { isInitialized, loading } = useSelector(
    (state: RootState) => state.auth,
  );
  const { theme: uiTheme } = useSelector((state: RootState) => state.ui);

  // Initialize Auth on Mount
  useEffect(() => {
    dispatch(initializeAuth() as any);
  }, [dispatch]);

  // Listen for Storage Changes (Multi-tab Logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
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
    return <Loading fullScreen message="Đang khởi tạo..." />;
  }

  return (
    <ErrorBoundary>
      <ConfigProvider
        locale={viVN}
        theme={{
          algorithm:
            uiTheme === "dark"
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
          token: {
            // Lotus Pink Theme
            colorPrimary: "var(--primary-color)",
            colorSuccess: "#22C55E",
            colorWarning: "#F97316",
            colorError: "#EF4444",
            colorInfo: "#3B82F6",

            // Border & Radius
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 6,

            // Typography
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 14,

            // Spacing
            padding: 16,
            margin: 16,
          },
          components: {
            Button: {
              controlHeight: 40,
              fontSize: 14,
              borderRadius: 8,
              primaryColor: "#FFFFFF",
            },
            Input: {
              controlHeight: 40,
              fontSize: 14,
              borderRadius: 8,
            },
            Select: {
              controlHeight: 40,
              fontSize: 14,
              borderRadius: 8,
            },
            Card: {
              borderRadiusLG: 12,
            },
            Modal: {
              borderRadiusLG: 16,
            },
          },
        }}
      >
        <AntApp>
          <ToastProvider>
            <GlobalCharacterProvider>
              <GlobalCharacterOverlay />
              {routing}
            </GlobalCharacterProvider>
          </ToastProvider>
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;

