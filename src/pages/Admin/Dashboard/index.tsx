import {Card, Row, Col, Spin, Typography, Button, List, Avatar, Tag, Space, Divider, Dropdown, Empty} from "antd";
import {
  UserOutlined,
  BankOutlined,
  FileOutlined,
  MessageOutlined,
  ArrowUpOutlined,
  HistoryOutlined,
  BookOutlined,
  PlusOutlined,
  RightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  BellOutlined,
  WarningOutlined,
  BulbOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend} from "recharts";
import {
  historyService,
  learningService,
  userService,
  heritageService,
  artifactService,
  reviewService,
  badgeService,
  notificationService,
} from "@/services";
import {useNavigate} from "react-router-dom";

const {Title, Text, Paragraph} = Typography;

const COLORS = ["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1", "#eb2f96"];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  trend?: string;
  description?: string;
}

const StatCard = ({title, value, icon, color, gradient, trend, description}: StatCardProps) => (
  <Card
    bordered={false}
    style={{
      height: "100%",
      borderRadius: 16,
      background: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    }}
    bodyStyle={{padding: "24px", flex: 1, display: "flex", flexDirection: "column"}}
  >
    <div
      style={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        background: gradient,
        borderRadius: "50%",
        opacity: 0.1,
        zIndex: 0,
      }}
    />

    <Row align="middle" gutter={16} style={{position: "relative", zIndex: 1, flex: 1}}>
      <Col>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: gradient,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            fontSize: 24,
            boxShadow: `0 8px 16px ${color}33`,
          }}
        >
          {icon}
        </div>
      </Col>
      <Col flex={1}>
        <Text type="secondary" style={{fontSize: 13, textTransform: "uppercase", letterSpacing: 1}}>
          {title}
        </Text>
        <div style={{display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap"}}>
          <Title level={2} style={{margin: 0, fontWeight: 700}}>
            {value}
          </Title>
          {trend && (
            <Tag color="success" icon={<ArrowUpOutlined />} style={{borderRadius: 10}}>
              {trend}
            </Tag>
          )}
        </div>
        {description && (
          <Text type="secondary" style={{fontSize: 12, display: "block", marginTop: 4}}>
            {description}
          </Text>
        )}
      </Col>
    </Row>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [u, h, a, r, b, hi, l, n] = await Promise.all([
          userService.getStats(),
          heritageService.getStats(),
          artifactService.getStats(),
          reviewService.getStats(),
          badgeService.getStats(),
          historyService.getStats(),
          learningService.getStats(),
          notificationService.getNotifications(1, 5),
        ]);

        setStats({
          users: u.data,
          heritage: h.data,
          artifacts: a.data,
          reviews: r.data,
          badges: b.data,
          history: hi.data,
          learning: l.data,
        });

        setNotifications(n.items || []);

        // Fetch recent activities across content types
        const [recentH, recentA, recentHi] = await Promise.all([
          heritageService.getAll({_limit: 3, _sort: "updatedAt", _order: "desc"}),
          artifactService.getAll({_limit: 3, _sort: "updatedAt", _order: "desc"}),
          historyService.getAll({_limit: 3, _sort: "updatedAt", _order: "desc"}),
        ]);

        const combined = [
          ...(recentH.data || []).map((i) => ({
            ...i,
            type: "Di sản",
            icon: <BankOutlined />,
            link: `/admin/heritage-sites?editId=${i.id}`,
          })),
          ...(recentA.data || []).map((i) => ({
            ...i,
            type: "Hiện vật",
            icon: <FileOutlined />,
            link: `/admin/artifacts?editId=${i.id}`,
          })),
          ...(recentHi.data || []).map((i) => ({
            ...i,
            type: "Lịch sử",
            icon: <HistoryOutlined />,
            link: `/admin/history?editId=${i.id}`,
          })),
        ]
          .sort(
            (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(),
          )
          .slice(0, 5);

        setRecentActivities(combined);
      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const contentStatusData = [
    {
      name: "Đã xuất bản",
      value:
        (stats?.heritage?.published || 0) +
        (stats?.artifacts?.published || 0) +
        (stats?.history?.active || 0) +
        (stats?.learning?.published || 0),
      color: "#52c41a",
    },
    {
      name: "Chờ duyệt",
      value: (stats?.heritage?.pending || 0) + (stats?.artifacts?.pending || 0) + (stats?.learning?.pending || 0),
      color: "#faad14",
    },
    {
      name: "Nháp",
      value: (stats?.heritage?.draft || 0) + (stats?.artifacts?.draft || 0) + (stats?.learning?.draft || 0),
      color: "#bfbfbf",
    },
  ].filter((d) => d.value > 0);

  const regionData = [
    {name: "Miền Bắc", value: stats?.heritage?.region?.north || 0},
    {name: "Miền Trung", value: stats?.heritage?.region?.center || 0},
    {name: "Miền Nam", value: stats?.heritage?.region?.south || 0},
  ].filter((d) => d.value > 0);

  const artifactConditionData = [
    {name: "Tốt", value: stats?.artifacts?.byCondition?.good || 0, color: "#52c41a"},
    {name: "Khá", value: stats?.artifacts?.byCondition?.fair || 0, color: "#faad14"},
    {
      name: "Kém/Hỏng",
      value: (stats?.artifacts?.byCondition?.poor || 0) + (stats?.artifacts?.byCondition?.damaged || 0),
      color: "#f5222d",
    },
  ].filter((d) => d.value > 0);

  const learningDifficultyData = [
    {name: "Dễ", value: stats?.learning?.byDifficulty?.easy || 0, color: "#52c41a"},
    {name: "Trung bình", value: stats?.learning?.byDifficulty?.medium || 0, color: "#faad14"},
    {name: "Khó", value: stats?.learning?.byDifficulty?.hard || 0, color: "#f5222d"},
  ].filter((d) => d.value > 0);

  const attentionItems = [
    {
      label: "Cần phê duyệt",
      count: (stats?.heritage?.pending || 0) + (stats?.artifacts?.pending || 0) + (stats?.learning?.pending || 0),
      color: "#faad14",
      icon: <WarningOutlined />,
      link: "/admin/heritage-sites?status=pending",
    },
    {
      label: "Bản nháp",
      count: (stats?.heritage?.draft || 0) + (stats?.artifacts?.draft || 0) + (stats?.learning?.draft || 0),
      color: "#1890ff",
      icon: <EditOutlined />,
      link: "/admin/heritage-sites?status=draft",
    },
    {
      label: "Đánh giá mới",
      count: stats?.reviews?.total || 0, // Placeholder, usually would be "pending reviews"
      color: "#f5222d",
      icon: <MessageOutlined />,
      link: "/admin/reviews",
    },
  ];

  const quickCreateItems = [
    {key: "/admin/heritage-sites", icon: <BankOutlined />, label: "Thêm Di sản"},
    {key: "/admin/artifacts", icon: <FileOutlined />, label: "Thêm Hiện vật"},
    {key: "/admin/history", icon: <HistoryOutlined />, label: "Viết bài Lịch sử"},
    {key: "/admin/learning", icon: <BookOutlined />, label: "Tạo bài học"},
  ];

  return (
    <div style={{padding: "0 0 24px"}}>
      <div
        style={{
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <Title level={2} style={{margin: 0, fontWeight: 700}}>
            Tổng quan hệ thống
          </Title>
          <Paragraph type="secondary" style={{margin: 0}}>
            Cập nhật lúc {new Date().toLocaleTimeString("vi-VN")} ngày {new Date().toLocaleDateString("vi-VN")}
          </Paragraph>
        </div>
        <Space>
          <Dropdown menu={{items: quickCreateItems, onClick: ({key}) => navigate(key)}} placement="bottomRight">
            <Button type="primary" icon={<PlusOutlined />} shape="round" size="large">
              Thêm nội dung mới
            </Button>
          </Dropdown>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]} style={{marginBottom: 24}}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Người dùng"
              value={stats?.users?.total || 0}
              icon={<UserOutlined />}
              color="#1890ff"
              gradient="linear-gradient(135deg, #69c0ff 0%, #1890ff 100%)"
              trend="12%"
              description="Năng động: 85%"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Di sản & Hiện vật"
              value={(stats?.heritage?.total || 0) + (stats?.artifacts?.total || 0)}
              icon={<BankOutlined />}
              color="#52c41a"
              gradient="linear-gradient(135deg, #95de64 0%, #52c41a 100%)"
              description={`${stats?.heritage?.unesco || 0} di sản UNESCO`}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Bài viết & Module"
              value={(stats?.history?.total || 0) + (stats?.learning?.total || 0)}
              icon={<BookOutlined />}
              color="#722ed1"
              gradient="linear-gradient(135deg, #b37feb 0%, #722ed1 100%)"
              description={`Tổng lượt xem: ${stats?.history?.totalViews || 0}`}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Đánh giá TB"
              value={stats?.reviews?.avgRating?.toFixed(1) || "0.0"}
              icon={<MessageOutlined />}
              color="#faad14"
              gradient="linear-gradient(135deg, #ffd666 0%, #faad14 100%)"
              description={`Từ ${stats?.reviews?.total || 0} lượt đánh giá`}
            />
          </Col>
        </Row>

        <Row gutter={[24, 24]} align="stretch">
          <Col xs={24} xl={16}>
            <Row gutter={[24, 24]}>
              {/* Attention Card */}
              <Col xs={24} lg={12} style={{display: "flex", flexDirection: "column"}}>
                <Card
                  title={
                    <span>
                      <BulbOutlined style={{color: "#1890ff", marginRight: 8}} />
                      Cần xử lý
                    </span>
                  }
                  bordered={false}
                  style={{
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                  bodyStyle={{padding: "20px 24px", flex: 1}}
                >
                  <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                    {attentionItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(item.link)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "16px",
                          background: "#f8faff",
                          borderRadius: 12,
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          border: "1px solid #f0f3f7",
                        }}
                        className="attention-item"
                      >
                        <Space size={16}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: `${item.color}15`,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              color: item.color,
                            }}
                          >
                            {item.icon}
                          </div>
                          <Text strong style={{fontSize: 15}}>
                            {item.label}
                          </Text>
                        </Space>
                        <Space>
                          <Tag
                            color={
                              item.count > 0
                                ? item.color === "#faad14"
                                  ? "gold"
                                  : item.color === "#1890ff"
                                    ? "blue"
                                    : "red"
                                : "default"
                            }
                            style={{borderRadius: 6, padding: "0 10px", fontWeight: 600}}
                          >
                            {item.count}
                          </Tag>
                          <RightOutlined style={{fontSize: 10, color: "#bfbfbf"}} />
                        </Space>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>

              {/* Content Status Donut */}
              <Col xs={24} lg={12} style={{display: "flex", flexDirection: "column"}}>
                <Card
                  title={
                    <span>
                      <CheckCircleOutlined style={{color: "#52c41a", marginRight: 8}} />
                      Trạng thái nội dung
                    </span>
                  }
                  bordered={false}
                  style={{
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                  bodyStyle={{padding: "24px", flex: 1, display: "flex", alignItems: "center"}}
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={contentStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {contentStatusData.map((entry: any, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.1)"}}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* Artifact Condition & Learning Difficulty */}
              <Col xs={24} lg={12} style={{display: "flex", flexDirection: "column"}}>
                <Card
                  title={
                    <span>
                      <HistoryOutlined style={{color: "#722ed1", marginRight: 8}} />
                      Tình trạng Hiện vật
                    </span>
                  }
                  bordered={false}
                  style={{
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                  bodyStyle={{padding: "24px", flex: 1}}
                >
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={artifactConditionData} layout="vertical" margin={{left: 10, right: 30}}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: "#f5f5f5"}} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                        {artifactConditionData.map((entry: any, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} lg={12} style={{display: "flex", flexDirection: "column"}}>
                <Card
                  title={
                    <span>
                      <BookOutlined style={{color: "#eb2f96", marginRight: 8}} />
                      Độ khó bài học
                    </span>
                  }
                  bordered={false}
                  style={{
                    borderRadius: 16,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                  bodyStyle={{padding: "24px", flex: 1}}
                >
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={learningDifficultyData} layout="vertical" margin={{left: 10, right: 30}}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: "#f5f5f5"}} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                        {learningDifficultyData.map((entry: any, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              {/* Region Bar Chart */}
              <Col xs={24}>
                <Card
                  title={
                    <span>
                      <EnvironmentOutlined style={{color: "#1890ff", marginRight: 8}} />
                      Di sản theo vùng miền
                    </span>
                  }
                  bordered={false}
                  style={{borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.03)"}}
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={regionData} margin={{top: 20}}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        cursor={{fill: "#f5f7fa"}}
                        contentStyle={{borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.08)"}}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                        {regionData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col xs={24} xl={8} style={{display: "flex", flexDirection: "column"}}>
            <Card
              title={
                <span>
                  <BellOutlined style={{color: "#f5222d", marginRight: 8}} />
                  Thông báo mới
                </span>
              }
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                height: 380,
                display: "flex",
                flexDirection: "column",
                marginBottom: 24,
              }}
              bodyStyle={{flex: 1, overflowY: "auto", padding: "12px 24px"}}
              extra={
                <Button type="link" size="small" onClick={() => navigate("/notifications")}>
                  Tất cả
                </Button>
              }
            >
              {notifications.length > 0 ? (
                <List
                  size="small"
                  dataSource={notifications}
                  renderItem={(item) => (
                    <List.Item style={{padding: "12px 0", borderBottom: "1px solid #f0f2f5"}}>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<BellOutlined />}
                            style={{
                              backgroundColor: item.isRead ? "#f5f5f5" : "#e6f7ff",
                              color: item.isRead ? "#bfbfbf" : "#1890ff",
                            }}
                          />
                        }
                        title={
                          <Text strong={!item.isRead} style={{fontSize: 13}}>
                            {item.title}
                          </Text>
                        }
                        description={
                          <Text type="secondary" style={{fontSize: 11}}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description="Không có thông báo mới"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{marginTop: 20}}
                />
              )}
            </Card>

            <Card
              title={
                <span>
                  <ClockCircleOutlined style={{color: "#722ed1", marginRight: 8}} />
                  Hoạt động gần đây
                </span>
              }
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
              bodyStyle={{flex: 1, overflowY: "auto", padding: 0}}
            >
              <List
                itemLayout="horizontal"
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item
                    style={{padding: "16px 24px", borderBottom: "1px solid #f5f5f7"}}
                    actions={[
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        key="edit"
                        onClick={() => navigate(item.link)}
                        style={{color: "#bfbfbf"}}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={item.icon}
                          style={{
                            backgroundColor: "#f9f9fc",
                            color: "#722ed1",
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        />
                      }
                      title={
                        <Text strong ellipsis={{tooltip: item.name || item.title}} style={{fontSize: 14}}>
                          {item.name || item.title}
                        </Text>
                      }
                      description={
                        <div style={{display: "flex", flexDirection: "column", gap: 6}}>
                          <Space split={<Divider type="vertical" style={{margin: 0}} />} style={{fontSize: 12}}>
                            <Text type="secondary" style={{color: "#8c8c8c"}}>
                              {item.type}
                            </Text>
                            <Text type="secondary" style={{color: "#8c8c8c"}}>
                              {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                            </Text>
                          </Space>
                          <Tag
                            color={item.status === "published" ? "success" : "warning"}
                            style={{
                              width: "fit-content",
                              fontSize: 10,
                              margin: 0,
                              borderRadius: 4,
                              padding: "0 6px",
                              lineHeight: "18px",
                            }}
                          >
                            {item.status === "published" ? "Đã đăng" : "Đang duyệt"}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      <style>{`
        .attention-item:hover {
          background: #f0f7ff !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(24,144,255,0.08);
        }
        .ant-list-item-meta-title {
           margin-bottom: 4px !important;
        }
        .ant-card-head {
          border-bottom: 1px solid #fcfcfc !important;
          padding: 0 24px !important;
        }
        .ant-card-head-title {
          padding: 20px 0 !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
