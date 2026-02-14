import React from "react";
import "./styles.less";
import {Layout} from "antd";
import {Outlet} from "react-router-dom";
import CustomFooter from "@/components/Footer";
import Header from "@/components/Header";

const {Content} = Layout;

const MainLayout: React.FC = () => {
  return (
    <Layout className="public-layout" style={{minHeight: "100vh", background: "#fff"}}>
      <Header />

      {/* CONTENT */}
      <Content
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          paddingTop: 0,
        }}
      >
        <Outlet />
      </Content>

      {/* FOOTER */}
      <CustomFooter />
    </Layout>
  );
};

export default MainLayout;
