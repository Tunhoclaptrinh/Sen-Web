import React, { useState, useEffect } from "react";
import { Card, Button, Typography, message, Space, Alert } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import type { QuizScreen as QuizScreenType } from "@/types/game.types";
import { useGameSounds } from "@/hooks/useSound";
import "./styles.less";

import { getImageUrl } from "@/utils/image.helper";

const { Title } = Typography;

interface Props {
  data: QuizScreenType;
  onNext: () => void;
  onSubmitAnswer: (answerId: string | string[]) => Promise<{ isCorrect: boolean; explanation?: string }>;
  fallbackImage?: string;
  loading?: boolean;
}

const QuizScreen: React.FC<Props> = ({ data, onNext, onSubmitAnswer, fallbackImage, loading }) => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [result, setResult] = useState<{ isCorrect: boolean; explanation?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { playClick } = useGameSounds();

  const requiredCount = data.requiredItems || 1;
  const isMultiple = requiredCount > 1;

  // Reset state when question changes
  useEffect(() => {
    setSelectedOptions([]);
    setResult(null);
    setSubmitting(false);
  }, [data]);

  const handleOptionClick = (index: number) => {
    if (result) return; // Prevent changing after submission
    playClick();

    if (isMultiple) {
      setSelectedOptions(prev => {
        if (prev.includes(index)) {
          return prev.filter(i => i !== index);
        }
        if (prev.length < requiredCount) {
          return [...prev, index];
        }
        // If already reached limit, replace last one or do nothing? 
        // User said "add number required to find". Let's allow toggling.
        // If they click a new one and are at limit, we can either block or replace.
        // Let's block to be explicit about "already selected X".
        return prev;
      });
    } else {
      setSelectedOptions([index]);
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) {
      message.warning("Vui lòng chọn đáp án");
      return;
    }

    if (selectedOptions.length < requiredCount) {
      message.warning(`Vui lòng chọn đủ ${requiredCount} đáp án`);
      return;
    }

    setSubmitting(true);
    try {
      // Gửi text của đáp án hoặc mảng text
      const answerPayload = isMultiple
        ? selectedOptions.map(idx => data.options[idx].text)
        : data.options[selectedOptions[0]].text;

      const response = await onSubmitAnswer(answerPayload);
      setResult(response);
    } catch (error) {
      message.error("Có lỗi xảy ra khi gửi câu trả lời");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="quiz-screen">
      <div
        className="game-background"
        style={{
          backgroundImage: `url("${getImageUrl(data.backgroundImage || fallbackImage, "https://via.placeholder.com/1200x600?text=Quiz+Background")}")`,
        }}
      />

      <div className="screen-content-wrapper">
        <Card className="quiz-card">
          <div className="quiz-header">
            <Title level={3} className="question-text">
              {data.question || data.description}
            </Title>
            {isMultiple && !result && (
              <div className="quiz-subtitle" style={{ color: '#faad14', fontWeight: 500, marginTop: 8 }}>
                Chọn đúng {requiredCount} đáp án ({selectedOptions.length}/{requiredCount})
              </div>
            )}
          </div>

          <div className="quiz-options">
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {data.options?.map((option, index) => {
                const isSelected = selectedOptions.includes(index);
                let btnClass = "quiz-option-btn";
                let icon = null;

                if (result) {
                  if (isSelected) {
                    if (option.isCorrect) {
                      btnClass += " correct";
                      icon = <CheckCircleOutlined />;
                    } else {
                      btnClass += " wrong";
                      icon = <CloseCircleOutlined />;
                    }
                  } else if (option.isCorrect) {
                    // Hiển thị đáp án đúng nếu người chơi chọn sai
                    btnClass += " correct-hint";
                  }
                } else if (isSelected) {
                  btnClass += " selected";
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
                message={result.explanation || (result.isCorrect ? "Chính xác!" : "Chưa chính xác!")}
                type={result.isCorrect ? "success" : "error"}
                showIcon
                style={{ marginTop: 20, marginBottom: 20 }}
              />
              {result.isCorrect ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => { playClick(); onNext(); }}
                  block
                  disabled={loading}
                  className="bouncy-button" // Ensure bouncy style
                >
                  Tiếp tục hành trình
                </Button>
              ) : (
                <Button
                  type="default"
                  danger
                  size="large"
                  onClick={() => { playClick(); setResult(null); setSelectedOptions([]); }}
                  block
                  disabled={loading}
                >
                  Thử lại
                </Button>
              )}
            </div>
          )}

          {!result && (
            <div className="quiz-actions" style={{ marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                loading={submitting}
                disabled={selectedOptions.length === 0}
                block
              >
                Trả lời {isMultiple && selectedOptions.length > 0 && `(${selectedOptions.length}/${requiredCount})`}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default QuizScreen;
