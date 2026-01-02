import React from 'react';
import {
    HomeOutlined,
    BankOutlined,
    FileImageOutlined,
    PictureOutlined,
    UserOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    DashboardOutlined,
    FileOutlined,
    TrophyOutlined,
    BarChartOutlined,
    BookOutlined,
    FlagOutlined,
} from '@ant-design/icons';

export interface IMenuItem {
    path?: string;
    name: string;
    icon?: React.ReactNode;
    routes?: IMenuItem[];
    accessFilter?: string[]; // Roles that CAN access this items. If undefined, everyone can access.
    hideInMenu?: boolean;
}

// ================= ADMIN MENU =================
export const adminMenu: IMenuItem[] = [
    {
        path: '/admin/dashboard',
        name: 'Dashboard',
        icon: <DashboardOutlined />,
    },
    {
        path: '/admin/heritage',
        name: 'Quản Lý Di Sản',
        icon: <BankOutlined />,
    },
    {
        path: '/admin/artifacts',
        name: 'Quản Lý Hiện Vật',
        icon: <FileOutlined />,
    },
    {
        path: '/admin/users',
        name: 'Quản Lý Người Dùng',
        icon: <UserOutlined />,
    },
    {
        name: 'Game CMS',
        icon: <TrophyOutlined />,
        routes: [
            { path: '/admin/game/chapters', name: 'Chapters' },
            { path: '/admin/game/levels', name: 'Levels' },
            { path: '/admin/game/characters', name: 'Characters' },
            { path: '/admin/game/screens', name: 'Screens' },
        ],
    },
    {
        path: '/admin/analytics',
        name: 'Analytics',
        icon: <BarChartOutlined />,
    },
    {
        name: 'Assets',
        icon: <FileImageOutlined />,
        routes: [
            { path: '/admin/assets/images', name: 'Images' },
            { path: '/admin/assets/videos', name: 'Videos' },
            { path: '/admin/assets/audio', name: 'Audio' },
        ],
    },
];

// ================= CUSTOMER MENU =================
export const customerMenu: IMenuItem[] = [
    {
        path: '/',
        name: 'Trang chủ',
        icon: <HomeOutlined />,
    },
    {
        name: 'Trò chơi',
        icon: <TrophyOutlined />,
        routes: [
            { path: '/game/chapters', name: 'Sen Hoa' },
            { path: '/game/museum', name: 'Bảo tàng' },
            { path: '/game/leaderboard', name: 'Bảng xếp hạng' },
        ],
    },
    {
        path: '/learning',
        name: 'Học tập',
        icon: <BookOutlined />,
    },
    {
        path: '/quests',
        name: 'Nhiệm vụ',
        icon: <FlagOutlined />,
    },
    {
        path: '/heritage-sites',
        name: 'Di sản',
        icon: <BankOutlined />,
    },
];

// ================= RESEARCHER MENU =================
export const researcherMenu: IMenuItem[] = [
    {
        path: '/',
        name: 'Trang chủ',
        icon: <HomeOutlined />,
    },
    {
        name: 'Di sản',
        icon: <BankOutlined />,
        routes: [
            { path: '/researcher/heritage/my-submissions', name: 'Bài viết của tôi' },
            { path: '/researcher/heritage/create', name: 'Tạo mới', icon: <PlusOutlined /> },
            { path: '/researcher/heritage/pending', name: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
        ],
    },
    {
        name: 'Hiện vật',
        icon: <FileImageOutlined />,
        routes: [
            { path: '/researcher/artifacts/my-artifacts', name: 'Hiện vật của tôi' },
            { path: '/researcher/artifacts/create', name: 'Tạo mới', icon: <PlusOutlined /> },
            { path: '/researcher/artifacts/pending', name: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
        ],
    },
    {
        name: 'Triển lãm',
        icon: <PictureOutlined />,
        routes: [
            { path: '/researcher/exhibitions/my-exhibitions', name: 'Triển lãm của tôi' },
            { path: '/researcher/exhibitions/create', name: 'Tạo triển lãm', icon: <PlusOutlined /> },
        ],
    },
    {
        path: '/researcher/analytics',
        name: 'Thống kê',
        icon: <BarChartOutlined />,
    },
];
