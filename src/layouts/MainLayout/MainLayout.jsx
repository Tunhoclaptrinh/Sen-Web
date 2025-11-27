import { Layout, Menu, Dropdown, Button, Badge, Input, Drawer } from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useState } from "react";
import styles from "./MainLayout.module.css";
import logo from "@/assets/images/logo.png";

const { Header, Content, Footer } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [searchValue, setSearchValue] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/heritage-sites?q=${encodeURIComponent(searchValue)}`);
      setMobileMenuOpen(false);
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
      {/* Header */}
      <Header
        className={styles.header}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          position: "sticky",
          top: 0,
          zIndex: 999,
          height: 70,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              color: "#d4a574",
              backgroundImage: `url(${logo})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
              width: 90,
              height: 36,
            }}
          ></div>
        </Link>

        {/* Desktop Menu */}
        <Menu
          mode="horizontal"
          items={navMenuItems}
          style={{
            flex: 1,
            border: "none",
            marginLeft: 40,
          }}
          className={styles.desktopMenu}
        />

        {/* Desktop Search */}
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          style={{ width: 200, marginRight: 16 }}
          className={styles.desktopSearch}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onPressEnter={handleSearch}
        />

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Badge count={0}>
            <BellOutlined style={{ fontSize: "20px", cursor: "pointer" }} />
          </Badge>

          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text">{user?.name}</Button>
            </Dropdown>
          ) : (
            <>
              <Link to="/login">
                <Button type="primary" size="small">
                  Đăng Nhập
                </Button>
              </Link>
              <Link to="/login">
                <Button size="small">Đăng Ký</Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            className={styles.mobileMenuBtn}
          />
        </div>
      </Header>

      {/* Mobile Menu */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input
            placeholder="Tìm kiếm..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Menu
            mode="vertical"
            items={navMenuItems}
            style={{ border: "none" }}
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      </Drawer>

      {/* Content */}
      <Layout style={{ flex: 1 }}>
        <Content
          style={{
            padding: "40px 24px",
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* Footer */}
      <Footer
        style={{
          background: "#fafafa",
          borderTop: "1px solid #e8e8e8",
          padding: "40px 24px",
        }}
      >
        <div style={{ textAlign: "center", color: "#8c8c8c" }}>
          <p>&copy; 2024 CultureVault. Bảo tồn di sản văn hóa số.</p>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
