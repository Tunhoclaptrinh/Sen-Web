import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Spin, Modal, message, Progress } from "antd";
import Button from "@/components/common/Button";
import {
  ArrowLeftOutlined,
  TrophyTwoTone,
  RedoOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import gameService from "@/services/game.service";
import type { Screen, Level } from "@/types/game.types";
import { SCREEN_TYPES } from "@/types/game.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/hooks/useAuth";
import AIChat from "@/components/AIChat";

// Screens
import DialogueScreen from "@/components/Game/Screens/DialogueScreen";
import QuizScreen from "@/components/Game/Screens/QuizScreen";
import HiddenObjectScreen from "@/components/Game/Screens/HiddenObjectScreen";
import TimelineScreen from "@/components/Game/Screens/TimelineScreen";
import ImageViewerScreen from "@/components/Game/Screens/ImageViewerScreen";
import VideoScreen from "@/components/Game/Screens/VideoScreen";
import {
  setCurrentLevel,
} from "@/store/slices/gameSlice";
import { setOverlayOpen, setActiveContext } from "@/store/slices/aiSlice";
import { setBgmAutoMuted } from "@/store/slices/audioSlice";
import { useGameSounds } from "@/hooks/useSound";
import AudioSettingsPopover from "@/components/Game/AudioSettingsPopover";
import { SoundOutlined, MutedOutlined } from "@ant-design/icons";

import "./styles.less";

const { Title, Paragraph } = Typography;

const GamePlayPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isOverlayOpen, layoutMode } = useAppSelector((state) => state.ai);
  const { isMuted } = useAppSelector((state) => state.audio);
  const isChatOpen = isOverlayOpen && layoutMode === "absolute";

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

  const [pointsGained, setPointsGained] = useState<number | null>(null);

  // Global Audio State
  const { playClick, playSuccess, playError, playCollect, playWin } = useGameSounds();

  useEffect(() => {
    if (levelId) {
      initGame(parseInt(levelId));
    }
    return () => {
      dispatch(setCurrentLevel(null));
    };
  }, [levelId, dispatch]);

  // Audio Control: Mute BGM during video playback
  useEffect(() => {
    if (currentScreen?.type === SCREEN_TYPES.VIDEO) {
      dispatch(setBgmAutoMuted(true));
    }
    // We don't set it to false here because CustomerLayout handles level-BGM priority
  }, [currentScreen?.type, dispatch]);

  const triggerScoreAnimation = (points: number) => {
    if (points > 0) {
      setPointsGained(points);
      setTimeout(() => setPointsGained(null), 1500);
    }
  };

  const initGame = async (id: number) => {
    try {
      setLoading(true);
      setGameCompleted(false);
      const data = await gameService.startLevel(id);
      setSessionId(data.sessionId);
      setCurrentScreen(data.currentScreen);
      setLevelInfo(data.level);
      dispatch(setCurrentLevel(data.level));
      setProgress({ completed: 0, total: data.level.totalScreens || 10 });
      setStartTime(Date.now());
    } catch (error) {
      message.error("Không thể bắt đầu màn chơi. Vui lòng thử lại.");
      navigate("/game/chapters");
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = () => {
    if (!levelId) return;
    playClick();
    setScore(0);
    setProgress({ completed: 0, total: levelInfo?.totalScreens || 10 });
    setGameCompleted(false);
    setCompletionData(null);
    initGame(parseInt(levelId));
  };

  const handleNextScreen = async () => {
    if (!sessionId) return;
    playClick();

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

      // ⚡ Animation
      if (response.pointsEarned && response.pointsEarned > 0) {
        const points = response.pointsEarned;
        setScore((prev) => prev + points);
        triggerScoreAnimation(points);
      }
    } catch (error: any) {
      if (error?.response?.status !== 409) {
        console.error(error);
        message.error("Lỗi khi chuyển màn");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (answerId: string | string[]) => {
    if (!sessionId) throw new Error("No session");
    const res = await gameService.submitAnswer(sessionId, answerId);
    if (res.isCorrect) {
      playSuccess();
      setScore((prev) => prev + res.pointsEarned);
    } else {
      playError();
    }
    return res;
  };

  const handleTimelineSubmit = async (order: string[]) => {
    if (!sessionId) throw new Error("No session");
    const res = await gameService.submitTimeline(sessionId, order);
    if (res.isCorrect) {
      playSuccess();
      setScore((prev) => prev + (res.pointsEarned || 0));
    } else {
      playError();
    }
    return res;
  };

  const handleCollectItem = async (itemId: string) => {
    if (!levelId) throw new Error("No level ID");
    const res = await gameService.collectClue(parseInt(levelId), itemId);
    if (res.item) {
      playCollect();
    }
    setScore((prev) => prev + res.pointsEarned);
    return res;
  };

  const { user } = useAuth();

  const handleFinishLevel = async () => {
    if (!levelId) return;
    setLoading(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // ADMIN: Simulate completion, do not save
    if (user?.role === "admin") {
      const mockResult = {
        success: true,
        passed: true,
        score: score,
        requiredScore: 0,
        rewards: { coins: 0, petals: 0 },
        breakdown: { baseScore: score, timeBonus: 0 },
        isCompleted: true,
        message: "Admin Mode: Completed without saving.",
      };
      setTimeout(() => {
        setCompletionData(mockResult);
        setGameCompleted(true);
        setLoading(false);
        message.info("Admin Mode: Kết quả không được lưu vào hệ thống.");
      }, 1000);
      return;
    }

    try {
      const result = await gameService.completeLevel(parseInt(levelId), score, timeSpent);
      if (result.passed !== false) {
        playWin();
      }
      setCompletionData(result);
      setGameCompleted(true);
      dispatch(setBgmAutoMuted(false));
    } catch (error: any) {
      if (error?.response?.status !== 409) {
        console.error(error);
        message.error("Lỗi khi hoàn thành màn chơi");
      }
    } finally {
      setLoading(false);
    }
  };

  // Render Screen Content
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
            fallbackImage={levelInfo?.thumbnail}
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
            fallbackImage={levelInfo?.thumbnail}
          />
        );
      case SCREEN_TYPES.IMAGE_VIEWER:
        return <ImageViewerScreen data={currentScreen as any} {...commonProps} />;
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
            <Button variant="primary" onClick={handleNextScreen}>Bỏ qua</Button>
          </div>
        );
    }
  };

  // Render Completion Screen
  const renderCompletion = () => {
    if (!completionData) return null;
    return (
      <div className="game-completion">
        <Card className="completion-card">
          <div className="custom-completion-layout">
            <div className="completion-header">
              <TrophyTwoTone twoToneColor="#faad14" style={{ fontSize: 80 }} />
              <Title level={2} className="completion-title">
                {completionData.passed === false ? "RẤT TIẾC!" : "HOÀN THÀNH MÀN CHƠI!"}
              </Title>
              <Paragraph className="completion-subtitle">
                {completionData.passed === false
                  ? `Bạn chưa đủ cúp để qua màn. Hãy thử lại nhé!`
                  : `Bạn đã xuất sắc vượt qua màn chơi này với: ${completionData.score} 🏆`}
              </Paragraph>
            </div>

            <div className="completion-body-row">
              {/* LEFT: Score Breakdown */}
              <div className="completion-section">
                {completionData.passed === false ? (
                  <div className="score-breakdown">
                    <div className="breakdown-row">
                      <span>Cúp đạt được:</span>
                      <span>{completionData.score}</span>
                    </div>
                    <div className="breakdown-divider"></div>
                    <div className="breakdown-row total">
                      <span>Cần đạt:</span>
                      <span>{completionData.requiredScore}</span>
                    </div>
                  </div>
                ) : (
                  <div className="score-breakdown success">
                    {completionData.breakdown && (
                      <>
                        <div className="breakdown-row">
                          <span>Cúp màn chơi:</span>
                          <span>{completionData.breakdown.baseScore}</span>
                        </div>
                        {completionData.breakdown.timeBonus > 0 && (
                          <div className="breakdown-row bonus">
                            <span>Thưởng tốc độ:</span>
                            <span>+{completionData.breakdown.timeBonus}</span>
                          </div>
                        )}
                        <div className="breakdown-divider"></div>
                      </>
                    )}
                    <div className="breakdown-row total">
                      <span>Tổng cúp:</span>
                      <span>{completionData.score}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Rewards or Status */}
              <div className="completion-section">
                {completionData.rewards ? (
                  <div className="rewards-summary">
                    <Title level={4}>Phần thưởng nhận được:</Title>
                    <div className="rewards-grid">
                      <div className="reward-item">
                        <span className="reward-icon">🪙</span>
                        <span className="reward-value coins">+{completionData.rewards.coins} Xu</span>
                      </div>
                      <div className="reward-item">
                        <span className="reward-icon">🌸</span>
                        <span className="reward-value">+{completionData.rewards.petals} Cánh Sen</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rewards-summary info-only">
                    <Title level={4} style={{ color: "#faad14" }}>
                      🔄 Chế độ ôn tập
                    </Title>
                    <Paragraph style={{ fontSize: 16, marginBottom: 0 }}>
                      Bạn đã hoàn thành màn chơi này rồi! <br /> Lần chơi này không nhận thêm phần thưởng.
                    </Paragraph>
                  </div>
                )}
              </div>
            </div>

            <div className="completion-footer">
              <Button
                variant="primary"
                buttonSize="large"
                className="completion-btn-primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/game/chapters")}
              >
                Quay về Sảnh
              </Button>
              <Button
                variant="outline"
                buttonSize="large"
                className="completion-btn-outline"
                icon={<RedoOutlined />}
                onClick={handleReplay}
              >
                Chơi Lại
              </Button>
              {(completionData.newTotals || completionData.passed || completionData.isCompleted) && (
                <Button
                  variant="primary"
                  buttonSize="large"
                  className="next-level-btn completion-btn-primary"
                  onClick={() => {
                    playClick();
                    const chapterId = levelInfo?.chapterId || 1;
                    navigate(`/game/chapters/${chapterId}/levels`);
                  }}
                >
                  Về Bản đồ
                </Button>
              )}
            </div>
          </div>
        </Card >
      </div >
    );
  };

  // Render Active Game Content
  const renderGameContent = () => {
    return (
      <div className="game-container">
        <div className="game-overlay-ui">
          <div className="header-left">
            <Button
              variant="outline"
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                playClick();
                Modal.confirm({
                  title: "Thoát màn chơi?",
                  content: "Tiến độ hiện tại của bạn sẽ bị mất.",
                  okText: "Thoát",
                  cancelText: "Ở lại",
                  onOk: () => navigate("/game/chapters"),
                });
              }}
              className="back-button game-action-btn"
              title="Thoát màn chơi"
            />
          </div>

          <div className="header-center">
            <div className="status-pill">
              <div className="title-section">
                <Title level={5} style={{ margin: 0, color: "white" }}>
                  {levelInfo?.name}
                </Title>
              </div>

              <div className="status-divider"></div>

              <div className="stats-section">
                <Progress
                  percent={Math.round(((progress.completed + 0.2) / (progress.total || 1)) * 100)}
                  size="small"
                  status="active"
                  strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                  showInfo={false}
                  style={{ width: 100 }}
                />

                <div className="score-display">
                  <span className="current-score">Cúp: {score}</span>
                  {currentScreen?.potentialScore && !currentScreen.isCompleted && (
                    <span className="potential-score" title="Cúp có thể đạt được">
                      (+{currentScreen.potentialScore})
                    </span>
                  )}
                  {pointsGained && <div className="score-gained-popup">+{pointsGained}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="header-right">
            <AudioSettingsPopover>
              <Button
                variant="outline"
                className="game-action-btn"
                icon={
                  isMuted ? (
                    <MutedOutlined />
                  ) : (
                    <SoundOutlined />
                  )
                }
                title="Âm thanh"
              />
            </AudioSettingsPopover>

            <Button
              variant="outline"
              className="game-action-btn"
              style={{ marginLeft: 8 }}
              icon={<CommentOutlined />}
              title="AI Chat"
              onClick={() => {
                playClick();
                dispatch(setActiveContext({ levelId: levelInfo?.id }));
                dispatch(setOverlayOpen({ open: true, mode: "absolute" }));
              }}
            />
          </div>
        </div>

        <div className="game-viewport">{renderScreen()}</div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading && !currentScreen && !gameCompleted) {
      return (
        <div className="game-loading">
          <Spin size="large" tip="Đang tải dữ liệu game..." />
        </div>
      );
    }
    if (gameCompleted && completionData) {
      return renderCompletion();
    }
    return renderGameContent();
  };

  return (
    <div className={`gameplay-page ${isFullscreen ? "fullscreen-mode" : ""}`}>
      {renderContent()}

      <Button
        variant="outline"
        icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        onClick={() => { playClick(); setIsFullscreen(!isFullscreen); }}
        className="fullscreen-button game-action-btn"
        title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
      />

      <AIChat open={isChatOpen} onClose={() => dispatch(setOverlayOpen(false))} position="absolute" />
    </div>
  );
};

export default GamePlayPage;
