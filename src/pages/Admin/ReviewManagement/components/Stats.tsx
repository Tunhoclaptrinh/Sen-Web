import {
    MessageOutlined,
    StarOutlined,
    BankOutlined,
    BoxPlotOutlined
} from "@ant-design/icons";
import { StatisticsCard } from "@/components/common";

interface ReviewStatsProps {
    stats: any;
    loading: boolean;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ stats, loading }) => {
    // Nếu không có dữ liệu (API trả về null hoặc không hỗ trợ), không hiển thị gì
    if (!stats && !loading) return null;

    const data = [
        {
            title: "Tổng số đánh giá",
            value: stats?.total || 0,
            icon: <MessageOutlined />,
            valueColor: "#1890ff",
        },
        {
            title: "Đánh giá trung bình",
            value: stats?.avgRating || "0.0",
            icon: <StarOutlined />,
            valueColor: "#faad14",
        },
        {
            title: "Đánh giá Di sản",
            value: stats?.types?.heritage_site || 0,
            icon: <BankOutlined />,
            valueColor: "#52c41a",
        },
        {
            title: "Đánh giá Hiện vật",
            value: stats?.types?.artifact || 0,
            icon: <BoxPlotOutlined />,
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

export default ReviewStats;
