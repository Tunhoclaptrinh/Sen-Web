// import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react"; // React unused but imports kept for hook usage
import { useSearchParams } from "react-router-dom";
import {
  Form,
  Input,
  message,
  Spin,
  Row,
  Col,
  // Upload,
  // Avatar,
  Timeline,
  Alert
} from "antd";
import Button from "@/components/common/Button"; // Core Component
import {
  // CameraOutlined,
  SaveOutlined,
  LockOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  HeartOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import userService from "@services/user.service";
import collectionService from "@services/collection.service";
import gameService from "@services/game.service"; // Import GameService
import { Collection } from "@/types/collection.types";
import favoriteService, { FavoriteStats } from "@services/favorite.service";
// import apiClient from "@config/axios.config";
import { getMe } from "@store/slices/authSlice";
import { RootState, AppDispatch } from "@/store";
import StatisticsCard from "@/components/common/StatisticsCard"; // Core Component
import ProfileHeader from "../ProfileHeader";
import "./styles.less";

const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  // Loading States
  const [loading, setLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  // const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesLoading] = useState<boolean>(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [badgesLoading, setBadgesLoading] = useState(false);

  // Data States
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]); // All badge definitions
  const [userProgress, setUserProgress] = useState<any>(null); // User game progress
  // Favorites list moved to LibraryPage, keeping stats only
  const [favoriteStats, setFavoriteStats] = useState<FavoriteStats | null>(null);
  // const [activities, setActivities] = useState<any[]>([]); // Unused for now
  // const [avatar, setAvatar] = useState(user?.avatar);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
      });
      // setAvatar(user.avatar);
      fetchDashboardData();
      fetchCollections(); // Fetch for stats count
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats summary initially
      const statsRes = await favoriteService.getStats();
      if (statsRes.success) setFavoriteStats(statsRes.data || null);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchCollections = async () => {
    setCollectionsLoading(true);
    try {
      const res = await collectionService.getAll();
      if (res.success) setCollections(res.data || []);
    } catch (error) {
      // generic error handling or silent
    } finally {
      setCollectionsLoading(false);
    }
  };

  const fetchActivity = async () => {
    if (!user?.id) return;
    setActivityLoading(true);
    try {
        // Mock activity data if API is not fully implemented for list
        // Or fetch real activity if available
        const res = await userService.getActivity(user.id);
        if (res.success && Array.isArray(res.data)) {
            // setActivities(res.data); // State unused, just logic for now
        }
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchBadgesData = async () => {
      setBadgesLoading(true);
      try {
          const [badgesRes, progressRes] = await Promise.all([
              gameService.getBadges(),
              gameService.getProgress()
          ]);
          setAllBadges(badgesRes || []);
          setUserProgress(progressRes || null);
      } catch (error) {
          console.error("Error fetching badges:", error);
      } finally {
          setBadgesLoading(false);
      }
  };

  const onUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      await userService.updateProfile(values);
      message.success("✅ Cập nhật hồ sơ thành công!");
      dispatch(getMe());
    } catch (error) {
      message.error("❌ Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword({
        id: user?.id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("✅ Đổi mật khẩu thành công!");
      passwordForm.resetFields();
    } catch (error) {
      message.error("❌ Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length > 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    setPasswordStrength(strength);
  };





  // --- Render Sections ---

  // --- 4. Render Main ---
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  useEffect(() => {
    if (activeTab === 'activity') {
        fetchActivity();
    }
    if (activeTab === 'badges') {
        fetchBadgesData();
    }
  }, [activeTab]);

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const renderProfileTab = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={16}>
        <div className="profile-card">
          <div className="card-title">
            <UserOutlined /> Thông tin Cá nhân
          </div>
          <Form
            form={form}
            layout="vertical"
            onFinish={onUpdateProfile}
            requiredMark={false}
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Nhập tên hiển thị" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[{ pattern: /^0[0-9]{9,10}$/, message: "Số điện thoại không hợp lệ" }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="email" label="Email đăng nhập">
                  <Input prefix={<MailOutlined />} disabled className="bg-gray-50" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                 <Form.Item label="Giới thiệu bản thân" name="bio">
                    <Input.TextArea rows={4} placeholder="Chia sẻ đôi điều về bạn..." />
                 </Form.Item>
              </Col>
            </Row>
            <Form.Item style={{ textAlign: 'center', marginTop: 16 }}>
              <Button variant="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} style={{ height: 40, padding: '0 48px' }}>
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
      <Col xs={24} md={8}>
         <StatisticsCard 
            title="Thống Kê"
            loading={favoritesLoading || collectionsLoading}
            colSpan={{ span: 24 } as any}
            data={[
              {
                title: "Bộ sưu tập",
                value: collections.length || 0,
                icon: <AppstoreOutlined />,
                valueColor: "#1890ff",
              },
              {
                title: "Đã yêu thích",
                value: favoriteStats?.total || 0,
                icon: <HeartOutlined />,
                valueColor: "#ff4d4f",
              }
            ]}
         />
      </Col>
    </Row>
  );

  const renderSecurityTab = () => (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={14}>
        <div className="profile-card">
          <div className="card-title">
            <LockOutlined /> Đổi mật khẩu
          </div>
          <Alert message="Lưu ý quan trọng" description="Mật khẩu mới cần có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số để đảm bảo an toàn." type="warning" showIcon style={{ marginBottom: 24 }} />
          
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={onChangePassword}
          >
            <Form.Item
              name="currentPassword"
              label="Mật khẩu hiện tại"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" size="large"/>
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự" }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Nhập mật khẩu mới" 
                size="large"
                onChange={(e) => checkPasswordStrength(e.target.value)}
              />
            </Form.Item>
            
            {/* Password Strength Indicator */}
            {passwordForm.getFieldValue("newPassword") && (
                <div className="password-strength">
                    <div className="strength-bar">
                        <div className={`strength-fill ${['', 'weak', 'medium', 'strong', 'strong'][passwordStrength] || 'weak'}`} />
                    </div>
                    <div className={`strength-text ${['', 'weak', 'medium', 'strong', 'strong'][passwordStrength] || 'weak'}`}>
                        Độ mạnh: {['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][passwordStrength]}
                    </div>
                </div>
            )}

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu" }]}
            >
              <Input.Password prefix={<CheckCircleOutlined />} placeholder="Nhập lại mật khẩu mới" size="large"/>
            </Form.Item>

            <Form.Item>
              <Button variant="primary" htmlType="submit" fullWidth buttonSize="large" loading={loading} style={{ height: 48, background: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                Cập nhật Mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
      <Col xs={24} md={10}>
          <div className="security-tips">
              <h4><SafetyCertificateOutlined /> Bảo mật Tài khoản</h4>
              <p style={{ color: '#8c6e1f', marginBottom: 16 }}>Giữ an toàn cho tài khoản của bạn là ưu tiên hàng đầu của chúng tôi.</p>
              <ul>
                  <li>Sử dụng mật khẩu mạnh bao gồm chữ hoa, thường, số và ký tự đặc biệt.</li>
                  <li>Không chia sẻ mật khẩu của bạn với bất kỳ ai, kể cả nhân viên hỗ trợ.</li>
                  <li>Đổi mật khẩu định kỳ 3 tháng một lần.</li>
                  <li>Kích hoạt xác thực 2 lớp (2FA) để tăng cường bảo mật (Sắp ra mắt).</li>
              </ul>
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.6)', borderRadius: 12 }}>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Lần đăng nhập cuối cùng</div>
                  <div style={{ fontWeight: 600, color: '#333' }}>
                      {user?.lastLogin 
                        ? new Date(user.lastLogin).toLocaleString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                        : "Chưa có thông tin"}
                  </div>
              </div>
          </div>
      </Col>
    </Row>
  );

  const renderActivityTab = () => (
      <div className="profile-card">
          <div className="card-title"><HistoryOutlined /> Lịch sử Hoạt động</div>
          <p style={{ color: '#666', marginBottom: 32 }}>Theo dõi các hoạt động gần đây của bạn trên hệ thống.</p>
          
          <div className="activity-timeline">
            {activityLoading ? <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div> : (
                <Timeline mode="left">
                    {/* Mock activities layout */}
                    <Timeline.Item color="green" label={new Date().toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}>
                        <div className="timeline-content">
                            <div className="activity-title">Đăng nhập thành công</div>
                            <div className="activity-desc">Bạn đã đăng nhập vào hệ thống từ thiết bị mới.</div>
                            <div className="activity-time">{new Date().toLocaleDateString("vi-VN")}</div>
                        </div>
                    </Timeline.Item>
                    <Timeline.Item color="blue" label="Hôm qua">
                        <div className="timeline-content">
                            <div className="activity-title">Cập nhật hồ sơ cá nhân</div>
                            <div className="activity-desc">Bạn đã thay đổi ảnh đại diện và thông tin giới thiệu.</div>
                            <div className="activity-time">{new Date(Date.now() - 86400000).toLocaleDateString("vi-VN")}</div>
                        </div>
                    </Timeline.Item>
                    <Timeline.Item color="red" label="3 ngày trước">
                        <div className="timeline-content">
                            <div className="activity-title">Yêu thích di sản</div>
                            <div className="activity-desc">Bạn đã thêm <strong>"Trống Đồng Đông Sơn"</strong> vào danh sách yêu thích.</div>
                            <div className="activity-time">{new Date(Date.now() - 172800000).toLocaleDateString("vi-VN")}</div>
                        </div>
                    </Timeline.Item>
                    <Timeline.Item color="gray" label="Tuần trước">
                        <div className="timeline-content">
                            <div className="activity-title">Tạo bộ sưu tập</div>
                            <div className="activity-desc">Bạn đã tạo bộ sưu tập mới <strong>"Cổ vật Triều Nguyễn"</strong>.</div>
                            <div className="activity-time">{new Date(Date.now() - 604800000).toLocaleDateString("vi-VN")}</div>
                        </div>
                    </Timeline.Item>
                </Timeline>
            )}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Button variant="outline">Xem thêm hoạt động cũ hơn</Button>
            </div>
          </div>
      </div>
  )

  const renderBadgeTab = () => {
      const userBadges = userProgress?.badges || []; // Array of { id, earnedAt }
      // Map earned status to all badges
      const displayedBadges = allBadges.map(badge => {
          const earned = userBadges.find((b: any) => b.id === badge.id);
          return { ...badge, earned: !!earned, earnedAt: earned?.earnedAt };
      });

      return (
        <div className="profile-card">
            <div className="card-title">
                <TrophyOutlined /> Huy hiệu & Thành tích
            </div>
            <div style={{ marginBottom: 24, padding: 16, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontWeight: 600, color: '#389e0d' }}>Tiến độ sưu tập</div>
                    <div>Bạn đã mở khóa {userBadges.length}/{allBadges.length} huy hiệu</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#389e0d' }}>
                    {Math.round((userBadges.length / (allBadges.length || 1)) * 100)}%
                </div>
            </div>

            {badgesLoading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 24 }}>
                    {displayedBadges.map(badge => (
                        <div 
                            key={badge.id}
                            style={{ 
                                textAlign: 'center', 
                                padding: 16, 
                                borderRadius: 12, 
                                border: badge.earned ? '1px solid #d9d9d9' : '1px dashed #d9d9d9',
                                background: badge.earned ? '#fff5f0' : '#fafafa',
                                filter: badge.earned ? 'none' : 'grayscale(100%)',
                                opacity: badge.earned ? 1 : 0.6,
                                transition: 'all 0.3s'
                            }}
                        >
                            <div style={{ fontSize: 48, marginBottom: 8 }}>{badge.icon}</div>
                            <div style={{ fontWeight: 700, marginBottom: 4, color: '#2c3e50', minHeight: 44 }}>{badge.name}</div>
                            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4 }}>{badge.description}</div>
                            {badge.earned && (
                                <div style={{ marginTop: 8, fontSize: 11, color: '#fa8c16' }}>
                                    Đạt được: {new Date(badge.earnedAt).toLocaleDateString('vi-VN')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
      );
  };

  return (
    <div className="profile-page">
      <ProfileHeader 
        user={user} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
      
      <div className="profile-content">
        <div className="profile-container">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'badges' && renderBadgeTab()}
          {activeTab === 'activity' && renderActivityTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
