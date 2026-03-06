import React, { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Tooltip } from "antd";
import {
  RocketOutlined,
  BookOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import senHead from "@/assets/images/SenChibi/face.png";
import { setOverlayOpen } from "@/store/slices/aiSlice";
import { useDispatch } from "react-redux";
import "./QuickActions.less";

/**
 * QuickActionButtons Component
 * Includes Sen toggle button + role-based quick action buttons
 */
interface QuickActionButtonsProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  isMinimized,
  onToggleMinimize,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isOverlayOpen, layoutMode } = useSelector((state: RootState) => state.ai);
  const [isMenuExpanded, setIsMenuExpanded] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuExpanded(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuExpanded(false);
      }
    };

    if (isMenuExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuExpanded]);


  // Hide AI Chat in active gameplay routes
  const isGameplayRoute = location.pathname.includes('/game/play') || location.pathname.includes('/game/learning');



  // Role-based buttons (lowercase to match enum values)
  const renderRoleButtons = () => {
    if (!isAuthenticated || !user) return null;

    switch (user.role) {
      case "admin":
        return (
          <div className="speed-dial-item">
            <span className="speed-dial-label">Dashboard</span>
            <Tooltip title="Dashboard" placement="left" open={false}>
              <button
                className="quick-action-btn quick-action-btn--dashboard"
                onClick={() => navigate("/admin/dashboard")}
              >
                <DashboardOutlined />
              </button>
            </Tooltip>
          </div>
        );

      case "customer":
        // Hide "Explore Game" (Rocket) button if already in game module
        if (location.pathname.startsWith("/game")) return null;

        return (
          <div className="speed-dial-item">
            <span className="speed-dial-label">Khám phá game</span>
            <Tooltip title="Khám phá game" placement="left" open={false}>
              <button
                className="quick-action-btn quick-action-btn--game"
                onClick={() => navigate("/game/dashboard")}
              >
                <RocketOutlined />
              </button>
            </Tooltip>
          </div>
        );

      case "researcher":
        return (
          <>
            <div className="speed-dial-item">
              <span className="speed-dial-label">Nội dung của tôi</span>
              <Tooltip title="Nội dung của tôi" placement="left" open={false}>
                <button
                  className="quick-action-btn quick-action-btn--research"
                  onClick={() => navigate("/researcher/heritage-sites")}
                >
                  <FileTextOutlined />
                </button>
              </Tooltip>
            </div>
            {/* Show Game button for researcher if not already in game module */}
            {!location.pathname.startsWith("/game") && (
              <div className="speed-dial-item">
                <span className="speed-dial-label">Khám phá game</span>
                <Tooltip title="Khám phá game" placement="left" open={false}>
                  <button
                    className="quick-action-btn quick-action-btn--game"
                    onClick={() => navigate("/game/dashboard")}
                  >
                    <RocketOutlined />
                  </button>
                </Tooltip>
              </div>
            )}
          </>
        );

      case "curator":
        return (
          <>
            <div className="speed-dial-item">
              <span className="speed-dial-label">Bộ sưu tập</span>
              <Tooltip title="Bộ sưu tập" placement="left" open={false}>
                <button
                  className="quick-action-btn quick-action-btn--collection"
                  onClick={() => navigate("/profile/library")}
                >
                  <BookOutlined />
                </button>
              </Tooltip>
            </div>
            <div className="speed-dial-item">
              <span className="speed-dial-label">Khám phá</span>
              <Tooltip title="Khám phá" placement="left" open={false}>
                <button
                  className="quick-action-btn quick-action-btn--explore"
                  onClick={() => navigate("/heritage-sites")}
                >
                  <ExperimentOutlined />
                </button>
              </Tooltip>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`quick-actions-container ${isMenuExpanded ? "expanded" : ""}`}
      style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}
    >
      <div className="speed-dial-actions">
        {/* Role-based Quick Action Buttons */}
        {renderRoleButtons()}

        {/* AI Chat Button */}
        {!isGameplayRoute && (
          <div className="speed-dial-item">
            <span className="speed-dial-label">Chat với AI Hub</span>
            <Tooltip title="Chat với AI Hub" placement="left" open={false}>
              <button
                className="quick-action-btn quick-action-btn--ai"
                onClick={() => {
                  dispatch(setOverlayOpen({ open: true, mode: "fixed" }));
                  setIsMenuExpanded(false);
                }}
                style={{
                  background:
                    isOverlayOpen && layoutMode === "fixed"
                      ? "linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)"
                      : "white",
                  border: isOverlayOpen && layoutMode === "fixed" ? "none" : "2px solid var(--primary-color)",
                  color: isOverlayOpen && layoutMode === "fixed" ? "white" : "var(--primary-color)",
                }}
              >
                <CommentOutlined />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Sen Visibility Toggle (Moved inside menu) */}
        <div className="speed-dial-item">
          <span className="speed-dial-label">{isMinimized ? "Gọi Sen" : "Ẩn Sen"}</span>
          <Tooltip title={isMinimized ? "Hiện Sen" : "Ẩn Sen"} placement="left" open={false}>
            <button
              className={`quick-action-btn quick-action-btn--toggle-sen ${!isMinimized ? "active" : ""}`}
              onClick={() => {
                onToggleMinimize();
                setIsMenuExpanded(false);
              }}
            >
              <img src={senHead} alt="Sen" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main Trigger Button */}
      <Tooltip title={isMenuExpanded ? "Đóng menu" : "Tiện ích nhanh"} placement="left">
        <button
          className={`main-fab-trigger ${isMenuExpanded ? "active" : ""}`}
          onClick={() => setIsMenuExpanded(!isMenuExpanded)}
        >
          <div className="trigger-icon-wrapper">
            <RocketOutlined className="trigger-icon default" />
            <span className="trigger-icon close">&times;</span>
          </div>
        </button>
      </Tooltip>
    </div>
  );
};

export default QuickActionButtons;
