// src/components/common/LoadingState/index.tsx
import React from "react";
import { Spin, Skeleton, Card, Row, Col } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import type { SpinProps } from "antd";

interface LoadingStateProps {
  // Display modes
  mode?: "spinner" | "skeleton" | "inline";
  variant?: "card" | "list" | "table" | "form";

  // Spinner props
  tip?: string;
  size?: SpinProps["size"]; // 'small' | 'default' | 'large'
  fullScreen?: boolean;

  // Skeleton props
  rows?: number;
  columns?: number;
  avatar?: boolean;
  title?: boolean;
  paragraph?: boolean;

  // Custom styles
  style?: React.CSSProperties;
  className?: string;

  children?: React.ReactNode;
}

const LoadingState: React.FC<LoadingStateProps> & {
  Card: React.FC<LoadingStateProps>;
  List: React.FC<LoadingStateProps>;
  Table: React.FC<LoadingStateProps>;
  Form: React.FC<LoadingStateProps>;
  Spinner: React.FC<LoadingStateProps>;
  Inline: React.FC<LoadingStateProps>;
  FullScreen: React.FC<LoadingStateProps>;
} = ({
  mode = "spinner",
  variant = "card",

  tip = "Đang tải...",
  size = "large",
  fullScreen = false,

  rows = 3,
  columns = 1,
  avatar = false,
  title = true,

  style,
  className,
  children,
}) => {
  // Validate size (fix TypeScript literal issue)
  const validSize: SpinProps["size"] = ["small", "default", "large"].includes(
    size as string,
  )
    ? (size as SpinProps["size"])
    : "large";

  // ================== SPINNER MODE ==================
  if (mode === "spinner") {
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
            background: "rgba(255,255,255,0.9)",
            zIndex: 9999,
            ...style,
          }}
          className={className}
        >
          <Spin indicator={antIcon} tip={tip} size={validSize} />
        </div>
      );
    }

    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px 20px",
          ...style,
        }}
        className={className}
      >
        <Spin indicator={antIcon} tip={tip} size={validSize} />
      </div>
    );
  }

  // ================== INLINE MODE ==================
  if (mode === "inline") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          ...style,
        }}
        className={className}
      >
        <Spin size={validSize} />
        {tip && <span>{tip}</span>}
      </div>
    );
  }

  // ================== SKELETON MODE ==================
  if (mode === "skeleton") {
    // Card skeleton
    if (variant === "card") {
      return (
        <Row gutter={[16, 16]} style={style} className={className}>
          {Array.from({ length: columns }).map((_, index) => (
            <Col
              key={index}
              xs={24}
              sm={columns > 1 ? 12 : 24}
              md={columns > 2 ? 8 : columns > 1 ? 12 : 24}
              lg={columns > 3 ? 6 : columns > 2 ? 8 : columns > 1 ? 12 : 24}
            >
              <Card>
                <Skeleton
                  active
                  avatar={avatar}
                  title={title}
                  paragraph={{ rows }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      );
    }

    // List
    if (variant === "list") {
      return (
        <div style={{ padding: 16, ...style }} className={className}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <Skeleton
                active
                avatar={avatar}
                title={title}
                paragraph={{ rows: 2 }}
              />
            </div>
          ))}
        </div>
      );
    }

    // Table
    if (variant === "table") {
      return (
        <div style={{ padding: 16, ...style }} className={className}>
          <Skeleton.Input active style={{ width: "100%", marginBottom: 16 }} />
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} active paragraph={{ rows: 1 }} title={false} />
          ))}
        </div>
      );
    }

    // Form
    if (variant === "form") {
      return (
        <div
          style={{ padding: 24, maxWidth: 600, ...style }}
          className={className}
        >
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <Skeleton.Input active style={{ width: "100%", height: 40 }} />
            </div>
          ))}
          <Skeleton.Button active style={{ width: 120, height: 40 }} />
        </div>
      );
    }

    // Default skeleton
    return (
      <div style={{ padding: 24, ...style }} className={className}>
        <Skeleton active avatar={avatar} title={title} paragraph={{ rows }} />
      </div>
    );
  }

  return children || null;
};

// ================== PRESET SHORTCUTS ==================
LoadingState.Card = (props) => (
  <LoadingState mode="skeleton" variant="card" {...props} />
);
LoadingState.List = (props) => (
  <LoadingState mode="skeleton" variant="list" {...props} />
);
LoadingState.Table = (props) => (
  <LoadingState mode="skeleton" variant="table" {...props} />
);
LoadingState.Form = (props) => (
  <LoadingState mode="skeleton" variant="form" {...props} />
);
LoadingState.Spinner = (props) => <LoadingState mode="spinner" {...props} />;
LoadingState.Inline = (props) => <LoadingState mode="inline" {...props} />;
LoadingState.FullScreen = (props) => (
  <LoadingState mode="spinner" fullScreen {...props} />
);

export default LoadingState;
