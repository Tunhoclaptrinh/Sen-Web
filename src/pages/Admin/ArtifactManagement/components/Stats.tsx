import {
    BoxPlotOutlined,
    ExperimentOutlined,
    EyeOutlined,
    EnvironmentOutlined
} from "@ant-design/icons";
import { StatisticsCard } from "@/components/common";

interface ArtifactStatsProps {
    stats: any;
    loading: boolean;
}

const ArtifactStats: React.FC<ArtifactStatsProps> = ({ stats, loading }) => {
    const data = [
        {
            title: "Tổng số hiện vật",
            value: stats?.total || 0,
            icon: <BoxPlotOutlined />,
            valueColor: "#722ed1",
        },
        {
            title: "Đang trưng bày",
            value: stats?.onDisplay || 0,
            icon: <EyeOutlined />,
            valueColor: "#52c41a",
        },
        {
            title: "Tình trạng Tốt",
            value: stats?.goodCondition || 0,
            icon: <ExperimentOutlined />,
            valueColor: "#1890ff",
        },
        {
            title: "Bắc / Trung / Nam",
            value: (
                <div style={{ display: "flex", alignItems: "center" }}>
                    {stats?.region?.north || 0}/{stats?.region?.center || 0}/{stats?.region?.south || 0}
                </div>
            ),
            icon: <EnvironmentOutlined />,
            valueColor: "#fa8c16",
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

export default ArtifactStats;
