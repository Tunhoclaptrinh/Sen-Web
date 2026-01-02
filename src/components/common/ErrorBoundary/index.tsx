import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { logger } from '@/utils/logger.utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * Catches React errors and displays a beautiful fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console and external service
    logger.error('[ErrorBoundary] Caught error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error reporting service (e.g., Sentry)
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              background: 'white',
              borderRadius: '16px',
              padding: '48px 32px',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            }}
          >
            <Result
              status="error"
              title={
                <span style={{ color: '#F43F5E', fontSize: '24px', fontWeight: 600 }}>
                  Oops! Có lỗi xảy ra
                </span>
              }
              subTitle={
                <div style={{ color: '#737373', fontSize: '16px', marginTop: '16px' }}>
                  <p>Đã xảy ra lỗi không mong muốn. Chúng tôi rất xin lỗi về sự bất tiện này.</p>
                  {import.meta.env.DEV && this.state.error && (
                    <details style={{ marginTop: '16px', textAlign: 'left' }}>
                      <summary style={{ cursor: 'pointer', color: '#F43F5E', fontWeight: 500 }}>
                        Chi tiết lỗi (Dev only)
                      </summary>
                      <pre
                        style={{
                          marginTop: '12px',
                          padding: '16px',
                          background: '#FAFAFA',
                          borderRadius: '8px',
                          fontSize: '12px',
                          overflow: 'auto',
                          maxHeight: '200px',
                        }}
                      >
                        {this.state.error.toString()}
                        {this.state.errorInfo && (
                          <>
                            {'\n\n'}
                            {this.state.errorInfo.componentStack}
                          </>
                        )}
                      </pre>
                    </details>
                  )}
                </div>
              }
              extra={
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ReloadOutlined />}
                    onClick={this.handleReset}
                    style={{
                      background: '#F43F5E',
                      borderColor: '#F43F5E',
                      borderRadius: '8px',
                      height: '44px',
                      padding: '0 24px',
                      fontSize: '16px',
                      fontWeight: 500,
                    }}
                  >
                    Thử lại
                  </Button>
                  <Button
                    size="large"
                    icon={<HomeOutlined />}
                    onClick={this.handleGoHome}
                    style={{
                      borderColor: '#F43F5E',
                      color: '#F43F5E',
                      borderRadius: '8px',
                      height: '44px',
                      padding: '0 24px',
                      fontSize: '16px',
                      fontWeight: 500,
                    }}
                  >
                    Về trang chủ
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
