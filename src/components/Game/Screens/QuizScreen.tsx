import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, message, Space, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { QuizScreen as QuizScreenType } from '@/types/game.types';
import './styles.less';

const { Title } = Typography;

interface Props {
    data: QuizScreenType;
    onNext: () => void;
    onSubmitAnswer: (answerId: string) => Promise<{ is_correct: boolean; explanation?: string }>;
    fallbackImage?: string;
}

const QuizScreen: React.FC<Props> = ({ data, onNext, onSubmitAnswer, fallbackImage }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [result, setResult] = useState<{ is_correct: boolean; explanation?: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Reset state when question changes
    useEffect(() => {
        setSelectedOption(null);
        setResult(null);
        setSubmitting(false);
    }, [data]);

    const handleOptionClick = (index: number) => {
        if (result) return; // Prevent changing after submission
        setSelectedOption(index);
    };

    const handleSubmit = async () => {
        if (selectedOption === null) {
            message.warning('Vui lòng chọn một đáp án');
            return;
        }

        setSubmitting(true);
        try {
            // Gửi text của đáp án thay vì index
            const answerText = data.options[selectedOption].text;
            const response = await onSubmitAnswer(answerText);
            setResult(response);
            if (response.is_correct) {
                message.success('Chính xác! + điểm');
            } else {
                message.error('Chưa chính xác');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi gửi câu trả lời');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="quiz-screen">
            <div
                className="game-background"
                style={{ backgroundImage: `url("${data.background_image || fallbackImage || 'https://via.placeholder.com/1200x600?text=Quiz+Background'}")` }}
            />

            <div className="screen-content-wrapper">
                <Card className="quiz-card">
                    <div className="quiz-header">
                        <Title level={3} className="question-text">{data.question || data.description}</Title>
                    </div>

                    <div className="quiz-options">
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            {data.options?.map((option, index) => {
                                const isSelected = selectedOption === index;
                                let btnClass = 'quiz-option-btn';
                                let icon = null;

                                if (result) {
                                    if (isSelected) {
                                        if (result.is_correct) {
                                            btnClass += ' correct';
                                            icon = <CheckCircleOutlined />;
                                        } else {
                                            btnClass += ' wrong';
                                            icon = <CloseCircleOutlined />;
                                        }
                                    }
                                } else if (isSelected) {
                                    btnClass += ' selected';
                                }

                                return (
                                    <Button
                                        key={index}
                                        size="large"
                                        block
                                        className={btnClass}
                                        onClick={() => handleOptionClick(index)}
                                        disabled={!!result}
                                        icon={icon}
                                    >
                                        {option.text}
                                    </Button>
                                );
                            })}
                        </Space>
                    </div>

                    {result && (
                        <div className="quiz-feedback">
                            <Alert
                                message={result.is_correct ? "Chính xác!" : "Sai rồi!"}
                                description={result.explanation}
                                type={result.is_correct ? "success" : "error"}
                                showIcon
                                style={{ marginTop: 20, marginBottom: 20 }}
                            />
                            <Button type="primary" size="large" onClick={onNext} block>
                                Tiếp tục hành trình
                            </Button>
                        </div>
                    )}

                    {!result && (
                        <div className="quiz-actions" style={{ marginTop: 24 }}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleSubmit}
                                loading={submitting}
                                disabled={selectedOption === null}
                                block
                            >
                                Trả lời
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default QuizScreen;
