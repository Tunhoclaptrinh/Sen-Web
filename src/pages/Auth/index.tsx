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
  PhoneOutlined,
  FacebookFilled,
  GoogleCircleFilled,
} from "@ant-design/icons";
import { useAppDispatch } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../store/slices/authSlice";
import logo from "@/assets/images/logo2.png";
import { motion, AnimatePresence } from "framer-motion";
import Background from "@/components/Background";
import "./styles.less";

const { Text, Paragraph } = Typography;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");

  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[0-9]{10,11}$/.test(phone);

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

      message.success("✅ Đăng nhập thành công!");
      navigate("/"); // tự chuyển trang
    } catch (error: any) {
      message.error(`❌ ${error || "Đăng nhập thất bại"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    if (!regName) newErrors.regName = "Vui lòng nhập họ tên";
    else if (regName.length < 2)
      newErrors.regName = "Họ tên phải có ít nhất 2 ký tự";

    if (!regEmail) newErrors.regEmail = "Vui lòng nhập email";
    else if (!validateEmail(regEmail))
      newErrors.regEmail = "Email không hợp lệ";

    if (!regPhone) newErrors.regPhone = "Vui lòng nhập số điện thoại";
    else if (!validatePhone(regPhone))
      newErrors.regPhone = "Số điện thoại phải có 10-11 chữ số";

    if (!regPassword) newErrors.regPassword = "Vui lòng nhập mật khẩu";
    else if (regPassword.length < 6)
      newErrors.regPassword = "Mật khẩu phải ít nhất 6 ký tự";

    if (!regConfirmPassword)
      newErrors.regConfirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (regPassword !== regConfirmPassword)
      newErrors.regConfirmPassword = "Mật khẩu không khớp";

    if (!agreeTerms) {
      message.error("Bạn phải đồng ý với điều khoản dịch vụ");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // gọi API register thật
      await dispatch(
        register({
          name: regName,
          email: regEmail,
          phone: regPhone,
          // address: regAddress, // Removed because regAddress is unused in UI form input
          password: regPassword,
        }),
      ).unwrap();

      message.success("✅ Đăng ký thành công! Chào mừng bạn đến Sen");

      // tự động login sau khi register xong
      await dispatch(
        login({ email: regEmail, password: regPassword }),
      ).unwrap();

      navigate("/"); // chuyển sang trang chủ
    } catch (error: any) {
      message.error(`❌ ${error || "Đăng ký thất bại"}`);
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
                      style={{ color: "#ffb38a", padding: 0 }}
                    >
                      Quên mật khẩu?
                    </Button>
                  </Row>

                  <Button
                    type="primary"
                    onClick={handleLogin}
                    loading={loading}
                    block
                    size="large"
                    style={{
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
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Họ và tên"
                      size="large"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      status={errors.regName ? "error" : ""}
                      style={{
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.2)",
                        color: "#fff",
                      }}
                    />
                    {errors.regName && (
                      <Text
                        style={{
                          color: "#ff6b6b",
                          fontSize: 12,
                          display: "block",
                          marginTop: 4,
                        }}
                      >
                        {errors.regName}
                      </Text>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Nhập email"
                        size="large"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        status={errors.regEmail ? "error" : ""}
                        style={{
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.4)",
                          background: "rgba(255,255,255,0.2)",
                          color: "#fff",
                        }}
                      />
                      {errors.regEmail && (
                        <Text
                          style={{
                            color: "#ff6b6b",
                            fontSize: 12,
                            display: "block",
                            marginTop: 4,
                          }}
                        >
                          {errors.regEmail}
                        </Text>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Số điện thoại"
                        size="large"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        status={errors.regPhone ? "error" : ""}
                        style={{
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.4)",
                          background: "rgba(255,255,255,0.2)",
                          color: "#fff",
                        }}
                      />
                      {errors.regPhone && (
                        <Text
                          style={{
                            color: "#ff6b6b",
                            fontSize: 12,
                            display: "block",
                            marginTop: 4,
                          }}
                        >
                          {errors.regPhone}
                        </Text>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Nhập mật khẩu"
                      size="large"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      status={errors.regPassword ? "error" : ""}
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
                    {errors.regPassword && (
                      <Text
                        style={{
                          color: "#ff6b6b",
                          fontSize: 12,
                          display: "block",
                          marginTop: 4,
                        }}
                      >
                        {errors.regPassword}
                      </Text>
                    )}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Xác nhận mật khẩu"
                      size="large"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      onPressEnter={handleRegister}
                      status={errors.regConfirmPassword ? "error" : ""}
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
                    {errors.regConfirmPassword && (
                      <Text
                        style={{
                          color: "#ff6b6b",
                          fontSize: 12,
                          display: "block",
                          marginTop: 4,
                        }}
                      >
                        {errors.regConfirmPassword}
                      </Text>
                    )}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <Checkbox
                      style={{ color: "white" }}
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    >
                      Tôi đồng ý với{" "}
                      <Button
                        type="link"
                        style={{ color: "#ffcf9e", padding: 0, height: "auto" }}
                      >
                        Điều khoản dịch vụ
                      </Button>
                    </Checkbox>
                  </div>

                  <Button
                    type="primary"
                    onClick={handleRegister}
                    loading={loading}
                    block
                    size="large"
                    style={{
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
                    {loading ? "Đang đăng ký..." : "Đăng Ký"}
                  </Button>
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
              style={{ color: "#ffcf9e", fontWeight: "bold", padding: 0 }}
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
