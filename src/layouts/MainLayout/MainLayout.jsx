import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Layout, Menu, Button, Avatar, Dropdown, Space } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { logout } from "@store/slices/authSlice";
import { getAvatarUrl } from "@utils/helpers";

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Menu cho User Dropdown
  const userMenu = {
    items: [
      {
        key: "profile",
        label: <Link to="/profile">Hồ sơ cá nhân</Link>,
        icon: <UserOutlined />,
      },
      {
        key: "collections",
        label: <Link to="/collections">Bộ sưu tập của tôi</Link>,
        icon: <AppstoreOutlined />,
      },
      { type: "divider" },
      {
        key: "logout",
        label: "Đăng xuất",
        icon: <LogoutOutlined />,
        onClick: handleLogout,
        danger: true,
      },
    ],
  };

  // Menu chính
  const navItems = [
    {
      key: "home",
      label: <Link to="/">Trang chủ</Link>,
      icon: <HomeOutlined />,
    },
    { key: "heritage", label: <Link to="/heritage-sites">Di tích</Link> },
    { key: "artifact", label: <Link to="/artifacts">Hiện vật</Link> },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          boxShadow: "0 2px 8px #f0f1f2",
          padding: "0 24px",
        }}
      >
        <div
          className="logo"
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#d4a574",
            marginRight: "40px",
          }}
        >
          <Link to="/" style={{ color: "inherit" }}>
            CultureVault
          </Link>
        </div>

        <Menu
          mode="horizontal"
          items={navItems}
          style={{ flex: 1, borderBottom: "none" }}
        />

        <div className="auth-actions">
          {isAuthenticated && user ? (
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <span style={{ fontWeight: 500 }}>{user.name}</span>
                <Avatar
                  src={user.avatar || getAvatarUrl(user.name)}
                  icon={<UserOutlined />}
                />
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Link to="/login">
                <Button type="text">Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button type="primary">Đăng ký</Button>
              </Link>
            </Space>
          )}
        </div>
      </Header>

      <Content
        style={{
          padding: "24px",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#fff",
            minHeight: 280,
            padding: 24,
            borderRadius: 8,
          }}
        >
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: "center", background: "#f0f2f5" }}>
        CultureVault ©{new Date().getFullYear()} - Nền tảng Di sản số
      </Footer>
    </Layout>
  );
};

export default MainLayout;
