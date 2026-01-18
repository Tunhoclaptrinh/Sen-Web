import {
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store";
import UnifiedLayout from "../UnifiedLayout";
import "./styles.less";

import { adminMenu } from "@/config/menu.config";
import NotificationPopover from "@/components/common/NotificationPopover";

const AdminLayout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const userMenuExtraItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/profile">Hồ sơ</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    { type: "divider" },
    {
      key: "back-to-site",
      icon: <DashboardOutlined />,
      label: <Link to="/">Về trang chủ</Link>,
    },
    { type: "divider" },
  ];

  return (
    <UnifiedLayout
      menu={{ request: async () => adminMenu }}
      user={user || undefined}
      onLogout={handleLogout}
      userMenuExtraItems={userMenuExtraItems}
      navTheme="light"
      actionsRender={() => [
        <NotificationPopover key="notifications" />
      ]}
    >
      <Outlet />
    </UnifiedLayout>
  );
};

export default AdminLayout;
