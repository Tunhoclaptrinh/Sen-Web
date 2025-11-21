import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Layout, Card } from "antd";

const { Content } = Layout;

const AuthLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Nếu đã đăng nhập thì đá về trang chủ
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ color: "#d4a574", margin: 0 }}>CultureVault</h1>
            <span style={{ color: "#888" }}>Lưu trữ & Bảo tồn Di sản</span>
          </div>
          <Outlet />
        </Card>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
