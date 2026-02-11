import { PictureOutlined, ClockCircleOutlined, EditOutlined, GlobalOutlined } from "@ant-design/icons";
import { StatisticsCard } from "@/components/common";

interface ExhibitionStatsProps {
    stats: any;
    loading: boolean;
}

const ExhibitionStats: React.FC<ExhibitionStatsProps> = ({ stats, loading }) => {
    const data = [
        {
            title: "Tổng số",
            value: stats?.total || 0,
            icon: <PictureOutlined />,
            valueColor: "#1890ff",
        },
        {
            title: "Xuất bản / Đang mở",
            value: `${stats?.published || 0} / ${stats?.active || 0}`,
            icon: <GlobalOutlined />,
            valueColor: "#52c41a",
        },
        {
            title: "Chờ phê duyệt",
            value: stats?.pending || 0,
            icon: <ClockCircleOutlined />,
            valueColor: "#fa8c16",
        },
        {
            title: "Bản nháp",
            value: stats?.draft || 0,
            icon: <EditOutlined />,
            valueColor: "#8c8c8c",
        }
    ];

    return (
        <StatisticsCard
            data={data}
            loading={loading}
            colSpan={{ sm: 12, md: 6, xl: 6 }}
            hideCard
        />
    );
};

export default ExhibitionStats;
