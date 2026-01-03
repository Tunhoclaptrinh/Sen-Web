import { BankOutlined, EnvironmentOutlined, GlobalOutlined, StarOutlined } from "@ant-design/icons";
import { StatisticsCard } from "@/components/common";

interface HeritageStatsProps {
    stats: any;
    loading: boolean;
}

const HeritageStats: React.FC<HeritageStatsProps> = ({ stats, loading }) => {
    const data = [
        {
            title: "Tổng số di sản",
            value: stats?.total || 0,
            icon: <BankOutlined />,
            valueColor: "#1890ff",
        },
        {
            title: "Di sản UNESCO",
            value: stats?.unesco || 0,
            icon: <GlobalOutlined />,
            valueColor: "#52c41a",
        },
        {
            title: "Bắc / Trung / Nam",
            value: <div style={{ display: "flex", alignItems: "center" }}>{stats?.region?.north || 0}/{stats?.region?.center || 0}/{stats?.region?.south || 0}</div>,
            icon: <EnvironmentOutlined />,
            valueColor: "#fa8c16",
        },
        {
            title: "Đánh giá cao",
            value: "N/A",
            icon: <StarOutlined />,
            valueColor: "#eb2f96",
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

export default HeritageStats;
