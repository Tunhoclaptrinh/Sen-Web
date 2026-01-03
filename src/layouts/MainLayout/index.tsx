import React, { useState, useEffect } from 'react';
import './styles.less';
import { Layout, Menu, Dropdown, Button, Badge, Input, Drawer, Avatar, MenuProps, Space, Typography } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  MenuOutlined,
  SettingOutlined,
  HeartOutlined,
  MailOutlined,
  FacebookOutlined,
} from '@ant-design/icons';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import logo from '@/assets/images/logo.png';
import CustomFooter from '@/components/Footer';

const { Header, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for premium transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    return '';
  };

  // User menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Hồ Sơ</Link>,
    },
    {
      key: 'collections',
      icon: <HeartOutlined />,
      label: <Link to="/collections">Bộ Sưu Tập</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài Đặt',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng Xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Nav menu items
  const navMenuItems: MenuProps['items'] = [
    {
      key: 'home',
      label: <Link to="/">Trang Chủ</Link>,
    },
    {
      key: 'heritage',
      label: <Link to="/heritage-sites">Di Sản</Link>,
    },
    {
      key: 'artifacts',
      label: <Link to="/artifacts">Hiện Vật</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* TOP UTILITY BAR (Premium extra) */}
      {!isMobile && (
        <div className={`top-utility-bar ${scrolled ? 'hidden' : ''}`}>
          <div className="utility-content">
            <Space split={<span className="divider">|</span>}>
              <Text className="util-item"><MailOutlined /> support@sen.com</Text>
              <Text className="util-item">Kiến tạo trải nghiệm lịch sử, văn hoá bằng công nghệ</Text>
            </Space>
            <Space size="middle">
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
      )}

      <Header
        className={`main-header ${scrolled ? 'header-scrolled' : ''}`}
        style={{
          padding: isMobile ? '0 16px' : '0 40px',
        }}
      >
        {/* Logo */}
        <Link to="/" className="logo-container">
          <div
            className="logo-img"
            style={{
              backgroundImage: `url(${logo})`,
            }}
          />
        </Link>

        {/* Desktop Menu */}
        {!isMobile && (
          <Menu
            mode="horizontal"
            selectedKeys={[getActiveKey()]}
            items={navMenuItems}
            style={{
              flex: 1,
              border: 'none',
              marginLeft: 40,
            }}
          />
        )}

        {/* Desktop Search */}
        {!isMobile && (
          <Input
            placeholder="Tìm kiếm di sản..."
            prefix={<SearchOutlined />}
            className="search-input-premium"
            style={{ width: 240, marginRight: 24 }}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
          />
        )}

        {/* Right Side Actions */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {/* Notifications */}
          {!isMobile && (
            <Badge count={0} dot offset={[-2, 4]}>
              <BellOutlined
                style={{
                  fontSize: 22,
                  cursor: 'pointer',
                  color: '#666',
                }}
              />
            </Badge>
          )}

          {/* User Menu / Auth Buttons */}
          {isAuthenticated ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 12,
                  transition: 'background 0.3s',
                }}
                className="user-profile-trigger"
              >
                <Avatar
                  size={isMobile ? "small" : "default"}
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  style={{ background: '#F43F5E', border: '2px solid rgba(244, 63, 94, 0.2)' }}
                />
                {!isMobile && (
                  <span style={{ fontWeight: 600, color: '#444' }}>{user?.name}</span>
                )}
              </div>
            </Dropdown>
          ) : (
            !isMobile && (
              <>
                <Link to="/login">
                  <Button type="primary" className="action-btn-premium">
                    Bắt đầu ngay
                  </Button>
                </Link>
              </>
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
      </Header>

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
          {/* Mobile Search */}
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

      {/* CONTENT */}
      <Content
        style={{
          padding: isMobile ? '24px 16px' : '40px 24px',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          minHeight: 'calc(100vh - 140px)',
        }}
      >
        <Outlet />
      </Content>

      {/* FOOTER */}
      <CustomFooter />
    </Layout>
  );
};

export default MainLayout;
