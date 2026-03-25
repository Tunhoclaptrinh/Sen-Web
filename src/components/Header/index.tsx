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
  MessageOutlined,
} from '@ant-design/icons';
import { Layout, Typography, Menu, Input, Dropdown, Button, Drawer, Space, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
const logo = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774362654/sen_web/static/src/assets/images/logo.png";
import NotificationPopover from '@/components/common/NotificationPopover';
import { setOverlayOpen } from '@/store/slices/aiSlice';
import { getImageUrl } from "@/utils/image.helper";
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import './styles.less';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isTransparent, setIsTransparent] = useState(location.pathname === '/');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll for transparency (Only on Home Page)
  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/') {
        setIsTransparent(window.scrollY < 50);
      } else {
        setIsTransparent(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

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
    if (location.pathname.startsWith('/exhibitions')) return 'exhibitions';
    if (location.pathname.startsWith('/learn')) return 'learn';
    if (location.pathname.startsWith('/map')) return 'map';
    if (location.pathname.startsWith('/support')) return 'support';
    if (location.pathname.startsWith('/poster')) return 'poster';
    return '';
  };

  // User menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">{t('nav.profile')}</Link>,
    },
    {
      key: 'library',
      icon: <AppstoreOutlined />,
      label: <Link to="/profile/library">{t('nav.library')}</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('nav.logout'),
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Nav menu items
  const navMenuItems: MenuProps['items'] = [
    {
      key: 'home',
      label: <Link to="/">{t('nav.home')}</Link>,
    },
    {
      key: 'heritage',
      label: <Link to="/heritage-sites">{t('nav.heritage')}</Link>,
    },
    {
      key: 'artifacts',
      label: <Link to="/artifacts">{t('nav.artifacts')}</Link>,
    },
    {
      key: 'map',
      label: <Link to="/map">{t('nav.map')}</Link>,
    },
    {
      key: 'history',
      label: <Link to="/history">{t('nav.history')}</Link>,
    },
    {
      key: 'exhibitions',
      label: <Link to="/exhibitions">{t('nav.exhibitions')}</Link>,
    },
    {
      key: 'learn',
      label: <Link to="/game/learning">{t('nav.learn')}</Link>,
    },
    {
      key: 'game',
      label: <Link to="/game/chapters">{t('nav.game')}</Link>,
    },
    {
      key: 'support',
      label: <Link to="/support">{t('nav.support')}</Link>,
    },
    {
      key: 'poster',
      label: <Link to="/poster">{t('nav.poster')}</Link>,
    },
  ];

  return (
    <>
      {/* TOP UTILITY BAR (Red Border + Search + Info) */}
      <div className={`top-utility-bar ${isTransparent ? 'is-transparent' : ''}`}>
        <div className="utility-content">
          {/* LEFT: Contact & Slogan */}
          {!isMobile && (
            <Space split={<span className="divider">|</span>} className="util-left">
              <Text className="util-item"><MailOutlined /> {t('header.email')}</Text>
              <Text className="util-item">{t('header.slogan')}</Text>
            </Space>
          )}

          {/* CENTER: Search */}
          <div className="top-search-wrapper">
            <Input
              placeholder={t('header.search')}
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
            <FacebookOutlined className="social-icon" onClick={() => window.open('https://www.facebook.com/profile.php?id=61586454543352', '_blank')} />
            <HeartOutlined className="social-icon" />
            <LanguageSwitcher showText={!isMobile} />
          </Space>
        </div>
      </div>

      <AntHeader
        className={`main-header ${isTransparent ? 'is-transparent' : ''}`}
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

          {/* AI Chat Button */}
          {!isMobile && (
            <Button
              type="text"
              className="header-action-btn"
              icon={<MessageOutlined />}
              onClick={() => dispatch(setOverlayOpen({ open: true, mode: 'fixed' }))}
            />
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
                <span className="user-text">{user?.name || t('nav.account')}</span>
              </div>
            </Dropdown>
          ) : (
            !isMobile && (
              <Link to="/login" className="login-link">
                <UserOutlined style={{ fontSize: 20 }} />
                <span className="user-text">{t('nav.account')}</span>
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
        title={t('header.exploreSen')}
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={300}
        className="mobile-drawer-premium"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Mobile Search - Also in drawer for logic redundancy if top bar is hidden or hard to reach */}
          <Input
            placeholder={t('header.search')}
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
                  {t('nav.login')}
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
