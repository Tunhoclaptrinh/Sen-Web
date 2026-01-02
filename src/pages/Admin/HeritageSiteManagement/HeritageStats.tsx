import React, { useEffect, useState } from "react";
import { BankOutlined, EnvironmentOutlined, GlobalOutlined, StarOutlined } from "@ant-design/icons";
import { StatisticsCard } from "@/components/common";
import heritageService from "@/services/heritage.service";
import { toast } from "@/components/common";

const HeritageStats = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await heritageService.getStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch heritage stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

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
            title: "Miền Bắc / Trung / Nam",
            value: `${stats?.region?.north || 0} / ${stats?.region?.center || 0} / ${stats?.region?.south || 0}`,
            icon: <EnvironmentOutlined />,
            valueColor: "#fa8c16",
        },
        {
            title: "Đánh giá cao",
            value: "N/A", // Placeholder as we didn't implement high rating count efficiently
            icon: <StarOutlined />,
            valueColor: "#eb2f96",
        }
    ];

    return (
        <StatisticsCard
            data={data}
            loading={loading}
            containerStyle={{ marginBottom: 24 }}
            colSpan={{ xs: 24, sm: 12, md: 6 }}
        />
    );
};

export default HeritageStats;
