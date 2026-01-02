import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import "./styles.less";

const { Content } = Layout;

const AuthLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Content>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AuthLayout;
