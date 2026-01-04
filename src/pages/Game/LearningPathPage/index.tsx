import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    Button,
    Spin,
    Empty,
    Progress,
    Tag,
    message,
    Statistic,
} from 'antd';
import {
    BookOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import learningService from '@services/learning.service';
import './styles.less';

const { Meta } = Card;

const LearningPathPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [learningPath, setLearningPath] = useState<any[]>([]);
    const [progress, setProgress] = useState<any>(null);

    useEffect(() => {
        fetchLearningPath();
    }, []);

    const fetchLearningPath = async () => {
        try {
            setLoading(true);
            const response = await learningService.getLearningPath();
            setLearningPath(response.data || []);
            setProgress(response.progress);
        } catch (error) {
            message.error('Không thể tải lộ trình học tập');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        const colors: Record<string, string> = {
            easy: 'green',
            medium: 'orange',
            hard: 'red',
        };
        return colors[difficulty] || 'default';
    };

    const getDifficultyLabel = (difficulty: string) => {
        const labels: Record<string, string> = {
            easy: 'Dễ',
            medium: 'Trung Bình',
            hard: 'Khó',
        };
        return labels[difficulty] || difficulty;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải lộ trình học tập..." />
            </div>
        );
    }

    return (
        <div className="learning-path-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <BookOutlined /> Lộ Trình Học Tập
                    </h1>
                    <p className="page-description">
                        Khám phá và học hỏi về lịch sử văn hóa Việt Nam qua các module
                    </p>
                </div>
            </div>

            {progress && (
                <div className="learning-stats">
                    <Row gutter={[16, 16]}>
                        <Col xs={12} sm={6}>
                            <Card className="stat-card gradient-1">
                                <Statistic
                                    title="Tổng Module"
                                    value={progress.total || 0}
                                    prefix={<BookOutlined />}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card className="stat-card gradient-2">
                                <Statistic
                                    title="Đã Hoàn Thành"
                                    value={progress.completed || 0}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card className="stat-card gradient-3">
                                <Statistic
                                    title="Tiến Độ"
                                    value={progress.percentage || 0}
                                    suffix="%"
                                    prefix={<TrophyOutlined />}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card className="stat-card gradient-4">
                                <Statistic
                                    title="Thời Gian"
                                    value={
                                        learningPath.reduce(
                                            (sum, m) => sum + (m.estimated_duration || 0),
                                            0
                                        )
                                    }
                                    suffix="phút"
                                    prefix={<ClockCircleOutlined />}
                                    valueStyle={{ color: '#fff' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}

            <Card className="learning-content">
                {learningPath.length === 0 ? (
                    <Empty description="Chưa có module học tập nào" />
                ) : (
                    <Row gutter={[24, 24]} className="learning-grid">
                        {learningPath.map((module, index) => (
                            <Col xs={24} sm={12} lg={8} key={module.id}>
                                <Card
                                    hoverable
                                    className={`learning-card ${module.is_completed ? 'completed' : ''
                                        }`}
                                    cover={
                                        <div className="learning-cover">
                                            <div className="learning-number">{index + 1}</div>
                                            {module.is_completed && (
                                                <div className="completed-badge">
                                                    <CheckCircleOutlined /> Hoàn thành
                                                </div>
                                            )}
                                        </div>
                                    }
                                    actions={[
                                        <Button
                                            key="start"
                                            type={module.is_completed ? 'default' : 'primary'}
                                            block
                                            onClick={() => navigate(`/game/learning/${module.id}`)}
                                        >
                                            {module.is_completed ? 'Xem Lại' : 'Bắt Đầu'}
                                        </Button>,
                                    ]}
                                >
                                    <Meta
                                        title={module.title}
                                        description={
                                            <div className="module-meta">
                                                <div className="tags">
                                                    <Tag
                                                        color={getDifficultyColor(module.difficulty)}
                                                    >
                                                        {getDifficultyLabel(module.difficulty)}
                                                    </Tag>
                                                    <Tag icon={<ClockCircleOutlined />}>
                                                        {module.estimated_duration} phút
                                                    </Tag>
                                                </div>

                                                {module.is_completed && module.score !== null && (
                                                    <div className="score">
                                                        <Progress
                                                            type="circle"
                                                            percent={module.score}
                                                            width={60}
                                                            strokeColor={{
                                                                '0%': '#108ee9',
                                                                '100%': '#87d068',
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>

            {progress && progress.percentage < 100 && (
                <Card className="progress-card">
                    <div className="overall-progress">
                        <h3>Tiến Độ Tổng Thể</h3>
                        <Progress
                            percent={progress.percentage || 0}
                            status="active"
                            strokeColor={{
                                from: '#108ee9',
                                to: '#87d068',
                            }}
                        />
                        <p>
                            Bạn đã hoàn thành {progress.completed} / {progress.total} module
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default LearningPathPage;
