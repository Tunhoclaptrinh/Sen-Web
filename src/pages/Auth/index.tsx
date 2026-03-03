import { useState } from "react";
import {
  Input,
  Button,
  Card,
  message,
  Checkbox,
  Row,
  Typography,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  FacebookFilled,
  GoogleCircleFilled,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useAppDispatch } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import { login } from "../../store/slices/authSlice";
import logo from "@/assets/images/logo2.png";
import { motion, AnimatePresence } from "framer-motion";
import Background from "@/components/Background";
import "./styles.less";

const { Text, Paragraph, Title } = Typography;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const formVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.25, ease: "easeOut" },
  };

  // const { isAuthenticated } = useAppSelector((state) => state.auth); // Unused currently, commenting out or removing to prevent lint error

  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};
    if (!loginEmail) newErrors.loginEmail = "Vui lòng nhập email";
    else if (!validateEmail(loginEmail))
      newErrors.loginEmail = "Email không hợp lệ";

    if (!loginPassword) newErrors.loginPassword = "Vui lòng nhập mật khẩu";
    else if (loginPassword.length < 6)
      newErrors.loginPassword = "Mật khẩu phải ít nhất 6 ký tự";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await dispatch(
        login({ email: loginEmail, password: loginPassword }),
      ).unwrap();

      message.success("Đăng nhập thành công!");
      navigate("/"); // tự chuyển trang
    } catch (error: any) {
      message.error(`❌ ${error || "Đăng nhập thất bại"}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };

  return (
    <Background>
      <div
        style={{
          minHeight: "100vh",
          // backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: isLogin ? 450 : 520,
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.47)",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            transition: "max-width 0.3s ease",
          }}
          hoverable
        >
          {/* HEADER */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                width: 120,
                height: 60,
                objectFit: "contain",
                filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))",
              }}
            />

            <Paragraph
              style={{
                color: "#d4a574",
                fontWeight: 500,
                marginBottom: 0,
                marginTop: 12,
                fontSize: 16,
              }}
            >
              Kiến tạo trải nghiệm lịch sử, văn hoá bằng công nghệ
            </Paragraph>
          </div>

          {/* LOGIN FORM */}
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={formVariants}
                style={{ width: "100%" }}
              >
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nhập email"
                      size="large"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onPressEnter={handleLogin}
                      status={errors.loginEmail ? "error" : ""}
                      style={{
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.2)",
                        color: "#fff",
                      }}
                    />
                    {errors.loginEmail && (
                      <Text
                        style={{
                          color: "#ff6b6b",
                          fontSize: 12,
                          display: "block",
                          marginTop: 4,
                        }}
                      >
                        {errors.loginEmail}
                      </Text>
                    )}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Nhập mật khẩu"
                      size="large"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onPressEnter={handleLogin}
                      status={errors.loginPassword ? "error" : ""}
                      style={{
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.2)",
                        color: "#fff",
                      }}
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                    {errors.loginPassword && (
                      <Text
                        style={{
                          color: "#ff6b6b",
                          fontSize: 12,
                          display: "block",
                          marginTop: 4,
                        }}
                      >
                        {errors.loginPassword}
                      </Text>
                    )}
                  </div>

                  <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: 20 }}
                  >
                    <Checkbox
                      style={{ color: "white" }}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    >
                      Ghi nhớ đăng nhập
                    </Checkbox>
                    <Button
                      type="link"
                      style={{ color: "#d4a574", padding: 0 }}
                    >
                      Quên mật khẩu?
                    </Button>
                  </Row>

                  <Button
                    onClick={handleLogin}
                    loading={loading}
                    block
                    size="large"
                    style={{
                      color: "white",
                      background: "linear-gradient(135deg, #d4a574, #c27d4f)",
                      border: "none",
                      fontWeight: 600,
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(212, 165, 116, 0.45)",
                      transition: "0.25s",
                      marginBottom: 20,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 0 18px rgba(212,165,116,0.75)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(212,165,116,0.45)";
                    }}
                  >
                    {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* REGISTER FORM */
              <motion.div
                key="register"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={formVariants}
                style={{ width: "100%" }}
              >
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <div style={{
                    background: 'rgba(212, 165, 116, 0.1)',
                    border: '1px solid rgba(212, 165, 116, 0.3)',
                    borderRadius: 12,
                    padding: 24,
                    marginBottom: 20
                  }}>
                    <InfoCircleOutlined style={{ fontSize: 32, color: '#d4a574', marginBottom: 16 }} />
                    <Title level={4} style={{ color: '#d4a574', marginBottom: 16 }}>Thông báo đăng ký</Title>
                    <Paragraph style={{ color: '#fff', fontSize: 15, lineHeight: '1.6' }}>
                      Chức năng đăng ký đang tạm thời bị vô hiệu hóa, chỉ những người đăng ký form trước đó mới được cấp tài khoản.
                    </Paragraph>
                    <Paragraph style={{ color: '#fff', fontSize: 15, lineHeight: '1.6' }}>
                      Để được trải nghiệm bạn vui lòng điền vào form sau đây:
                    </Paragraph>
                    <Button
                      type="primary"
                      href="https://forms.gle/cwdik45vbWVNfbJ98"
                      target="_blank"
                      style={{
                        background: '#d4a574',
                        borderColor: '#d4a574',
                        height: 'auto',
                        padding: '10px 24px',
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginTop: 8,
                        borderRadius: 8
                      }}
                    >
                      Điền Form Đăng Ký
                    </Button>
                  </div>
                  <Text style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Chúng tôi sẽ liên hệ với bạn sau khi tài khoản được phê duyệt.
                  </Text>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Divider style={{ borderColor: "rgba(255,255,255,0.3)" }}>
            <span style={{ color: "#eee" }}>Hoặc</span>
          </Divider>

          {/* SOCIAL LOGIN */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 24,
              width: "100%",
            }}
          >
            <Button
              style={{
                flex: 1,
                borderRadius: 8,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
              }}
              disabled
            >
              <GoogleCircleFilled style={{ fontSize: 20 }} /> Google
            </Button>

            <Button
              style={{
                flex: 1,
                borderRadius: 8,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
              }}
              disabled
            >
              <FacebookFilled style={{ fontSize: 20 }} /> Facebook
            </Button>
          </div>

          {/* TOGGLE LINK */}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Text style={{ color: "#fff" }}>
              {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            </Text>
            <Button
              type="link"
              onClick={toggleForm}
              style={{ color: "#d4a574", fontWeight: "bold", padding: 0 }}
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
            </Button>
          </div>
        </Card>
      </div>
    </Background>
  );
};

export default AuthPage;
