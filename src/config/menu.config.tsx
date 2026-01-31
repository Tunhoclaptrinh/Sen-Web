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
    TrophyOutlined,
    BookOutlined,
    FlagOutlined,
    ShopOutlined,
} from '@ant-design/icons';

export interface IMenuItem {
    key?: string;
    path?: string;
    name: string;
    icon?: React.ReactNode;
    routes?: IMenuItem[];
    children?: IMenuItem[]; // Some versions of ProLayout use children
    accessFilter?: string[];
    hideInMenu?: boolean;
    disabled?: boolean;
}

// ================= ADMIN MENU =================
export const adminMenu: IMenuItem[] = [
    {
        key: 'admin-dashboard',
        path: '/admin/dashboard',
        name: 'Dashboard',
        icon: <DashboardOutlined />,
    },
    {
        key: 'content-management',
        name: 'Quản lý Nội dung',
        icon: <BankOutlined />,
        children: [
            {
                key: 'categories',
                path: '/admin/categories',
                name: 'Danh mục Văn hóa',
            },
            {
                key: 'sites',
                path: '/admin/heritage-sites',
                name: 'Di sản Văn hóa',
            },
            {
                key: 'artifacts',
                path: '/admin/artifacts',
                name: 'Hiện vật Lịch sử',
            },
            {
                key: 'history',
                path: '/admin/history',
                name: 'Bài viết văn hóa',
            },
            {
                key: 'exhibitions',
                path: '/admin/exhibitions',
                name: 'Triển lãm ảo',
            },
            
        ]
    },
    {
        key: 'game-management',
        name: 'Quản lý Game',
        icon: <TrophyOutlined />,
        children: [
            {
                key: 'chapters',
                path: '/admin/chapters',
                name: 'Chương',
            },
            {
                key: 'levels',
                path: '/admin/levels',
                name: 'Màn chơi',
            },
            {
                key: 'characters',
                path: '/admin/characters',
                name: 'Nhân vật Game',
            },
            {
                key: 'quests',
                path: '/admin/quests',
                name: 'Nhiệm vụ',
            },
            {
                key: 'assets',
                path: '/admin/assets',
                name: 'Đối tượng Quét (QR)',
            },
            {
                key: 'badges',
                path: '/admin/badges',
                name: 'Huy hiệu & Thành tựu',
            },
            {
                key: 'shop',
                path: '/admin/shop',
                name: 'Cửa hàng vật phẩm',
            },
        ]
    },
    {
        key: 'education-community',
        name: 'Giáo dục & Cộng đồng',
        icon: <BookOutlined />,
        children: [
            {
                key: 'learning',
                path: '/admin/learning',
                name: 'Bài ôn tập',
            },
            {
                key: 'reviews',
                path: '/admin/reviews',
                name: 'Đánh giá & Phản hồi',
            },
        ]
    },
    {
        key: 'users',
        path: '/admin/users',
        name: 'Người dùng',
        icon: <UserOutlined />,
    },
];

// ================= CUSTOMER MENU =================
// ================= CUSTOMER MENU =================
export const customerMenu: IMenuItem[] = [
    // 1. KHÁM PHÁ
    {
        name: 'KHÁM PHÁ',
        path: '/__group__/discovery',
        disabled: true,
        key: 'group-discovery'
    },
    {
        key: 'dashboard',
        path: '/game/dashboard',
        name: 'Dashboard',
        icon: <DashboardOutlined />,
    },
    {
        key: 'chapters',
        path: '/game/chapters',
        name: 'Sen Hoa',
        icon: <TrophyOutlined />, // or maybe a refined icon like CompassOutlined if available, but staying safe
    },

    // 2. HOẠT ĐỘNG
    {
        name: 'HOẠT ĐỘNG',
        path: '/__group__/activities',
        disabled: true,
        key: 'group-activities'
    },
    {
        key: 'quests',
        path: '/game/quests',
        name: 'Nhiệm vụ',
        icon: <FlagOutlined />,
    },
    {
        key: 'learning',
        path: '/game/learning',
        name: 'Ôn tập',
        icon: <BookOutlined />,
    },
    {
        key: 'books',
        path: '/undefined',
        name: 'Sách & Truyện',
        disabled: true,
    },

    // 3. TIỆN ÍCH
    {
        name: 'TIỆN ÍCH',
        path: '/__group__/assets',
        disabled: true,
        key: 'group-assets'
    },
    {
        key: 'shop',
        path: '/game/shop',
        name: 'Cửa hàng',
        icon: <ShopOutlined />,
    },
    {
        key: 'museum',
        path: '/game/museum',
        name: 'Bảo tàng',
        icon: <BankOutlined />, // Using Bank as Museum icon (or BuildOutlined)
    },

    // 4. CỘNG ĐỒNG (Optional visual separation)
    {
        name: 'CỘNG ĐỒNG',
        path: '/__group__/community',
        disabled: true,
        key: 'group-community'
    },
    {
        key: 'leaderboard',
        path: '/game/leaderboard',
        name: 'Bảng xếp hạng',
        icon: <TrophyOutlined />,
    },
];

// ================= RESEARCHER MENU =================
export const researcherMenu: IMenuItem[] = [
    {
        key: 'home',
        path: '/',
        name: 'Trang chủ',
        icon: <HomeOutlined />,
    },
    {
        key: 'heritage',
        name: 'Di sản',
        icon: <BankOutlined />,
        children: [
            { key: 'my-submissions', path: '/researcher/heritage/my-submissions', name: 'Bài viết của tôi' },
            { key: 'create', path: '/researcher/heritage/create', name: 'Tạo mới', icon: <PlusOutlined /> },
            { key: 'pending', path: '/researcher/heritage/pending', name: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
        ],
    },
    {
        key: 'artifacts',
        name: 'Hiện vật',
        icon: <FileImageOutlined />,
        children: [
            { key: 'my-artifacts', path: '/researcher/artifacts/my-artifacts', name: 'Hiện vật của tôi' },
            { key: 'create-artifact', path: '/researcher/artifacts/create', name: 'Tạo mới', icon: <PlusOutlined /> },
            { key: 'pending-artifact', path: '/researcher/artifacts/pending', name: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
        ],
    },
    {
        key: 'exhibitions',
        name: 'Triển lãm',
        icon: <PictureOutlined />,
        children: [
            { key: 'my-exhibitions', path: '/researcher/exhibitions/my-exhibitions', name: 'Triển lãm của tôi' },
            { key: 'create-exhibition', path: '/researcher/exhibitions/create', name: 'Tạo triển lãm', icon: <PlusOutlined /> },
        ],
    },
    {
        key: 'articles',
        name: 'Bài viết văn hóa',
        icon: <BookOutlined />,
        children: [
            { key: 'my-articles', path: '/researcher/history/my-articles', name: 'Bài viết của tôi' },
            { key: 'create-article', path: '/researcher/history/create', name: 'Viết bài mới', icon: <PlusOutlined /> },
        ],
    },
    {
        key: 'learning',
        name: 'Bài học ôn tập',
        icon: <BookOutlined />,
        children: [
            { key: 'learning-list', path: '/researcher/learning', name: 'Danh sách bài học' },
            { key: 'create-learning', path: '/researcher/learning/create', name: 'Tạo bài học mới', icon: <PlusOutlined /> },
        ],
    },
    {
        key: 'game-content',
        name: 'Quản lý Game',
        icon: <TrophyOutlined />,
        children: [
            { key: 'chapters', path: '/researcher/chapters', name: 'Chương' },
            { key: 'levels', path: '/researcher/levels', name: 'Màn chơi' },
        ],
    },
];
