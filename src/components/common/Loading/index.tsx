import React from "react";
import { Spin, SpinProps } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./styles.less";

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
  const antIcon = <LoadingOutlined className="loading-icon" spin />;

  return (
    <div className={`loading-container ${fullScreen ? "loading-container--fullscreen" : ""}`}>
      <Spin indicator={antIcon} tip={message} size={size} {...props} />
    </div>
  );
};

export default Loading;
