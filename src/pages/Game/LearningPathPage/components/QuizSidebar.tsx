import React, { useEffect } from "react";
import { Divider, Progress, Tooltip } from "antd";
import {
  ClockCircleOutlined,
  CheckOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { LearningModule } from "@/services/learning.service";
import Button from "@/components/common/Button";

interface QuizSidebarProps {
  module: LearningModule;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  answers: Record<number, number>;
  onTimeUp: () => void;
  warned: boolean;
  setWarned: (val: boolean) => void;
  onSubmit: () => void;
  submitting: boolean;
  isAllAnswered: boolean;
}

const QuizSidebar: React.FC<QuizSidebarProps> = ({
  module,
  timeLeft,
  setTimeLeft,
  answers,
  onTimeUp,
  warned,
  setWarned,
  onSubmit,
  submitting,
  isAllAnswered,
}) => {
  const { t } = useTranslation();
  const quiz = module.quiz;
  if (!quiz) return null;

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next === 60 && !warned) {
          setWarned(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp, warned, setWarned, setTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  return (
    <div className="quiz-sidebar">
      {/* Timer */}
      <Tooltip title={t('gameLearning.detail.tooltips.timer')}>
        <div className="tool-timer" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Progress
            type="circle"
            percent={(timeLeft / ((quiz.timeLimit || 30) * 60)) * 100}
            size={70}
            strokeWidth={8}
            strokeColor={timeLeft < 60 ? "#ff4d4f" : "#c09c67"}
            trailColor="#f5f5f5"
            format={() => (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                <ClockCircleOutlined style={{ fontSize: 16, color: timeLeft < 60 ? "#ff4d4f" : "#5c3a21", marginBottom: 4 }} />
                <span style={{ fontWeight: 900, fontSize: 14, color: timeLeft < 60 ? "#ff4d4f" : "#5c3a21" }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          />
        </div>
      </Tooltip>

      <Divider />

      {/* Progress */}
      <Tooltip title={t('gameLearning.detail.tooltips.progress')}>
        <div className="tool-progress">
          <Progress
            type="circle"
            percent={progressPercent}
            size={60}
            strokeWidth={10}
            format={() => (
              <div className="progress-text">
                <div style={{ fontSize: 16, fontWeight: 900, color: "#8b1d1d" }}>{answeredCount}</div>
                <div style={{ fontSize: 10, color: "#999", marginTop: -4 }}>/{totalQuestions}</div>
              </div>
            )}
            className="custom-progress"
          />
        </div>
      </Tooltip>

      <Divider />

      {/* Rewards Info */}
      <Tooltip title={module.isCompleted ? "Phần thưởng Ôn tập" : "Phần thưởng Lần đầu"}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div className="tool-icon-circle reward" style={{ background: '#fffbe6', color: '#faad14', border: '1px solid #ffe58f' }}>
            <StarFilled style={{ fontSize: 16, marginBottom: 2 }} />
            <div style={{ fontSize: 12, fontWeight: 800 }}>+{module.isCompleted ? (module.reviewRewardPoints ?? 10) : (module.rewardPoints ?? 50)}</div>
          </div>
          {(module.isCompleted ? (module.reviewRewardCoins ?? 0) : (module.rewardCoins ?? 0)) > 0 && (
            <div className="tool-icon-circle reward" style={{ background: '#fff0f6', color: '#eb2f96', border: '1px solid #ffadd2' }}>
              <div style={{ fontSize: 10, fontWeight: 900 }}>🪙</div>
              <div style={{ fontSize: 12, fontWeight: 800 }}>+{module.isCompleted ? module.reviewRewardCoins : module.rewardCoins}</div>
            </div>
          )}
        </div>
      </Tooltip>

      <Divider />

      {/* Passing Score Requirement */}
      <Tooltip title={t('gameLearning.detail.tooltips.passingScore', { score: quiz.passingScore })}>
        <div className="tool-icon-circle score">
          <CheckOutlined style={{ fontSize: 18, marginBottom: 2 }} />
          <div style={{ fontSize: 16, fontWeight: 900 }}>{quiz.passingScore}</div>
        </div>
      </Tooltip>

      <Divider />

      {/* Submit Action */}
      <div style={{ padding: '0 16px', width: '100%', textAlign: 'center' }}>
        <Tooltip title={!isAllAnswered ? t('gameLearning.quiz.hints.completeAll') : ''}>
          <span>
            <Button
              variant="primary"
              onClick={onSubmit}
              loading={submitting}
              disabled={!isAllAnswered || submitting}
              className="submit-quiz-btn"
              style={{ width: '100%', minHeight: 44, padding: '0 12px' }}
            >
              {submitting ? t('common.submitting') : t('gameLearning.quiz.actions.submit')}
            </Button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export default QuizSidebar;
