import { Layout, Menu, Dropdown, Button } from "antd";
import {
  BarChartOutlined,
  BankOutlined,
  FileOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@store/slices/authSlice";
import { useState } from "react";

const { Header, Sider, Content, Footer } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <BarChartOutlined />,
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
  ];

  const userMenu = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: `${user?.name}`,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng Xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: "#001529" }}
      >
        <div
          style={{
            padding: "16px",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          🏛️ Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          style={{ marginTop: "16px" }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />}>
              {user?.name}
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ padding: "24px", background: "#f5f5f5" }}>
          <Outlet />
        </Content>

        <Footer style={{ textAlign: "center", color: "#8c8c8c" }}>
          Sen Admin &copy; 2024
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
