import { FileTextOutlined, EyeOutlined, CheckCircleOutlined, LineChartOutlined } from "@ant-design/icons";
import { StatisticsCard } from "@/components/common";

interface HistoryStatsProps {
  stats: any;
  loading: boolean;
}

const HistoryStats: React.FC<HistoryStatsProps> = ({ stats, loading }) => {
  const data = [
    {
      title: "Tổng bài viết",
      value: stats?.total || 0,
      icon: <FileTextOutlined />,
      valueColor: "#1890ff",
    },
    {
      title: "Đang hiển thị",
      value: stats?.active || 0,
      icon: <CheckCircleOutlined />,
      valueColor: "#52c41a",
    },
    {
      title: "Tổng lượt xem",
      value: stats?.totalViews || 0,
      icon: <EyeOutlined />,
      valueColor: "#faad14",
    },
    {
      title: "Lượt xem TB",
      value: stats?.avgViews || 0,
      icon: <LineChartOutlined />,
      valueColor: "#722ed1",
    }
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

export default HistoryStats;
