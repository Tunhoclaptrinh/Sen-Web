import React, {useEffect, useState} from "react";
import {Card, Button, Spin, message, Progress, Result} from "antd";
import {
  CloseOutlined,
  ArrowRightOutlined,
  TrophyTwoTone,
  RedoOutlined,
  RocketOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";
import gameService from "@/services/game.service";
import {SCREEN_TYPES} from "@/types/game.types";
import type {Screen, Level} from "@/types/game.types";


// Screens
import DialogueScreen from "@/components/Game/Screens/DialogueScreen";
import QuizScreen from "@/components/Game/Screens/QuizScreen";
import HiddenObjectScreen from "@/components/Game/Screens/HiddenObjectScreen";
import TimelineScreen from "@/components/Game/Screens/TimelineScreen";
import ImageViewerScreen from "@/components/Game/Screens/ImageViewerScreen";
import VideoScreen from "@/components/Game/Screens/VideoScreen";

import "./EmbeddedGameZone.less";

interface EmbeddedGameZoneProps {
  levelId: string | number;
  onClose: () => void;
  onNavigateToFullGame?: () => void;
}

const EmbeddedGameZone: React.FC<EmbeddedGameZoneProps> = ({levelId, onClose, onNavigateToFullGame}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [levelInfo, setLevelInfo] = useState<Level | null>(null);
  const [progress, setProgress] = useState({completed: 0, total: 0});
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [gameCompleted, setGameCompleted] = useState(false);
  const [completionData, setCompletionData] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (levelId) {
      initGame(Number(levelId));
    }
  }, [levelId]);

  const initGame = async (id: number) => {
    try {
      setLoading(true);
      setGameCompleted(false);
      const data = await gameService.startLevel(id);
      setSessionId(data.sessionId);
      setCurrentScreen(data.currentScreen);
      setLevelInfo(data.level);
      setProgress({completed: 0, total: data.level.totalScreens || 1});
      setStartTime(Date.now());
    } catch (error) {
      console.error("Failed to start level", error);
      message.error("Không thể bắt đầu màn chơi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextScreen = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await gameService.navigateToNextScreen(sessionId);

      if (response.levelFinished) {
        await handleFinishLevel();
        return;
      }

      setCurrentScreen(response.currentScreen);
      setProgress({
        completed: response.progress.completedScreens,
        total: response.progress.totalScreens,
      });

      if (response.pointsEarned && response.pointsEarned > 0) {
        setScore((prev) => prev + response.pointsEarned!);
      }
    } catch (error: any) {
      console.error("Failed to navigate to next screen", error);
      message.error("Lỗi khi chuyển màn");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (answerId: string) => {
    if (!sessionId) throw new Error("No session");
    const res = await gameService.submitAnswer(sessionId, answerId);
    if (res.isCorrect) {
      setScore((prev) => prev + res.pointsEarned);
    }
    return res;
  };

  const handleTimelineSubmit = async (order: string[]) => {
    if (!sessionId) throw new Error("No session");
    const res = await gameService.submitTimeline(sessionId, order);
    if (res.isCorrect) {
      setScore((prev) => prev + (res.pointsEarned || 0));
    }
    return res;
  };

  const handleCollectItem = async (itemId: string) => {
    if (!levelId) throw new Error("No level ID");
    const res = await gameService.collectClue(Number(levelId), itemId);
    setScore((prev) => prev + res.pointsEarned);
    return res;
  };

  const handleFinishLevel = async () => {
    if (!levelId) return;
    setLoading(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const result = await gameService.completeLevel(Number(levelId), score, timeSpent);
      setCompletionData(result);
      setGameCompleted(true);
    } catch (error) {
      console.error("Failed to finish level", error);
      // Fallback for demo/guest mode if API fails due to auth or other reasons
      setCompletionData({
        passed: true,
        score: score,
        rewards: {coins: 0, petals: 0},
      });
      setGameCompleted(true);
    } finally {
      setLoading(false);
    }
  };

  const renderScreen = () => {
    if (!currentScreen) return null;

    const commonProps = {
      onNext: handleNextScreen,
      loading,
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
            fallbackImage={levelInfo?.thumbnail || levelInfo?.backgroundImage}
          />
        );
      case SCREEN_TYPES.HIDDEN_OBJECT:
        return <HiddenObjectScreen data={currentScreen as any} {...commonProps} onCollect={handleCollectItem} />;
      case SCREEN_TYPES.TIMELINE:
        return (
          <TimelineScreen
            data={currentScreen as any}
            {...commonProps}
            onSubmit={handleTimelineSubmit}
            fallbackImage={levelInfo?.thumbnail || levelInfo?.backgroundImage}
          />
        );
      case SCREEN_TYPES.IMAGE_VIEWER:
        return <ImageViewerScreen data={currentScreen as any} {...commonProps} />;
      case SCREEN_TYPES.VIDEO:
        return <VideoScreen data={currentScreen as any} {...commonProps} />;
      default:
        return (
          <div className="unsupported-screen">
            <h3>Sắp ra mắt</h3>
            <p>Loại màn hình này ({currentScreen.type}) đang được phát triển.</p>
            <Button onClick={handleNextScreen}>Bỏ qua</Button>
          </div>
        );
    }
  };

  if (gameCompleted && completionData) {
    return (
      <div className={`embedded-game-wrapper ${isFullscreen ? "fullscreen-mode" : ""}`}>
        <Card className="embedded-game-container completion-view">
        <Result
          status={completionData.passed ? "success" : "info"}
          icon={<TrophyTwoTone twoToneColor="#faad14" />}
          title={completionData.passed ? "Hoàn thành!" : "Rất tiếc!"}
          subTitle={`Bạn đã đạt được ${completionData.score} cúp.`}
          extra={[
            <Button type="primary" key="retry" icon={<RedoOutlined />} onClick={() => initGame(Number(levelId))}>
              Chơi lại
            </Button>,
            <Button key="close" onClick={onClose}>
              Đóng
            </Button>,
          ]}
        />
        {onNavigateToFullGame && (
          <div className="full-game-link">
            <Button type="link" onClick={onNavigateToFullGame}>
              Thử sức trong không gian Game chính <ArrowRightOutlined />
            </Button>
          </div>
        )}
      </Card>
      </div>
    );
  }

  return (
    <div className={`embedded-game-wrapper ${isFullscreen ? "fullscreen-mode" : ""}`}>
      <Card 
        className="embedded-game-container"
      title={
        <div className="game-header">
          <div className="level-title">
            <RocketOutlined style={{marginRight: 8, color: "var(--primary-color)"}} />
            {levelInfo?.name || "Đang tải..."}
          </div>
          <div className="game-actions">
            {onNavigateToFullGame && (
              <Button 
                type="link" 
                size="small" 
                onClick={onNavigateToFullGame}
                className="desktop-only"
              >
                Vào không gian game
              </Button>
            )}
            <Button 
              type="text" 
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="fullscreen-btn"
              title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
            />
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={onClose} 
              className="close-btn"
            />
          </div>
        </div>
      }
    >
      <div className="game-progress-bar">
        <Progress 
          percent={Math.round((progress.completed / (progress.total || 1)) * 100)} 
          size="small" 
          showInfo={false}
          strokeColor="var(--primary-color)"
        />
        <div className="score-badge">Cúp: {score}</div>
      </div>

      <div className="game-content-viewport">
        {loading && !currentScreen ? (
          <div className="game-loading">
            <Spin tip="Đang khởi tạo game..." />
          </div>
        ) : (
          renderScreen()
        )}
      </div>
    </Card>
    </div>
  );
};

export default EmbeddedGameZone;
