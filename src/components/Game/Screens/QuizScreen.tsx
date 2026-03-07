import React, { useState, useEffect } from "react";
import { Card, Button, Typography, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizScreen as QuizScreenType } from "@/types/game.types";
import { useGameSounds } from "@/hooks/useSound";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        return prev;
      });
    } else {
      setSelectedOptions([index]);
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) {
      message.warning(t('gamePlay.screens.quiz.selectOption'));
      return;
    }

    if (selectedOptions.length < requiredCount) {
      message.warning(t('gamePlay.screens.quiz.selectEnough', { count: requiredCount }));
      return;
    }

    setSubmitting(true);
    try {
      const answerPayload = isMultiple
        ? selectedOptions.map(idx => data.options[idx].text)
        : data.options[selectedOptions[0]].text;

      const response = await onSubmitAnswer(answerPayload);
      setResult(response);
    } catch (error) {
      message.error(t('gamePlay.errors.general'));
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
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="quiz-card">
            <div className="quiz-header">
              <Title level={3} className="question-text">
                {data.question || data.description}
              </Title>
              {isMultiple && !result && (
                <div className="quiz-subtitle" style={{ color: '#d48806', fontWeight: 600, marginTop: 12, fontFamily: "'Playfair Display', serif" }}>
                  {t('gamePlay.screens.quiz.selectLabel', { count: requiredCount, current: selectedOptions.length, target: requiredCount })}
                </div>
              )}
            </div>

            <div className={`quiz-options ${data.options.length > 3 ? 'grid-layout' : ''}`}>
              {data.options?.map((option, index) => {
                const isSelected = selectedOptions.includes(index);
                let btnClass = "quiz-option-btn";
                let icon = null;

                if (result) {
                  if (isSelected) {
                    if (option.isCorrect) {
                      btnClass += " correct";
                      icon = <CheckCircleOutlined style={{ marginRight: 8 }} />;
                    } else {
                      btnClass += " wrong";
                      icon = <CloseCircleOutlined style={{ marginRight: 8 }} />;
                    }
                  } else if (option.isCorrect) {
                    btnClass += " correct-hint";
                  }
                } else if (isSelected) {
                  btnClass += " selected";
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                    style={{ width: '100%' }}
                  >
                    <Button
                      size="large"
                      block
                      className={btnClass}
                      onClick={() => handleOptionClick(index)}
                      disabled={!!result || submitting}
                    >
                      {icon}
                      {option.text}
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence>
              {result && (
                <motion.div
                  className="quiz-feedback"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, type: "spring" }}
                >
                  <div className="quiz-feedback-box">
                    <div className={`feedback-header ${result.isCorrect ? 'correct' : 'wrong'}`}>
                      {result.isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      {result.isCorrect ? t('gamePlay.screens.quiz.correct') : t('gamePlay.screens.quiz.wrong')}
                    </div>
                    {result.explanation && (
                      <div className="feedback-text">
                        {result.explanation}
                      </div>
                    )}
                  </div>

                  {result.isCorrect ? (
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => { playClick(); onNext(); }}
                      block
                      disabled={loading}
                      className="seal-button"
                    >
                      {t('gamePlay.screens.quiz.nextStep')}
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
                      {t('gamePlay.screens.quiz.retry')}
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!result && (
              <div className="quiz-actions" style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={selectedOptions.length === 0}
                  block
                  className="seal-button"
                >
                  {t('gamePlay.screens.quiz.submit')} {isMultiple && selectedOptions.length > 0 && `(${selectedOptions.length}/${requiredCount})`}
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizScreen;
