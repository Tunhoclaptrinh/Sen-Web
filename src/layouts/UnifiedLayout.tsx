import React from "react";
import { ProLayout, ProLayoutProps } from "@ant-design/pro-components";
import { Dropdown, Avatar, theme } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/images/logo.png";

export interface UnifiedLayoutProps extends ProLayoutProps {
  user?: {
    name?: string;
    avatar?: string;
  };
  onLogout?: () => void;
  userMenuExtraItems?: any[];
  actionsRender?: (props: any) => React.ReactNode[];
  children?: React.ReactNode;
}

const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  user,
  onLogout,
  userMenuExtraItems = [],
  actionsRender,
  children,
  ...props
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const defaultUserMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: onLogout,
      danger: true,
    },
  ];

  const userMenuItems = [...userMenuExtraItems, ...defaultUserMenuItems];

  return (
    <ProLayout
      // title="Sen Heritage"
      title=""
      logo={logo}
      layout="mix"
      splitMenus={false}
      fixedHeader
      fixSiderbar
      location={{
        pathname: location.pathname,
      }}
      onMenuHeaderClick={() => navigate('/')}
      menuItemRender={(item, dom) => {
        if (item.disabled) {
            return (
                <div 
                    style={{ 
                        cursor: 'default', 
                        color: 'rgba(80, 80, 80, 0.3)',
                        fontWeight: 'bold', 
                        textTransform: 'uppercase',
                        fontSize: '12px',
                        marginTop: '16px',
                        marginBottom: '8px',
                        pointerEvents: 'none', // Put this to make sure hover effects don't trigger if any
                    }}
                >
                    {dom}
                </div>
            );
        }
        if (item.isUrl || !item.path || (item as any).children) {
          return dom;
        }
        return <div onClick={() => navigate(item.path!)}>{dom}</div>;
      }}
      avatarProps={{
        src: user?.avatar,
        icon: <UserOutlined />,
        size: "small",
        title: user?.name,
        render: () => {
          return (
            <Dropdown
              menu={{
                items: userMenuItems,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <Avatar
                  size="small"
                  src={user?.avatar}
                  icon={<UserOutlined />}
                />
                <span style={{ color: token.colorText }}>{user?.name}</span>
              </div>
            </Dropdown>
          );
        },
      }}
      actionsRender={actionsRender}
      {...props}
    >
      {children}
    </ProLayout>
  );
};

export default UnifiedLayout;
