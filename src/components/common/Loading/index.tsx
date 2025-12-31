import React from "react";
import { Spin, SpinProps } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface LoadingProps extends SpinProps {
  fullScreen?: boolean;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message = "Đang tải...",
  size = "large",
  ...props
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

  if (fullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255, 255, 255, 0.9)",
          zIndex: 9999,
        }}
      >
        <Spin indicator={antIcon} tip={message} size={size} {...props} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "50px 20px",
      }}
    >
      <Spin indicator={antIcon} tip={message} size={size} {...props} />
    </div>
  );
};

export default Loading;
