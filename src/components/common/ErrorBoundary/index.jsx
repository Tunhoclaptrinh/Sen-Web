import React from "react";
import { Result, Button } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // You can also log to an error reporting service here
    this.setState({
      error,
      errorInfo,
    });

    // Optional: Send to error tracking service (Sentry, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            padding: "24px",
            background: "#f5f5f5",
          }}
        >
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
            title="Oops! Đã có lỗi xảy ra"
            subTitle="Xin lỗi, có gì đó không ổn. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn."
            extra={[
              <Button type="primary" onClick={this.handleReload} key="reload">
                Tải Lại Trang
              </Button>,
              <Button onClick={this.handleReset} key="reset">
                Thử Lại
              </Button>,
            ]}
          >
            {import.meta.env.DEV && this.state.error && (
              <div
                style={{
                  textAlign: "left",
                  padding: "16px",
                  background: "#fff",
                  borderRadius: "8px",
                  marginTop: "24px",
                  maxWidth: "600px",
                  margin: "24px auto 0",
                }}
              >
                <details style={{ whiteSpace: "pre-wrap" }}>
                  <summary
                    style={{
                      cursor: "pointer",
                      marginBottom: "8px",
                      fontWeight: 600,
                    }}
                  >
                    Chi tiết lỗi (Development Only)
                  </summary>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    <strong>Error:</strong>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: "8px",
                        borderRadius: "4px",
                        overflow: "auto",
                      }}
                    >
                      {this.state.error.toString()}
                    </pre>
                    <strong>Stack Trace:</strong>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: "8px",
                        borderRadius: "4px",
                        overflow: "auto",
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
