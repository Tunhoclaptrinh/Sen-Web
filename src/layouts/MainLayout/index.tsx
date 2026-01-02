import React, { useState, useEffect } from 'react';
import './styles.less';
import { Layout, Menu, Dropdown, Button, Badge, Input, Drawer, Avatar, MenuProps } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  MenuOutlined,
  SettingOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import logo from '@/assets/images/logo.png';

const { Header, Content, Footer } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
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
      {/* HEADER */}
      <Header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isMobile ? '0 16px' : '0 24px',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          height: isMobile ? 60 : 70,
        }}
      >
        {/* Logo */}
        <Link to="/">
          <div
            style={{
              backgroundImage: `url(${logo})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              width: isMobile ? 70 : 90,
              height: 36,
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
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            style={{ width: 200, marginRight: 16 }}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
          />
        )}

        {/* Right Side Actions */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Notifications */}
          <Badge count={0}>
            <BellOutlined
              style={{
                fontSize: 20,
                cursor: 'pointer',
                color: '#595959',
              }}
            />
          </Badge>

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
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 12px',
                  borderRadius: 8,
                  transition: 'background 0.3s',
                }}
              >
                <Avatar
                  size="small"
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  style={{ background: '#F43F5E' }}
                />
                {!isMobile && <span>{user?.name}</span>}
              </div>
            </Dropdown>
          ) : (
            !isMobile && (
              <>
                <Link to="/login">
                  <Button type="primary" size="small">
                    Đăng Nhập
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
        title="Menu"
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Mobile Search */}
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
          />

          {/* Mobile Menu */}
          <Menu
            mode="vertical"
            selectedKeys={[getActiveKey()]}
            items={navMenuItems}
            style={{ border: 'none' }}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Auth Buttons */}
          {!isAuthenticated && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button type="primary" block>
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
      <Footer
        style={{
          background: '#fafafa',
          borderTop: '1px solid #e8e8e8',
          padding: isMobile ? '24px 16px' : '40px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#d4a574', margin: 0 }}>
          &copy; 2024 Sen. Kiến tạo trải nghiệm lịch sử, văn hoá bằng công nghệ.
        </p>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
