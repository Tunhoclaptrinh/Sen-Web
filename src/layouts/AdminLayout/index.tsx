import {
  UserOutlined,
  DashboardOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store";
import UnifiedLayout from "../UnifiedLayout";
import { Badge } from "antd";
import "./styles.less";

import { adminMenu } from "@/config/menu.config";

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
      label: <Link to="/profile">Hồ Sơ</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài Đặt",
    },
    { type: "divider" },
    {
      key: "back-to-site",
      icon: <DashboardOutlined />,
      label: <Link to="/">Về Trang Chủ</Link>,
    },
    { type: "divider" },
  ];

  return (
    <UnifiedLayout
      route={{ routes: adminMenu }}
      user={user || undefined}
      onLogout={handleLogout}
      userMenuExtraItems={userMenuExtraItems}
      navTheme="light"
      actionsRender={() => [
        <Badge count={0} key="notifications" style={{ marginTop: 5 }}>
          <BellOutlined
            style={{
              fontSize: 18,
              cursor: "pointer",
              padding: '0 8px',
            }}
          />
        </Badge>
      ]}
    >
      <Outlet />
    </UnifiedLayout>
  );
};

export default AdminLayout;
