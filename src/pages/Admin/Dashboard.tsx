import { Card, Row, Col, Statistic, Spin, message } from "antd";
import {
  UserOutlined,
  BankOutlined,
  FileOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import userService from "@services/user.service";
import heritageService from "@services/heritage.service";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHeritageSites: 0,
    totalArtifacts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const users = await userService.getAll({ _limit: 1 });
        const sites = await heritageService.getAll({ _limit: 1 });

        setStats({
          totalUsers: users.pagination?.total || 0,
          totalHeritageSites: sites.pagination?.total || 0,
          totalArtifacts: 1250,
        });
      } catch (error) {
        message.error("Lỗi khi tải thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Spin spinning={loading}>
      <div>
        <h2>Bảng Điều Khiển</h2>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Người Dùng"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Di Sản"
                value={stats.totalHeritageSites}
                prefix={<BankOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Hiện Vật"
                value={stats.totalArtifacts}
                prefix={<FileOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Bộ Sưu Tập"
                value={28}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default Dashboard;
