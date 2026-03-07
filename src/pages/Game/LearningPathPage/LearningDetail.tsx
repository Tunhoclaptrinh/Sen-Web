import React, { useState, useEffect, startTransition, useCallback } from "react";
import { Spin, message, Row, Col } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import learningService, { LearningModule } from "@/services/learning.service";
import { useGameSounds } from "@/hooks/useSound";

// Sub-components
import LearningHeader from "./components/LearningHeader";
import QuizSidebar from "./components/QuizSidebar";
import LessonContent from "./components/LessonContent";
import QuizContent from "./components/QuizContent";
import { showCompletionModal } from "./components/CompletionModal";
import "./styles.less";

const LearningDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playClick, playSuccess, playError } = useGameSounds();

  // State
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<LearningModule | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<"content" | "quiz">("content");
  const [timeLeft, setTimeLeft] = useState(0);
  const [warned, setWarned] = useState(false);

  const handleNavigate = useCallback(
    (path: string) => {
      startTransition(() => {
        playClick();
        navigate(path);
      });
    },
    [navigate, playClick],
  );

  const fetchModuleDetail = useCallback(
    async (moduleId: number) => {
      try {
        setLoading(true);
        const data = await learningService.getModuleDetail(moduleId);
        setModule(data);
        if (data.quiz?.timeLimit) {
          setTimeLeft(data.quiz.timeLimit * 60);
        } else {
          setTimeLeft(30 * 60); // Default 30 mins
        }
      } catch (error) {
        message.error(t('gameLearning.errors.fetchModule'));
        handleNavigate("/game/learning");
      } finally {
        setLoading(false);
      }
    },
    [handleNavigate, t],
  );

  useEffect(() => {
    if (id) {
      fetchModuleDetail(parseInt(id));
    }
  }, [id, fetchModuleDetail]);

  const handleAnswerChange = (questionId: number, optionIndex: number) => {
    playClick();
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNextStep = () => {
    playClick();
    if (module?.quiz) {
      setCurrentStep("quiz");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleCompleteLesson();
    }
  };

  const handleCompleteLesson = async () => {
    if (!module) return;
    try {
      setSubmitting(true);
      await learningService.completeModule(module.id, {
        timeSpent: 0,
        score: 100,
      });
      handleNavigate("/game/learning");
    } catch (error) {
      message.error(t('gameLearning.errors.submitQuiz'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!module || !module.quiz) return;

    let score = 0;
    const questions = module.quiz.questions;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((q, idx) => {
      const questionPoint = q.point || 10;
      totalPoints += questionPoint;
      const qKey = q.id !== undefined ? q.id : idx;
      if (answers[qKey] === q.correctAnswer) {
        earnedPoints += questionPoint;
      }
    });

    score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    try {
      setSubmitting(true);
      const limit = module.quiz.timeLimit || 30;
      const response = await learningService.completeModule(module.id, {
        timeSpent: limit * 60 - timeLeft,
        score: score,
        answers: answers,
      });

      if (response.success) {
        const modalData = {
          passed: response.data.passed,
          score: response.data.score,
          pointsEarned: response.data.pointsEarned,
          coinsEarned: (response.data as any).coinsEarned,
          neededScore: module.quiz.passingScore,
          isLevelUp: (response.data as any).isLevelUp,
          newLevel: (response.data as any).newLevel,
        };

        showCompletionModal(
          t,
          modalData,
          (success) => {
            if (success) {
              handleNavigate("/game/learning");
            } else {
              setAnswers({});
              const element = document.getElementById("quiz-section");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }
          },
          playSuccess,
          playError
        );
      }
    } catch (error) {
      message.error(t('gameLearning.errors.submitQuiz'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    if (currentStep === "quiz" && !submitting) {
      message.warning(t('gameLearning.quiz.timer.timeUp'));
      handleSubmitQuiz();
    }
  }, [currentStep, submitting, t]);

  if (loading) {
    return (
      <div className="learning-loading-container">
        <Spin size="large" tip={t('gameLearning.loading.module')} />
      </div>
    );
  }

  if (!module) return null;

  const isAllAnswered = module.quiz ? module.quiz.questions.length === Object.keys(answers).length : false;

  return (
    <div className="learning-detail-page">
      <LearningHeader
        onBack={() => currentStep === 'quiz' ? setCurrentStep('content') : handleNavigate("/game/learning")}
      />

      <div className="learning-content-container">
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} lg={currentStep === "quiz" ? 18 : 20} xl={currentStep === "quiz" ? 16 : 18}>
            <AnimatePresence mode="wait">
              {currentStep === "content" ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <LessonContent module={module} onContinue={handleNextStep} />
                </motion.div>
              ) : (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <QuizContent
                    module={module}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Col>

          {currentStep === "quiz" && (
            <Col xs={0} lg={4} xl={3}>
              <QuizSidebar
                module={module}
                timeLeft={timeLeft}
                setTimeLeft={setTimeLeft}
                answers={answers}
                onTimeUp={handleTimeUp}
                warned={warned}
                setWarned={setWarned}
                onSubmit={handleSubmitQuiz}
                submitting={submitting}
                isAllAnswered={isAllAnswered}
              />
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default LearningDetail;
