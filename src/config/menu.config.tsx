import React from "react";
import {
  BankOutlined,
  FileImageOutlined,
  PictureOutlined,
  UserOutlined,
  DashboardOutlined,
  TrophyOutlined,
  BookOutlined,
  FlagOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  QrcodeOutlined,
  BellOutlined,
  GiftOutlined,
} from "@ant-design/icons";

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
    key: "admin-dashboard",
    path: "/admin/dashboard",
    name: "Dashboard",
    icon: <DashboardOutlined />,
  },
  {
    key: "content-management",
    name: "Quản lý Nội dung",
    icon: <BankOutlined />,
    children: [
      {
        key: "categories",
        path: "/admin/categories",
        name: "Danh mục Văn hóa",
      },
      {
        key: "sites",
        path: "/admin/heritage-sites",
        name: "Di sản Văn hóa",
      },
      {
        key: "artifacts",
        path: "/admin/artifacts",
        name: "Hiện vật Lịch sử",
      },
      {
        key: "history",
        path: "/admin/history",
        name: "Bài viết văn hóa",
      },
      {
        key: "exhibitions",
        path: "/admin/exhibitions",
        name: "Triển lãm ảo",
      },
    ],
  },
  {
    key: "game-management",
    name: "Quản lý Game",
    icon: <TrophyOutlined />,
    children: [
      {
        key: "chapters",
        path: "/admin/chapters",
        name: "Chương",
      },
      {
        key: "levels",
        path: "/admin/levels",
        name: "Màn chơi",
      },
      {
        key: "characters",
        path: "/admin/characters",
        name: "Nhân vật Game",
      },
      {
        key: "quests",
        path: "/admin/quests",
        name: "Nhiệm vụ",
      },
      {
        key: "assets",
        path: "/admin/assets",
        name: "Đối tượng Quét (QR)",
      },
      {
        key: "badges",
        path: "/admin/badges",
        name: "Huy hiệu & Thành tựu",
      },
      {
        key: "shop",
        path: "/admin/shop",
        name: "Cửa hàng vật phẩm",
      },
      {
        key: "leaderboard",
        path: "/admin/leaderboard",
        name: "Bảng xếp hạng",
      },
      {
        key: "welfare",
        path: "/admin/welfare",
        name: "Quản lý phúc lợi",
      },
    ],
  },
  {
    key: "education-community",
    name: "Giáo dục & Cộng đồng",
    icon: <BookOutlined />,
    children: [
      {
        key: "learning",
        path: "/admin/learning",
        name: "Bài ôn tập",
      },
      {
        key: "reviews",
        path: "/admin/reviews",
        name: "Đánh giá & Phản hồi",
      },
    ],
  },
  {
    key: "notifications",
    path: "/admin/notifications",
    name: "Phát thông báo",
    icon: <BellOutlined />,
  },
  {
    key: "users",
    path: "/admin/users",
    name: "Người dùng",
    icon: <UserOutlined />,
  },
];

// ================= CUSTOMER MENU =================
export const customerMenu: IMenuItem[] = [
  // 1. KHÁM PHÁ
  {
    name: "KHÁM PHÁ",
    path: "/__group__/discovery",
    disabled: true,
    key: "group-discovery",
  },
  {
    key: "dashboard",
    path: "/game/dashboard",
    name: "Dashboard",
    icon: <DashboardOutlined />,
  },
  {
    key: "chapters",
    path: "/game/chapters",
    name: "Sen Hoa",
    icon: <TrophyOutlined />,
  },
  {
    key: "map",
    path: "/game/map",
    name: "Bản đồ Di sản",
    icon: <EnvironmentOutlined />,
  },
  {
    key: "scan",
    path: "/game/scan",
    name: "Quét QR / Check-in",
    icon: <QrcodeOutlined />,
  },

  // 2. HOẠT ĐỘNG
  {
    name: "HOẠT ĐỘNG",
    path: "/__group__/activities",
    disabled: true,
    key: "group-activities",
  },
  {
    key: "quests",
    path: "/game/quests",
    name: "Nhiệm vụ",
    icon: <FlagOutlined />,
  },
  {
    key: "learning",
    path: "/game/learning",
    name: "Ôn tập",
    icon: <BookOutlined />,
  },
  {
    key: "books",
    path: "/game/books",
    name: "Sách & Truyện",
    disabled: true,
  },

  // 3. TIỆN ÍCH
  {
    name: "TIỆN ÍCH",
    path: "/__group__/assets",
    disabled: true,
    key: "group-assets",
  },
  {
    key: "shop",
    path: "/game/shop",
    name: "Cửa hàng",
    icon: <ShopOutlined />,
  },
  {
    key: "museum",
    path: "/game/museum",
    name: "Bảo tàng",
    icon: <BankOutlined />,
  },
  {
    key: "welfare",
    path: "/game/welfare",
    name: "Quy đổi phúc lợi",
    icon: <GiftOutlined />,
  },

  // 4. CỘNG ĐỒNG
  {
    name: "CỘNG ĐỒNG",
    path: "/__group__/community",
    disabled: true,
    key: "group-community",
  },
  {
    key: "leaderboard",
    path: "/game/leaderboard",
    name: "Bảng xếp hạng",
    icon: <TrophyOutlined />,
  },
];

// ================= RESEARCHER MENU =================
export const researcherMenu: IMenuItem[] = [
  {
    name: "QUẢN LÝ NỘI DUNG",
    path: "/__group__/content",
    disabled: true,
    key: "group-content",
  },
  {
    key: "heritage",
    path: "/researcher/heritage-sites",
    name: "Di sản Văn hóa",
    icon: <BankOutlined />,
  },
  {
    key: "artifacts",
    path: "/researcher/artifacts",
    name: "Hiện vật Lịch sử",
    icon: <FileImageOutlined />,
  },
  {
    key: "exhibitions",
    path: "/researcher/exhibitions",
    name: "Triển lãm",
    icon: <PictureOutlined />,
  },
  {
    key: "articles",
    path: "/researcher/history",
    name: "Bài viết văn hóa",
    icon: <BookOutlined />,
  },
  {
    name: "QUẢN LÝ SỰ KIỆN & GAME",
    path: "/__group__/game",
    disabled: true,
    key: "group-game",
  },
  {
    key: "learning",
    path: "/researcher/learning",
    name: "Bài học ôn tập",
    icon: <BookOutlined />,
  },
  {
    key: "game-content",
    name: "Nội dung Game",
    icon: <TrophyOutlined />,
    children: [
      {key: "chapters", path: "/researcher/chapters", name: "Chương"},
      {key: "levels", path: "/researcher/levels", name: "Màn chơi"},
    ],
  },
];
