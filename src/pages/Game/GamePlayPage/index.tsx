import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import "./styles.less";

const { Title, Paragraph } = Typography;

/**
 * GamePlayPage - Container for actual gameplay
 * This is a placeholder that will be implemented with:
 * - Screen-based gameplay (DIALOGUE, QUIZ, HIDDEN_OBJECT, etc.)
 * - Progress tracking
 * - Score calculation
 * - Rewards system
 */
const GamePlayPage: React.FC = () => {
    const { levelId } = useParams<{ levelId: string }>();
    const navigate = useNavigate();

    return (
        <div className="gameplay-page">
            <div className="gameplay-header">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>
            </div>

            <Card className="gameplay-container">
                <Empty
                    description={
                        <div>
                            <Title level={3}>Gameplay Container</Title>
                            <Paragraph>
                                Trang này sẽ chứa gameplay thực tế với các màn hình:
                            </Paragraph>
                            <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                                <li>📖 DIALOGUE - Hội thoại với nhân vật lịch sử</li>
                                <li>❓ QUIZ - Câu hỏi trắc nghiệm</li>
                                <li>🔍 HIDDEN_OBJECT - Tìm đồ vật ẩn</li>
                                <li>📅 TIMELINE - Sắp xếp sự kiện theo thời gian</li>
                                <li>🖼️ IMAGE_VIEWER - Xem hình ảnh di sản</li>
                                <li>🎬 VIDEO - Xem video giới thiệu</li>
                            </ul>
                            <Paragraph type="secondary">
                                Level ID: {levelId}
                            </Paragraph>
                        </div>
                    }
                >
                    <Button type="primary" onClick={() => navigate('/game/chapters')}>
                        Quay về Sen Hoa
                    </Button>
                </Empty>
            </Card>
        </div>
    );
};

export default GamePlayPage;
