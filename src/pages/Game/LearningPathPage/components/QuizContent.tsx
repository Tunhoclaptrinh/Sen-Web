import React from "react";
import { Card, Typography, Radio, Space, Row, Col, Tag } from "antd";
import { QuestionCircleOutlined, FireFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { LearningModule } from "@/services/learning.service";

const { Title, Text } = Typography;

interface QuizContentProps {
  module: LearningModule;
  answers: Record<number, number>;
  onAnswerChange: (questionId: number, optionIndex: number) => void;
}

const QuizContent: React.FC<QuizContentProps> = ({
  module,
  answers,
  onAnswerChange,
}) => {
  const { t } = useTranslation();
  const quiz = module.quiz;
  if (!quiz) return null;

  return (
    <Card className="detail-card quiz-card" id="quiz-section">
      <div className="quiz-container">
        <div className="quiz-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
          background: 'rgba(139, 29, 29, 0.05)',
          padding: '24px 32px',
          borderRadius: 12,
          border: '1px solid rgba(139, 29, 29, 0.1)',
        }}>
          <Space size={12}>
            <QuestionCircleOutlined style={{ fontSize: 32, color: "#8b1d1d" }} />
            <Title level={2} style={{ margin: 0, color: '#8b1d1d' }}>{t('gameLearning.quiz.title')}</Title>
          </Space>
          <div className="difficulty-badge" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'white',
            padding: '8px 16px',
            borderRadius: 20,
            border: '1px solid rgba(139, 29, 29, 0.2)',
            boxShadow: '0 2px 8px rgba(139, 29, 29, 0.05)'
          }}>
            <Text type="secondary" strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 }}>{t('gameLearning.quiz.difficultyLabel')}</Text>
            <FireFilled style={{ color: '#8b1d1d', fontSize: 16 }} />
            <Text strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: '#8b1d1d' }}>{t(`gameLearning.difficulty.${(module.difficulty || 'easy').toLowerCase()}`)}</Text>
          </div>
        </div>

        <Text type="secondary" style={{ display: 'block', marginBottom: 40, fontSize: 15 }}>
          {t('gameLearning.quiz.description')}
        </Text>

        <div className="questions-list">
          {quiz.questions.map((q, idx) => {
            const qKey = q.id !== undefined ? q.id : idx;
            return (
              <div key={qKey} className="question-item" style={{ marginBottom: 48 }}>
                <div className="question-label" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text type="secondary" strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {t('gameLearning.quiz.questionLabel', { index: idx + 1 })}
                  </Text>
                  <Tag color="orange" style={{ margin: 0, fontWeight: 700, borderRadius: 12, padding: '0 8px' }}>
                    {q.point || 10} điểm
                  </Tag>
                </div>
                <Title level={3} style={{ marginTop: 0, marginBottom: 28, fontSize: 22 }}>
                  {q.question}
                </Title>

                <Radio.Group
                  onChange={(e) => onAnswerChange(qKey, e.target.value)}
                  value={answers[qKey]}
                  className="quiz-options-group"
                >
                  <Row gutter={[0, 0]}>
                    {q.options.map((option, optIdx) => (
                      <Col span={24} key={optIdx}>
                        <Radio value={optIdx} className="quiz-option-wrapper">
                          <div className="opt-content">
                            <span className="opt-index">{String.fromCharCode(65 + optIdx)}</span>
                            <span className="opt-text">{option}</span>
                          </div>
                        </Radio>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default QuizContent;
