import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRoutes, useNavigate } from "react-router-dom";
import { ConfigProvider, theme as antdTheme, App as AntApp } from "antd";
import viVN from "antd/locale/vi_VN";
import { forceLogout, initializeAuth } from "./src/store/slices/authSlice";
import { RootState } from "./src/store";
import routes from "./src/routes/routes.config";
import Loading from "./src/components/common/Loading";
import ErrorBoundary from "./src/components/common/ErrorBoundary";
import { GlobalCharacterProvider } from "./src/contexts/GlobalCharacterContext";
import GlobalCharacterOverlay from "./src/components/GlobalCharacterOverlay";

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
            colorPrimary: "#d4a574",
            borderRadius: 6,
            fontFamily:
              "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          },
          components: {
            Button: {
              controlHeight: 40,
              fontSize: 14,
            },
            Input: {
              controlHeight: 40,
              fontSize: 14,
            },
            Select: {
              controlHeight: 40,
              fontSize: 14,
            },
          },
        }}
      >
        <AntApp>
          <GlobalCharacterProvider>
            <GlobalCharacterOverlay />
            {routing}
          </GlobalCharacterProvider>
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
