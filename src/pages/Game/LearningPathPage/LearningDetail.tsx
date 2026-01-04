
import React, { useState, useEffect, startTransition } from 'react';
import { Card, Typography, Button, Radio, Space, Result, Spin, message, Divider, Tag, Empty, Modal } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import learningService, { LearningModule } from '@/services/learning.service';

const { Title, Paragraph } = Typography;

const LearningDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [module, setModule] = useState<LearningModule | null>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchModuleDetail(parseInt(id));
        }
    }, [id]);

    const fetchModuleDetail = async (moduleId: number) => {
        try {
            setLoading(true);
            const data = await learningService.getModuleDetail(moduleId);
            setModule(data);
        } catch (error) {
            message.error('Không thể tải nội dung bài học');
            handleNavigate('/game/learning');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (path: string) => {
        startTransition(() => {
            navigate(path);
        });
    };

    const handleAnswerChange = (questionId: number, optionIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmit = async () => {
        if (!module) return;

        // If it's a quiz, calculate score locally first
        let score = 100;
        if (module.quiz) {
            let correctCount = 0;
            module.quiz.questions.forEach(q => {
                if (answers[q.id] === q.correct_answer) {
                    correctCount++;
                }
            });
            score = Math.round((correctCount / module.quiz.questions.length) * 100);
        }

        try {
            setSubmitting(true);
            const response = await learningService.completeModule(0, module.id, {
                time_spent: 0,
                score: score
            });
            if (response.success) {
                if (response.data.passed) {
                    Modal.success({
                        title: 'Hoàn Thành Xuất Sắc!',
                        content: (
                            <div>
                                <p>Chúc mừng bạn đã hoàn thành bài học.</p>
                                <p>Điểm số: <b>{response.data.score}/100</b></p>
                                <p>Điểm thưởng: <span style={{ color: 'green' }}>+{response.data.points_earned} EXP</span></p>
                            </div>
                        ),
                        okText: 'Tiếp tục học',
                        onOk: () => handleNavigate('/game/learning')
                    });
                } else {
                    Modal.warning({
                        title: 'Chưa Đạt Yêu Cầu',
                        content: (
                            <div>
                                <p>Bạn đạt <b>{response.data.score}/100</b> điểm.</p>
                                <p>Hãy ôn tập lại kiến thức và thử lại nhé!</p>
                            </div>
                        ),
                        okText: 'Thử lại',
                        onOk: () => {
                            setAnswers({});
                        }
                    });
                }
            }
        } catch (error) {
            message.error('Nộp bài thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
    }

    if (!module) return <Empty description="Không tìm thấy bài học" />;

    return (
        <div style={{ maxWidth: 800, margin: '20px auto', padding: '0 20px' }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => handleNavigate('/game/learning')}
                style={{ marginBottom: 16 }}
            >
                Quay lại
            </Button>

            <Card title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{module.title}</span>
                    <Tag color="blue">{module.content_type.toUpperCase()}</Tag>
                </div>
            }>
                <Paragraph>{module.description}</Paragraph>

                <Divider />

                {/* Content Render */}
                {module.content_type === 'video' && module.content_url && (
                    <div style={{ marginBottom: 24 }}>
                        <div style={{
                            position: 'relative',
                            paddingBottom: '56.25%', /* 16:9 */
                            height: 0,
                            background: '#000',
                            borderRadius: 8,
                            overflow: 'hidden'
                        }}>
                            <iframe
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                src={module.content_url}
                                title={module.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}

                {module.content_type === 'article' && (
                    <div className="article-content" style={{ fontSize: 16, lineHeight: 1.8 }}>
                        <div dangerouslySetInnerHTML={{ __html: module.content_url || '' }} />
                    </div>
                )}

                {module.content_type === 'interactive' && (
                    <div style={{ textAlign: 'center', margin: '40px 0' }}>
                        <Result
                            icon={<div style={{ fontSize: 60 }}>🎮</div>}
                            title="Trải Nghiệm Tương Tác"
                            subTitle="Module này bao gồm một phần chơi tương tác thú vị."
                            extra={
                                <Button type="primary" size="large" onClick={() => handleNavigate(module.content_url || '/game')}>
                                    Chơi Ngay
                                </Button>
                            }
                        />
                    </div>
                )}

                <Divider />

                {/* Quiz Render */}
                {module.quiz && (
                    <div className="quiz-section">
                        <Title level={4}>Bài Kiểm Tra</Title>
                        {module.quiz.questions.map((q, idx) => (
                            <Card
                                key={q.id}
                                type="inner"
                                title={`Câu ${idx + 1}: ${q.question}`}
                                style={{ marginBottom: 16 }}
                            >
                                <Radio.Group
                                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                                    value={answers[q.id]}
                                >
                                    <Space direction="vertical">
                                        {q.options.map((opt, optIdx) => (
                                            <Radio key={optIdx} value={optIdx}>{opt}</Radio>
                                        ))}
                                    </Space>
                                </Radio.Group>
                            </Card>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: 32, textAlign: 'center' }}>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleSubmit}
                        loading={submitting}
                        disabled={!!module.quiz && Object.keys(answers).length < module.quiz.questions.length}
                    >
                        {module.quiz ? 'Nộp Bài' : 'Hoàn Thành'}
                    </Button>
                </div>

            </Card>
        </div>
    );
};

export default LearningDetail;
