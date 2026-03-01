import React, {useState} from "react";
import {Button} from "antd";
import {
  TrophyOutlined,
  GiftOutlined,
  MessageOutlined,
  UserOutlined,
  BookOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {Outlet, useNavigate, useLocation} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "@/store/slices/authSlice";
import {RootState} from "@/store";
import {setOverlayOpen} from "@/store/slices/aiSlice";
import {fetchProgress} from "@/store/slices/gameSlice";
import UnifiedLayout from "../UnifiedLayout";
import "./styles.less";
import {customerMenu} from "@/config/menu.config";
import NotificationPopover from "@/components/common/NotificationPopover";
import DailyRewardModal from "@/components/common/DailyRewardModal";

const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {user} = useSelector((state: RootState) => state.auth);
  const {progress} = useSelector((state: RootState) => state.game);

  const [dailyRewardVisible, setDailyRewardVisible] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    dispatch(fetchProgress() as any);
  }, [dispatch, location.pathname]);

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate("/login");
  };

  const userMenuExtraItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
      onClick: () => navigate("/profile"),
    },
    {
      key: "collections",
      icon: <BookOutlined />,
      label: "Bộ sưu tập",
      onClick: () => navigate("/profile/library"),
    },
    {
      type: "divider",
    },
  ];

  return (
    <div className="customer-layout-wrapper sen-hoa-premium">
      <UnifiedLayout
        menu={{request: async () => customerMenu}}
        user={user || undefined}
        onLogout={handleLogout}
        userMenuExtraItems={userMenuExtraItems}
        navTheme="light"
        actionsRender={() => [
          <div
            className="progress-stats"
            key="stats"
            style={{display: "flex", gap: 16, alignItems: "center", marginRight: 12, pointerEvents: "none"}}
          >
            <div className="stat-item" style={{display: "flex", gap: 4, alignItems: "center"}}>
              <TrophyOutlined style={{color: "#ffd700"}} />
              <span>{progress?.totalPoints || 0}</span>
            </div>
            <div className="stat-item" style={{display: "flex", gap: 4, alignItems: "center"}}>
              <span style={{fontSize: 16}}>🌸</span>
              <span>{progress?.totalSenPetals || 0}</span>
            </div>
            <div className="stat-item" style={{display: "flex", gap: 4, alignItems: "center"}}>
              <DollarOutlined style={{fontSize: 16, color: "#ffd700"}} />
              <span>{progress?.coins || 0}</span>
            </div>
          </div>,
          <Button
            key="gift"
            type="text"
            className="header-action-btn"
            icon={<GiftOutlined />}
            onClick={() => setDailyRewardVisible(true)}
          />,
          <Button
            key="chat"
            type="text"
            className="header-action-btn"
            icon={<MessageOutlined />}
            onClick={() => dispatch(setOverlayOpen({open: true, mode: "fixed"}))}
          />,
          <NotificationPopover key="bell" />,
        ]}
      >
        <Outlet />
      </UnifiedLayout>

      <DailyRewardModal visible={dailyRewardVisible} onClose={() => setDailyRewardVisible(false)} />
    </div>
  );
};

export default CustomerLayout;
