import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Spin,
  Modal,
  Result,
  message,
  Progress,
} from "antd";
import {
  ArrowLeftOutlined,
  TrophyTwoTone,
  RedoOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";
import gameService from "@/services/game.service";
import type { Screen, Level } from "@/types/game.types";
import { SCREEN_TYPES } from "@/types/game.types";

// Screens
import DialogueScreen from "@/components/Game/Screens/DialogueScreen";
import QuizScreen from "@/components/Game/Screens/QuizScreen";
import HiddenObjectScreen from "@/components/Game/Screens/HiddenObjectScreen";
import TimelineScreen from "@/components/Game/Screens/TimelineScreen";
import ImageViewerScreen from "@/components/Game/Screens/ImageViewerScreen";
import VideoScreen from "@/components/Game/Screens/VideoScreen";

import "./styles.less";

const { Title, Paragraph } = Typography;

const GamePlayPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [levelInfo, setLevelInfo] = useState<Level | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [gameCompleted, setGameCompleted] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (levelId) {
      initGame(parseInt(levelId));
    }
  }, [levelId]);

  const initGame = async (id: number) => {
    try {
      setLoading(true);
      setGameCompleted(false);
      const data = await gameService.startLevel(id);
      setSessionId(data.session_id);
      setCurrentScreen(data.current_screen);
      setLevelInfo(data.level);
      setProgress({ completed: 0, total: data.level.total_screens || 10 });
      setStartTime(Date.now());
    } catch (error) {
      message.error("Không thể bắt đầu màn chơi. Vui lòng thử lại.");
      navigate("/game/chapters");
    } finally {
      setLoading(false);
    }
  };

  const handleNextScreen = async () => {
    if (!sessionId) return;

    if (currentScreen?.is_last) {
      await handleFinishLevel();
      return;
    }

    try {
      setLoading(true);
      const response = await gameService.navigateToNextScreen(sessionId);
      setCurrentScreen(response.current_screen);
      setProgress({
        completed: response.progress.completed_screens,
        total: response.progress.total_screens,
      });
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi chuyển màn");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (answerId: string) => {
    if (!sessionId) throw new Error("No session");
    const res = await gameService.submitAnswer(sessionId, answerId);
    if (res.is_correct) {
      setScore((prev) => prev + res.points_earned);
    }
    return res;
  };

  const handleTimelineSubmit = async (order: string[]) => {
    if (!sessionId) throw new Error("No session");
    const res = await gameService.submitTimeline(sessionId, order);
    if (res.isCorrect) {
      setScore((prev) => prev + (res.points_earned || 0));
    }
    return res;
  };

  const handleCollectItem = async (itemId: string) => {
    if (!levelId) throw new Error("No level ID");
    const res = await gameService.collectClue(parseInt(levelId), itemId);
    setScore((prev) => prev + res.points_earned);
    return res;
  };

  const handleFinishLevel = async () => {
    if (!levelId) return;
    setLoading(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await gameService.completeLevel(
        parseInt(levelId),
        score,
        timeSpent,
      );
      setCompletionData(result);
      setGameCompleted(true);
    } catch (error) {
      message.error("Lỗi khi hoàn thành màn chơi");
    } finally {
      setLoading(false);
    }
  };

  // Render Screen Content
  const renderScreen = () => {
    if (!currentScreen) return null;

    const commonProps = {
      onNext: handleNextScreen,
    };

    switch (currentScreen.type) {
      case SCREEN_TYPES.DIALOGUE:
        return <DialogueScreen data={currentScreen as any} {...commonProps} />;
      case SCREEN_TYPES.QUIZ:
        return (
          <QuizScreen
            data={currentScreen as any}
            {...commonProps}
            onSubmitAnswer={handleAnswerSubmit}
          />
        );
      case SCREEN_TYPES.HIDDEN_OBJECT:
        return (
          <HiddenObjectScreen
            data={currentScreen as any}
            {...commonProps}
            onCollect={handleCollectItem}
          />
        );
      case SCREEN_TYPES.TIMELINE:
        return (
          <TimelineScreen
            data={currentScreen as any}
            {...commonProps}
            onSubmit={handleTimelineSubmit}
          />
        );
      case SCREEN_TYPES.IMAGE_VIEWER:
        return (
          <ImageViewerScreen data={currentScreen as any} {...commonProps} />
        );
      case SCREEN_TYPES.VIDEO:
        return <VideoScreen data={currentScreen as any} {...commonProps} />;
      default:
        return (
          <div style={{ textAlign: "center", padding: 50, color: "white" }}>
            <Title level={3} style={{ color: "white" }}>
              Sắp ra mắt
            </Title>
            <Paragraph style={{ color: "rgba(255,255,255,0.8)" }}>
              Loại màn hình này ({currentScreen.type}) đang được phát triển.
            </Paragraph>
            <Button onClick={handleNextScreen}>Bỏ qua</Button>
          </div>
        );
    }
  };

  if (loading && !currentScreen && !gameCompleted) {
    return (
      <div className="game-loading">
        <Spin size="large" tip="Đang tải dữ liệu game..." />
      </div>
    );
  }

  if (gameCompleted && completionData) {
    return (
      <div className="game-completion">
        <Card className="completion-card">
          <Result
            icon={
              <TrophyTwoTone twoToneColor="#faad14" style={{ fontSize: 72 }} />
            }
            status="success"
            title="HOÀN THÀNH MÀN CHƠI!"
            subTitle={`Bạn đã xuất sắc vượt qua màn chơi này với số điểm: ${completionData.score}`}
            extra={[
              <Button
                type="primary"
                key="console"
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/game/chapters")}
              >
                Quay về Sảnh
              </Button>,
              <Button
                key="buy"
                size="large"
                icon={<RedoOutlined />}
                onClick={() => window.location.reload()}
              >
                Chơi Lại
              </Button>,
            ]}
          >
            <div className="rewards-summary">
              <Title level={4}>Phần thưởng nhận được:</Title>
              <div className="rewards-grid">
                <div className="reward-item">
                  <span className="reward-icon">🪙</span>
                  <span className="reward-value">
                    +{completionData.rewards.coins} Xu
                  </span>
                </div>
                <div className="reward-item">
                  <span className="reward-icon">🌸</span>
                  <span className="reward-value">
                    +{completionData.rewards.petals} Cánh Sen
                  </span>
                </div>
              </div>
            </div>
          </Result>
        </Card>
      </div>
    );
  }

  return (
    <div className={`gameplay-page ${isFullscreen ? "fullscreen-mode" : ""}`}>
      <div className="game-container">
        <div className="game-overlay-ui">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              Modal.confirm({
                title: "Thoát màn chơi?",
                content: "Tiến độ hiện tại của bạn sẽ bị mất.",
                okText: "Thoát",
                cancelText: "Ở lại",
                onOk: () => navigate("/game/chapters"),
              });
            }}
            className="back-button"
          >
            Thoát
          </Button>

          <div className="level-info">
            <Title level={5} style={{ margin: 0, color: "white" }}>
              {levelInfo?.name}
            </Title>
            <Progress
              percent={Math.round(
                (progress.completed / (progress.total || 1)) * 100,
              )}
              size="small"
              status="active"
              strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
              showInfo={false}
              style={{ width: 150 }}
            />
          </div>

          <div className="score-display">Điểm: {score}</div>
        </div>

        <div className="game-viewport">{renderScreen()}</div>

        <Button
          icon={
            isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
          }
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="fullscreen-button"
          size="large"
          title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
        />
      </div>
    </div>
  );
};

export default GamePlayPage;
