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
  Alert,
  Tag,
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
  TrophyOutlined,
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
import { useTranslation } from "react-i18next";
import "./styles.less";

const Profile = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'profile' });
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
      const [badgesRes, progressRes] = await Promise.all([gameService.getBadges(), gameService.getProgress()]);
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
      message.success(t("personal.messages.updateSuccess"));
      dispatch(getMe());
    } catch (error) {
      message.error(t("personal.messages.updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error(t("security.passwordsMismatch"));
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword({
        id: user?.id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success(t("security.messages.changeSuccess"));
      passwordForm.resetFields();
    } catch (error) {
      message.error(t("security.messages.changeFailed"));
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
    if (activeTab === "activity") {
      fetchActivity();
    }
    if (activeTab === "badges") {
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
            <UserOutlined /> {t("personal.title")}
          </div>
          <Form form={form} layout="vertical" onFinish={onUpdateProfile} requiredMark={false}>
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item name="name" label={t("personal.fullName")} rules={[{ required: true, message: t("personal.fullNameRequired") }]}>
                  <Input prefix={<UserOutlined />} placeholder={t("personal.fullNamePlaceholder")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label={t("personal.phone")}
                  rules={[{ pattern: /^0[0-9]{9,10}$/, message: t("personal.phoneInvalid") }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder={t("personal.phonePlaceholder")} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="email" label={t("personal.email")}>
                  <Input prefix={<MailOutlined />} disabled className="bg-gray-50" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item label={t("personal.bio")} name="bio">
                  <Input.TextArea rows={4} placeholder={t("personal.bioPlaceholder")} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item style={{ textAlign: "center", marginTop: 16 }}>
              <Button
                variant="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                style={{ height: 40, padding: "0 48px" }}
              >
                {t("personal.saveChanges")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
      <Col xs={24} md={8}>
        <StatisticsCard
          title={t("statistics.title")}
          loading={favoritesLoading || collectionsLoading}
          colSpan={{ span: 24 } as any}
          data={[
            {
              title: t("statistics.collections"),
              value: collections?.length || 0,
              icon: <AppstoreOutlined />,
              valueColor: "#c5a065", // Gold
            },
            {
              title: t("statistics.favorites"),
              value: favoriteStats?.total || 0,
              icon: <HeartOutlined />,
              valueColor: "#8b1d1d", // Seal Red
            },
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
            <LockOutlined /> {t("security.changePassword")}
          </div>
          <Alert
            message={t("security.importantNote")}
            description={t("security.importantNoteDesc")}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form form={passwordForm} layout="vertical" onFinish={onChangePassword}>
            <Form.Item
              name="currentPassword"
              label={t("security.currentPassword")}
              rules={[{ required: true, message: t("security.currentPasswordRequired") }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t("security.currentPasswordPlaceholder")} size="large" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label={t("security.newPassword")}
              rules={[
                { required: true, message: t("security.newPasswordRequired") },
                { min: 6, message: t("security.passwordMinLength") },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t("security.newPasswordPlaceholder")}
                size="large"
                onChange={(e) => checkPasswordStrength(e.target.value)}
              />
            </Form.Item>

            {/* Password Strength Indicator */}
            {passwordForm.getFieldValue("newPassword") && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className={`strength-fill ${["", "weak", "medium", "strong", "strong"][passwordStrength] || "weak"}`}
                  />
                </div>
                <div
                  className={`strength-text ${["", "weak", "medium", "strong", "strong"][passwordStrength] || "weak"}`}
                >
                  {t("security.strength.label")} {[
                    "",
                    t("security.strength.weak"),
                    t("security.strength.medium"),
                    t("security.strength.strong"),
                    t("security.strength.veryStrong"),
                  ][passwordStrength]}
                </div>
              </div>
            )}

            <Form.Item
              name="confirmPassword"
              label={t("security.confirmPassword")}
              rules={[{ required: true, message: t("security.confirmPasswordRequired") }]}
            >
              <Input.Password prefix={<CheckCircleOutlined />} placeholder={t("security.confirmPasswordPlaceholder")} size="large" />
            </Form.Item>

            <Form.Item>
              <Button
                variant="primary"
                htmlType="submit"
                fullWidth
                buttonSize="large"
                loading={loading}
                style={{ height: 48, background: "var(--primary-color)", borderColor: "var(--primary-color)" }}
              >
                {t("security.updatePasswordBtn")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
      <Col xs={24} md={10}>
        <div className="security-tips">
          <h4>
            <SafetyCertificateOutlined /> {t("security.tips.title")}
          </h4>
          <p style={{ color: "#8c6e1f", marginBottom: 16 }}>
            {t("security.tips.desc")}
          </p>
          <ul>
            <li>{t("security.tips.tip1")}</li>
            <li>{t("security.tips.tip2")}</li>
            <li>{t("security.tips.tip3")}</li>
            <li>{t("security.tips.tip4")}</li>
          </ul>
          <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.6)", borderRadius: 12 }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{t("security.tips.lastLogin")}</div>
            <div style={{ fontWeight: 600, color: "#333" }}>
              {user?.lastLogin
                ? new Date(user.lastLogin).toLocaleString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : t("security.tips.noInfo")}
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );

  const renderActivityTab = () => (
    <div className="profile-card">
      <div className="card-title">
        <HistoryOutlined /> {t("activity.title")}
      </div>
      <p style={{ color: "#666", marginBottom: 32 }}>{t("activity.desc")}</p>

      <div className="activity-timeline">
        {activityLoading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <Spin />
          </div>
        ) : (
          <Timeline mode="left">
            {/* Mock activities layout */}
            <Timeline.Item
              color="green"
              label={new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
            >
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
                <div className="activity-desc">
                  Bạn đã thêm <strong>"Trống Đồng Đông Sơn"</strong> vào danh sách yêu thích.
                </div>
                <div className="activity-time">{new Date(Date.now() - 172800000).toLocaleDateString("vi-VN")}</div>
              </div>
            </Timeline.Item>
            <Timeline.Item color="gray" label="Tuần trước">
              <div className="timeline-content">
                <div className="activity-title">Tạo bộ sưu tập</div>
                <div className="activity-desc">
                  Bạn đã tạo bộ sưu tập mới <strong>"Cổ vật Triều Nguyễn"</strong>.
                </div>
                <div className="activity-time">{new Date(Date.now() - 604800000).toLocaleDateString("vi-VN")}</div>
              </div>
            </Timeline.Item>
          </Timeline>
        )}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Button variant="outline">{t("activity.viewMore")}</Button>
        </div>
      </div>
    </div>
  );

  const renderBadgeTab = () => {
    const userBadges = userProgress?.badges || [];

    // Normalize earned badges: handle both objects {id, earnedAt} and raw IDs
    const normalizedEarned = userBadges
      .map((b: any) => {
        if (typeof b === "object" && b !== null) return b;
        return { id: b };
      })
      .filter((b: any) => b.id !== undefined && b.id !== null);

    // Map earned status to all badges
    const displayedBadges = allBadges.map((badge: any) => {
      const earned = normalizedEarned.find((b: any) => String(b.id) === String(badge.id));
      return { ...badge, earned: !!earned, earnedAt: earned?.earnedAt };
    });

    const validEarnedBadges = displayedBadges.filter((b) => b.earned);

    return (
      <div className="profile-card">
        <div className="card-title">
          <TrophyOutlined /> {t("badges.title")}
        </div>
        <div className="badge-progress-box">
          <div className="progress-info">
            <div className="progress-label">{t("badges.progressLabel")}</div>
            <div className="progress-sub">
              {t("badges.unlocked")} {validEarnedBadges?.length || 0}/{allBadges?.length || 0} {t("badges.badgesCount")}
            </div>
          </div>
          {Math.round(((validEarnedBadges?.length || 0) / (allBadges?.length || 1)) * 100)}%
        </div>

        {badgesLoading ? (
          <div className="loading-container">
            <Spin />
          </div>
        ) : (
          <div className="badges-grid">
            {displayedBadges.map((badge) => (
              <div key={badge.id} className={`badge-item ${badge.earned ? "earned" : "locked"}`}>
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-name">{badge.name}</div>
                <div className="badge-description">{badge.description}</div>
                {badge.earned && (
                  <Tag color="gold" className="badge-tag">
                    {t("badges.earned")} {new Date(badge.earnedAt).toLocaleDateString("vi-VN")}
                  </Tag>
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
      <ProfileHeader user={user} activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="profile-content">
        <div className="profile-container">
          {activeTab === "profile" && renderProfileTab()}
          {activeTab === "badges" && renderBadgeTab()}
          {activeTab === "activity" && renderActivityTab()}
          {activeTab === "security" && renderSecurityTab()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
