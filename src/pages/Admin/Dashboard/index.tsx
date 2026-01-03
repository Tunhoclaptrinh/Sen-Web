import { Card, Row, Col, Spin, Statistic, Typography } from "antd";
import {
  UserOutlined,
  BankOutlined,
  FileOutlined,
  MessageOutlined,
  ArrowUpOutlined,
  GlobalOutlined
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import userService from "@services/user.service";
import heritageService from "@services/heritage.service";
import artifactService from "@services/artifact.service";
import reviewService from "@services/review.service";

const { Title, Text } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        const [u, h, a, r] = await Promise.all([
          userService.getStats(),
          heritageService.getStats(),
          artifactService.getStats(),
          reviewService.getStats()
        ]);

        setStats({
          users: u.data,
          heritage: h.data,
          artifacts: a.data,
          reviews: r.data
        });
      } catch (error) {
        console.error("Dashboard stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  const COLORS = ['#FF8042', '#00C49F', '#0088FE', '#FFBB28'];

  const regionData = [
    { name: 'Miền Bắc', value: stats?.heritage?.region?.north || 0 },
    { name: 'Miền Trung', value: stats?.heritage?.region?.center || 0 },
    { name: 'Miền Nam', value: stats?.heritage?.region?.south || 0 },
  ].filter(d => d.value > 0);

  const reviewDistribution = Object.entries(stats?.reviews?.ratings || {}).map(([rating, count]) => ({
    name: `${rating} Sao`,
    count: count
  }));

  return (
    <>
      <Title level={3}>Bảng điều khiển và quản trị</Title>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="stat-card" style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Statistic
                title="Người Dùng"
                value={stats?.users?.total || 0}
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontWeight: 700 }}
              />
              <Text type="secondary"><ArrowUpOutlined /> <Text strong>+12%</Text> so với tháng trước</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Statistic
                title="Di Sản"
                value={stats?.heritage?.total || 0}
                prefix={<BankOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a', fontWeight: 700 }}
              />
              <Text type="secondary"><GlobalOutlined /> <Text strong>{stats?.heritage?.unesco || 0}</Text> di sản UNESCO</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Statistic
                title="Hiện Vật"
                value={stats?.artifacts?.total || 0}
                prefix={<FileOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1', fontWeight: 700 }}
              />
              <Text type="secondary">Đang trưng bày: <Text strong>{stats?.artifacts?.onDisplay || 0}</Text></Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ height: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Statistic
                title="Đánh Giá"
                value={stats?.reviews?.avgRating || "0.0"}
                prefix={<MessageOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14', fontWeight: 700 }}
                suffix="/ 5.0"
              />
              <Text type="secondary">Tổng số: <Text strong>{stats?.reviews?.total || 0}</Text> lượt</Text>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="Phân Bố Di Sản Theo Vùng Miền" bordered={false} style={{ borderRadius: 12, height: 400 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {regionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Thống Kê Đánh Giá" bordered={false} style={{ borderRadius: 12, height: 400 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reviewDistribution}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" fill="#faad14" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </Spin>
    </>
  );
};

export default Dashboard;
