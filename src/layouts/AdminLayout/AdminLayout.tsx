import { Layout, Menu, Button, Dropdown, MenuProps, Badge, Avatar } from "antd";
import {
  BankOutlined,
  FileOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useState, useEffect } from "react";
import logo from "../../assets/images/logo.png";
import { AppDispatch, RootState } from "../../store";

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle Window Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto collapse on mobile
      if (mobile) {
        setCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle Logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Get Active Menu Key
  const getActiveKey = () => {
    const path = location.pathname;
    if (path.includes("/admin/dashboard")) return "dashboard";
    if (path.includes("/admin/heritage")) return "heritage";
    if (path.includes("/admin/artifacts")) return "artifacts";
    if (path.includes("/admin/users")) return "users";
    return "dashboard";
  };

  // Menu Items
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/admin/dashboard">Dashboard</Link>,
    },
    {
      key: "heritage",
      icon: <BankOutlined />,
      label: <Link to="/admin/heritage">Quản Lý Di Sản</Link>,
    },
    {
      key: "artifacts",
      icon: <FileOutlined />,
      label: <Link to="/admin/artifacts">Quản Lý Hiện Vật</Link>,
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Quản Lý Người Dùng</Link>,
    },
    {
      key: "game-cms",
      icon: <TrophyOutlined />,
      label: "Game CMS",
      children: [
        {
          key: "chapters",
          label: <Link to="/admin/game/chapters">Chapters</Link>,
        },
        {
          key: "levels",
          label: <Link to="/admin/game/levels">Levels</Link>,
        },
        {
          key: "characters",
          label: <Link to="/admin/game/characters">Characters</Link>,
        },
        {
          key: "screens",
          label: <Link to="/admin/game/screens">Screens</Link>,
        },
      ],
    },
    {
      key: "analytics",
      icon: <BarChartOutlined />,
      label: <Link to="/admin/analytics">Analytics</Link>,
    },
    {
      key: "assets",
      icon: <FileImageOutlined />,
      label: "Assets",
      children: [
        {
          key: "images",
          label: <Link to="/admin/assets/images">Images</Link>,
        },
        {
          key: "videos",
          label: <Link to="/admin/assets/videos">Videos</Link>,
        },
        {
          key: "audio",
          label: <Link to="/admin/assets/audio">Audio</Link>,
        },
      ],
    },
  ];

  // User Menu Items
  const userMenuItems: MenuProps['items'] = [
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
    { type: "divider" as const },
    {
      key: "back-to-site",
      icon: <DashboardOutlined />,
      label: <Link to="/">Về Trang Chủ</Link>,
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng Xuất",
      onClick: handleLogout,
      danger: true,
    },
  ];

  // RENDER
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          background: "#001529",
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? "16px 0" : "16px",
            textAlign: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {collapsed ? (
            <div
              style={{
                width: 32,
                height: 32,
                margin: "0 auto",
                background: "#d4a574",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              S
            </div>
          ) : (
            <div
              style={{
                backgroundImage: `url(${logo})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                height: 40,
                filter: "brightness(0) invert(1)",
              }}
            />
          )}
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getActiveKey()]}
          items={menuItems}
          style={{ marginTop: 16 }}
        />
      </Sider>

      {/* MAIN LAYOUT */}
      <Layout
        style={{
          marginLeft: collapsed ? (isMobile ? 0 : 80) : 200,
          transition: "all 0.2s",
        }}
      >
        {/* HEADER */}

        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "sticky",
            top: 0,
            zIndex: 998,
          }}
        >
          {/* Trigger Button */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 16,
              width: 48,
              height: 48,
            }}
          />

          {/* Right Side */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {/* Notifications */}
            <Badge count={0}>
              <BellOutlined
                style={{
                  fontSize: 18,
                  cursor: "pointer",
                  color: "#595959",
                }}
              />
            </Badge>

            {/* User Dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "4px 12px",
                  borderRadius: 8,
                  transition: "background 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f5f5f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <Avatar
                  size="default"
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  style={{ background: "#d4a574" }}
                />
                {!isMobile && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {user?.name}
                    </span>
                    <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                      Admin
                    </span>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* CONTENT */}
        <Content
          style={{
            padding: isMobile ? 16 : 24,
            background: "#f5f5f5",
            minHeight: "calc(100vh - 64px - 70px)",
          }}
        >
          <Outlet />
        </Content>

        {/* FOOTER */}
        <Footer
          style={{
            textAlign: "center",
            color: "#8c8c8c",
            background: "#fff",
            borderTop: "1px solid #e8e8e8",
          }}
        >
          Sen Admin &copy; 2024
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
