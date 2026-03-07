import React from "react";
import { Avatar, Tabs, Upload, message } from "antd";
import { UserOutlined, CameraOutlined, EditOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "@config/axios.config";
import userService from "@services/user.service";
import { getMe } from "@store/slices/authSlice";
import { AppDispatch } from "@/store";
import { useTranslation } from "react-i18next";
import "./styles.less"; // Reuse existing styles or we should move styles to a common place?
// For now, assume styles are global or imported in parent.
// Actually, I should probably copy the necessary styles or import the less file.
// But styles.less is in Profile/Profile.
// I'll assume usage within the same module area or make it shared.
// Given the user wants it to be "ok hẳn" (solid), I should probably move styles to a shared file or ensure this component imports them.

interface ProfileHeaderProps {
  user: any;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  showTabs?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, activeTab, onTabChange, showTabs = true }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'profile' });
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to handle avatar update
  const handleAvatarUpload = async (file: File, onSuccess: any, onError: any) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res: any = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess && onSuccess(res);
      const url = res?.url || res?.data?.url || (res?.data && res.data[0] && res.data[0].url);
      if (url) {
        await userService.updateProfile({ ...user, avatar: url } as any);
        dispatch(getMe());
        message.success(t("header.messages.avatarUpdated"));
      }
    } catch (err: any) {
      onError && onError(err);
      message.error(t("header.messages.uploadFailed"));
    }
  };

  // const handleTabClick = (key: string) => {
  //     if (onTabChange) {
  //         onTabChange(key);
  //     } else {
  //          // Navigation logic if props not provided, or specific routing
  //          if (key === 'library') {
  //              navigate('/profile/library');
  //          } else if (key === 'profile') {
  //              navigate('/profile');
  //          }
  //     }
  // };

  const isLibraryPage = location.pathname.includes("/profile/library");

  return (
    <div className="profile-header-section">
      <div className="profile-info-bar">
        <div className="cover-overlay" />

        <div className="profile-container">
          <div className="profile-layout-row">
            <div className="left-col-avatar">
              <div className="avatar-wrapper">
                <Avatar size={140} src={user?.avatar} icon={<UserOutlined />} className="profile-avatar" />
                <Upload
                  name="avatar"
                  showUploadList={false}
                  customRequest={async ({ file, onSuccess, onError }) =>
                    handleAvatarUpload(file as File, onSuccess, onError)
                  }
                >
                  <div className="upload-trigger">
                    <CameraOutlined />
                  </div>
                </Upload>
              </div>
            </div>

            <div className="right-col-info">
              <div className="user-main-info">
                <div className="name-role-wrapper">
                  <h1 className="user-name">{user?.name}</h1>
                  {user?.role && user.role !== "customer" && (
                    <span className="user-role-badge">
                      {user.role === "admin"
                        ? `🛡️ ${t("header.roles.admin")}`
                        : user.role === "researcher"
                          ? `🔍 ${t("header.roles.researcher")}`
                          : user.role === "curator"
                            ? `🏛️ ${t("header.roles.curator")}`
                            : t("header.roles.member")}
                    </span>
                  )}
                  {/* Edit Button - Only show if not on profile page, or always show? 
                                        User said: "thêm nút chỉnh sửa thông tin cá nhân để chuyển đến trang profile"
                                        This implies if I am on library page, I click this to go to profile. 
                                    */}
                  {isLibraryPage && (
                    <div
                      className="edit-profile-btn"
                      onClick={() => navigate("/profile")}
                      style={{
                        marginLeft: "auto",
                        cursor: "pointer",
                        color: "#fff9e6",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        background: "#8b1d1d",
                        padding: "6px 16px",
                        borderRadius: 4,
                        border: "1px solid #c5a065",
                        boxShadow: "0 2px 0 #5a1212",
                        fontWeight: 700,
                        fontFamily: "'Playfair Display', serif",
                        transition: "all 0.2s",
                      }}
                    >
                      <EditOutlined /> <span>{t("header.edit")}</span>
                    </div>
                  )}
                </div>
                <p className="join-date">
                  {t("header.joinedFrom")}{" "}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : t("header.newMember")}
                </p>
              </div>

              {/* Integrated Tab Navigation using Ant Design Tabs */}
              {showTabs && (
                <Tabs
                  className="profile-header-tabs"
                  activeKey={isLibraryPage ? "library" : activeTab}
                  onChange={(key) => {
                    if (key === "library") {
                      navigate("/profile/library");
                    } else if (isLibraryPage) {
                      // Ensure we preserve the tab selection when navigating back to profile
                      navigate(`/profile?tab=${key}`);
                    } else {
                      onTabChange && onTabChange(key);
                    }
                  }}
                  items={[
                    { label: t("tabs.profile"), key: "profile" },
                    { label: t("tabs.badges"), key: "badges" },
                    { label: t("tabs.activity"), key: "activity" },
                    { label: t("tabs.security"), key: "security" },
                    { label: t("tabs.library"), key: "library" },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
