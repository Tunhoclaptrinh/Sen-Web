import { Layout, Menu, Dropdown, Button, Badge, Input, Spin } from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@store/slices/authSlice";
import { useState } from "react";
import styles from "./MainLayout.module.css";

const { Header, Content, Footer, Sider } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/heritage-sites?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/profile">Hồ Sơ</Link>,
    },
    {
      key: "collections",
      label: <Link to="/collections">Bộ Sưu Tập</Link>,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng Xuất",
      onClick: handleLogout,
    },
  ];

  const navMenuItems = [
    { key: "home", label: <Link to="/">Trang Chủ</Link> },
    { key: "heritage", label: <Link to="/heritage-sites">Di Sản</Link> },
    { key: "artifacts", label: <Link to="/artifacts">Hiện Vật</Link> },
  ];

  return (
    <Layout
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Header
        className={styles.header}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 999,
        }}
      >
        <div
          className={styles.logo}
          style={{ fontSize: "20px", fontWeight: "bold", color: "#d4a574" }}
        >
          🏛️ CultureVault
        </div>

        <Menu
          mode="horizontal"
          items={navMenuItems}
          style={{ flex: 1, border: "none", marginLeft: 24 }}
        />

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Input
            placeholder="Tìm kiếm di sản..."
            prefix={<SearchOutlined />}
            style={{ width: 200, borderRadius: 4 }}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
          />

          <Badge count={0} offset={[-8, 8]}>
            <BellOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
          </Badge>

          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                {user?.name || "User"}
              </Button>
            </Dropdown>
          ) : (
            <>
              <Link to="/login">
                <Button type="primary">Đăng Nhập</Button>
              </Link>
              <Link to="/register">
                <Button>Đăng Ký</Button>
              </Link>
            </>
          )}
        </div>
      </Header>

      <Layout style={{ flex: 1 }}>
        <Content
          style={{
            padding: "24px",
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      <Footer
        style={{
          textAlign: "center",
          color: "#8c8c8c",
          borderTop: "1px solid #e8e8e8",
          marginTop: "auto",
        }}
      >
        <p>&copy; 2024 CultureVault. Bảo tồn di sản văn hóa số.</p>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
