import {
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { UserStats } from "@/types";
import { StatisticsCard } from "@/components/common";

interface UserStatsProps {
  stats: UserStats | null;
  loading: boolean;
}

const UserStatsCard = ({ stats, loading }: UserStatsProps) => {
  const data = [
    {
      title: "Tổng người dùng",
      value: stats?.total || 0,
      icon: <TeamOutlined />,
      valueColor: "#3f8600",
    },
    {
      title: "Đang hoạt động",
      value: stats?.active || 0,
      icon: <CheckCircleOutlined />,
      valueColor: "#1890ff",
    },
    {
      title: "Đăng ký mới",
      value: stats?.recentSignups || 0,
      icon: <UserAddOutlined />,
      valueColor: "#cf1322",
    },
    {
      title: "Có đánh giá",
      value: stats?.withReviews || 0,
      icon: <UserOutlined />,
      valueColor: "#8c8c8c", // Gray for neutral
    },
  ];

  return (
    <StatisticsCard
      data={data}
      loading={loading}
      colSpan={{ sm: 12, md: 6, xl: 6 }}
      hideCard
      containerStyle={{ padding: "16px 16px 0 16px" }}
    />
  );
};

export default UserStatsCard;
