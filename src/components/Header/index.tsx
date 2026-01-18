import React, { useState, useEffect } from 'react';
import {
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  MenuOutlined,
  SettingOutlined,
  AppstoreOutlined,
  HeartOutlined,
  MailOutlined,
  FacebookOutlined,
} from '@ant-design/icons';
import { Layout, Typography, Menu, Input, Dropdown, Button, Drawer, Space, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import logo from '@/assets/images/logo.png';
import NotificationPopover from '@/components/common/NotificationPopover';
import { getImageUrl } from "@/utils/image.helper";
import './styles.less';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout() as any);
    navigate('/login');
  };

  // Handle search
  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/heritage-sites?q=${encodeURIComponent(searchValue)}`);
      setMobileMenuOpen(false);
    }
  };

  // Get active menu key
  const getActiveKey = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/heritage')) return 'heritage';
    if (location.pathname.startsWith('/artifacts')) return 'artifacts'; 
    if (location.pathname.startsWith('/history')) return 'history';
    if (location.pathname.startsWith('/learn')) return 'learn';
    if (location.pathname.startsWith('/game')) return 'game';
    if (location.pathname.startsWith('/support')) return 'support';
    return '';
  };

  // User menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Hồ sơ</Link>,
    },
    {
      key: 'library',
      icon: <AppstoreOutlined />,
      label: <Link to="/profile/library">Kho lưu trữ</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Nav menu items
  const navMenuItems: MenuProps['items'] = [
    {
      key: 'home',
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: 'heritage',
      label: <Link to="/heritage-sites">Di sản</Link>,
    },
    {
        key: 'artifacts',
        label: <Link to="/artifacts">Hiện vật</Link>,
    },
    {
        key: 'history',
        label: <Link to="/history">Bài viết</Link>,
    },
    {
      key: 'learn',
      label: <Link to="/game/learning">Học tập</Link>,
    },
    {
      key: 'game',
      label: <Link to="/game/chapters">Game</Link>,
    },
    {
      key: 'support',
      label: <Link to="/support">Hỗ trợ</Link>,
    },
  ];

  return (
    <>
      {/* TOP UTILITY BAR (Red Border + Search + Info) */}
      <div className="top-utility-bar">
        <div className="utility-content">
          {/* LEFT: Contact & Slogan */}
          {!isMobile && (
            <Space split={<span className="divider">|</span>} className="util-left">
              <Text className="util-item"><MailOutlined /> support@sen.com</Text>
              <Text className="util-item">Kiến tạo trải nghiệm lịch sử, văn hoá bằng công nghệ</Text>
            </Space>
          )}

          {/* CENTER: Search */}
          <div className="top-search-wrapper">
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.7)' }} />}
              bordered={false}
              className="top-bar-search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
            />
          </div>

          {/* RIGHT: Social & Lang */}
          <Space size="middle" className="util-right">
            <FacebookOutlined className="social-icon" />
            <HeartOutlined className="social-icon" />
            <div className="language-switcher">
              <span className="lang-item active">
                <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="flag-icon" />
                {!isMobile && "VN"}
              </span>
              <span className="lang-divider">|</span>
              <span className="lang-item">
                <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="flag-icon" />
                {!isMobile && "EN"}
              </span>
            </div>
          </Space>
        </div>
      </div>

      <AntHeader
        className="main-header"
        style={{
          padding: isMobile ? '0 16px' : '0 40px',
        }}
      >
        <div className="header-left">
          {/* Logo */}
          <Link to="/" className="logo-container">
            <img src={logo} alt="Sen Logo" className="logo-img" />
          </Link>
        </div>

        {/* Desktop Menu */}
        {!isMobile && (
          <div className="header-center">
            <Menu
              mode="horizontal"
              selectedKeys={[getActiveKey()]}
              items={navMenuItems}
              className="desktopMenu"
            />
          </div>
        )}

        {/* Right Side Actions */}
        <div className="header-right">
          {/* Notifications */}
          {!isMobile && (
            <NotificationPopover />
          )}

          {/* User Menu / Auth Buttons */}
          {isAuthenticated ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="user-profile-trigger-simple">
                 <Avatar 
                    src={user?.avatar ? getImageUrl(user.avatar) : undefined} 
                    icon={!user?.avatar && <UserOutlined />} 
                    size={32}
                  />
                 <span className="user-text">{user?.name || 'Tài khoản'}</span>
              </div>
            </Dropdown>
          ) : (
            !isMobile && (
              <Link to="/login" className="login-link">
                <UserOutlined style={{ fontSize: 20 }} />
                <span className="user-text">Tài khoản</span>
              </Link>
            )
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
            />
          )}
        </div>
      </AntHeader>

      {/* MOBILE DRAWER */}
      <Drawer
        title="KHÁM PHÁ SEN"
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={300}
        className="mobile-drawer-premium"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Mobile Search - Also in drawer for logic redundancy if top bar is hidden or hard to reach */}
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            className="search-input-premium"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
          />

          {/* Mobile Menu */}
          <Menu
            mode="vertical"
            selectedKeys={[getActiveKey()]}
            items={navMenuItems}
            className="mobile-nav-menu"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Auth Buttons */}
          {!isAuthenticated && (
            <div className="mobile-auth-section">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button type="primary" block className="action-btn-premium">
                  Đăng Nhập
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default Header;
