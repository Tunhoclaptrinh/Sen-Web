
import {
  BankOutlined,
  FileOutlined,
  UserOutlined,
  DashboardOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileImageOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store";
import UnifiedLayout from "../UnifiedLayout";
import { Badge } from "antd";

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

  const route = {
    routes: [
      {
        path: '/admin/dashboard',
        name: 'Dashboard',
        icon: <DashboardOutlined />,
      },
      {
        path: '/admin/heritage',
        name: 'Quản Lý Di Sản',
        icon: <BankOutlined />,
      },
      {
        path: '/admin/artifacts',
        name: 'Quản Lý Hiện Vật',
        icon: <FileOutlined />,
      },
      {
        path: '/admin/users',
        name: 'Quản Lý Người Dùng',
        icon: <UserOutlined />,
      },
      {
        name: 'Game CMS',
        icon: <TrophyOutlined />,
        routes: [
          { path: '/admin/game/chapters', name: 'Chapters' },
          { path: '/admin/game/levels', name: 'Levels' },
          { path: '/admin/game/characters', name: 'Characters' },
          { path: '/admin/game/screens', name: 'Screens' },
        ],
      },
      {
        path: '/admin/analytics',
        name: 'Analytics',
        icon: <BarChartOutlined />,
      },
      {
        name: 'Assets',
        icon: <FileImageOutlined />,
        routes: [
          { path: '/admin/assets/images', name: 'Images' },
          { path: '/admin/assets/videos', name: 'Videos' },
          { path: '/admin/assets/audio', name: 'Audio' },
        ],
      },
    ],
  };

  return (
    <UnifiedLayout
      route={route}
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
