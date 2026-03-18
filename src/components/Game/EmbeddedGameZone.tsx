import React, { useEffect, useState } from "react";
import { Card, Button, Spin, message, Typography, Space, Popover, Slider } from "antd";
import {
  CloseOutlined,
  ArrowRightOutlined,
  TrophyTwoTone,
  RedoOutlined,
  RocketOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  PlayCircleOutlined,
  CheckCircleFilled,
  StarFilled,
  SoundOutlined,
  MutedOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import gameService from "@/services/game.service";
import { SCREEN_TYPES } from "@/types/game.types";
import type { Screen, Level } from "@/types/game.types";
import { getImageUrl } from "@/utils/image.helper";
import { useAppDispatch } from "@/store/hooks";
import { fetchChapters, fetchProgress, syncProgressTotals } from "@/store/slices/gameSlice";
import { setBgmVolume, toggleMute, setEmbeddedZoneActive } from "@/store/slices/audioSlice";

// Screens
import DialogueScreen from "@/components/Game/Screens/DialogueScreen";
import QuizScreen from "@/components/Game/Screens/QuizScreen";
import HiddenObjectScreen from "@/components/Game/Screens/HiddenObjectScreen";
import TimelineScreen from "@/components/Game/Screens/TimelineScreen";
import ImageViewerScreen from "@/components/Game/Screens/ImageViewerScreen";
import VideoScreen from "@/components/Game/Screens/VideoScreen";

import { createPortal } from "react-dom";
import { useGlobalCharacter } from "@/contexts/GlobalCharacterContext";
import "./EmbeddedGameZone.less";

const { Title, Text, Paragraph } = Typography;

enum GAME_STATE {
  START = "START",
  PLAYING = "PLAYING",
  COMPLETED = "COMPLETED",
}

interface EmbeddedGameZoneProps {
  levelId: string | number;
  onClose: () => void;
  onNavigateToFullGame?: () => void;
}

const EmbeddedGameZone: React.FC<EmbeddedGameZoneProps> = ({
  levelId,
  onClose,
  onNavigateToFullGame,
}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<GAME_STATE>(GAME_STATE.START);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [levelInfo, setLevelInfo] = useState<Level | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [completionData, setCompletionData] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const globalChar = useGlobalCharacter();
  const dispatch = useAppDispatch();

  // BGM Logic for Embedded Zone
  const { isMuted, bgmVolume, isBgmAutoMuted } = useSelector((state: RootState) => state.audio);
  const bgmRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const isPlaying = gameState === GAME_STATE.PLAYING && !!levelInfo?.backgroundMusic;

    if (isPlaying) {
      const bgmUrl = getImageUrl(levelInfo!.backgroundMusic!);

      // 1. Manage Audio Instance (Source & Loop)
      if (!bgmRef.current || bgmRef.current.src !== new URL(bgmUrl, window.location.origin).href) {
        if (bgmRef.current) bgmRef.current.pause();
        bgmRef.current = new Audio(bgmUrl);
        bgmRef.current.loop = true;
      }

      // 2. Sync Volume (Gentle sync)
      const targetVolume = (isMuted || isBgmAutoMuted) ? 0 : bgmVolume;
      if (bgmRef.current.volume !== targetVolume) {
        bgmRef.current.volume = targetVolume;
      }

      // 3. Manage Playback State (Only call play/pause if state changes)
      if (targetVolume > 0 && bgmRef.current.paused) {
        bgmRef.current.play().catch(e => console.warn("Embed BGM failed to play:", e));
      } else if (targetVolume === 0 && !bgmRef.current.paused) {
        bgmRef.current.pause();
      }
    } else {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    }

    return () => {
      // Logic moved to the unmount-only useEffect below to avoid glitches during volume changes
    };
  }, [gameState, levelInfo?.backgroundMusic, isMuted, bgmVolume, isBgmAutoMuted]);

  // Once-only cleanup for component unmount
  useEffect(() => {
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  // Sync Global Character visibility with fullscreen
  useEffect(() => {
    if (isFullscreen) {
      globalChar?.setIsVisible(false);
    } else {
      globalChar?.setIsVisible(true);
    }
  }, [isFullscreen, globalChar]);

  // Handle body scroll locking
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      globalChar?.setIsVisible(true);
    };
  }, [globalChar]);

  // Track global active status
  useEffect(() => {
    dispatch(setEmbeddedZoneActive(true));
    return () => {
      dispatch(setEmbeddedZoneActive(false));
    };
  }, [dispatch]);

  useEffect(() => {
    if (levelId) {
      loadLevelInfo(Number(levelId));
    }
  }, [levelId]);

  const loadLevelInfo = async (id: number) => {
    try {
      setLoading(true);
      const data = await gameService.getLevelDetail(id);
      if (data) {
        setLevelInfo(data);
        // Ensure we reset to START if a new level is loaded
        setGameState(GAME_STATE.START);
        setCurrentScreen(null);
      }
    } catch (error) {
      console.error("Failed to load level info", error);
    } finally {
      setLoading(false);
    }
  };

  const initGame = async () => {
    try {
      setLoading(true);
      const id = Number(levelId);
      const data = await gameService.startLevel(id);

      // Batch state updates
      setSessionId(data.sessionId);
      setCurrentScreen(data.currentScreen);
      setProgress({ completed: 0, total: data.level.totalScreens || 1 });
      setStartTime(Date.now());
      setScore(0);
      setGameState(GAME_STATE.PLAYING);
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

  const handleAnswerSubmit = async (answerId: string | string[]) => {
    if (!sessionId) throw new Error("No session");
    const res = await gameService.submitAnswer(sessionId, answerId);
    if (res.isCorrect) {
      setScore((prev) => prev + (res.pointsEarned || 0));
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

      if (result.passed !== false) {
        if (result.newTotals) {
          dispatch(
            syncProgressTotals({
              points: result.newTotals.points,
              petals: result.newTotals.petals,
              coins: result.newTotals.coins,
            }),
          );
        }

        dispatch(fetchProgress());
        dispatch(fetchChapters());
      }

      setCompletionData(result);
      setGameState(GAME_STATE.COMPLETED);
    } catch (error) {
      console.error("Failed to finish level", error);
      setCompletionData({
        passed: true,
        score: score,
        rewards: { coins: 0, petals: 0 },
      });
      setGameState(GAME_STATE.COMPLETED);
    } finally {
      setLoading(false);
    }
  };

  const VolumeControl = () => (
    <Popover
      trigger="click"
      placement="bottomRight"
      overlayClassName="embedded-volume-popover"
      content={
        <div style={{ width: 150, padding: '8px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
            <Text strong style={{ fontSize: 12 }}>Âm lượng</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>{Math.round(bgmVolume * 100)}%</Text>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={bgmVolume}
            onChange={(v) => dispatch(setBgmVolume(v))}
            tooltip={{ open: false }}
          />
          <Button
            type="text"
            size="small"
            block
            icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
            onClick={() => dispatch(toggleMute())}
            style={{ marginTop: 8, fontSize: 12 }}
          >
            {isMuted ? "Bật âm" : "Tắt âm"}
          </Button>
        </div>
      }
    >
      <Button
        type="text"
        icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
        className="action-btn"
      />
    </Popover>
  );

  const renderScreen = () => {
    if (!currentScreen) return null;

    try {
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
    } catch (err) {
      console.error("Screen transition/render error:", err);
      return (
        <div className="screen-error-fallback">
          <Paragraph>Đã xảy ra lỗi khi hiển thị thử thách này.</Paragraph>
          <Button icon={<RedoOutlined />} onClick={loadLevelInfo.bind(null, Number(levelId))}>
            Tải lại màn chơi
          </Button>
        </div>
      );
    }
  };

  const gameContent = (
    <div className={`embedded-game-wrapper ${isFullscreen ? "fullscreen-mode" : ""}`}>
      <Card
        className={`embedded-game-container ${gameState}`}
        title={
          <div className="game-header-glass">
            <div className="level-info-mini">
              <RocketOutlined className="header-icon" />
              <div className="text-info">
                <span className="name">{levelInfo?.name || "Game Zone"}</span>
                {gameState === GAME_STATE.PLAYING && (
                  <span className="steps">Thử thách {progress.completed + 1}/{progress.total}</span>
                )}
              </div>
            </div>
            <div className="game-actions">
              {gameState === GAME_STATE.PLAYING && (
                <div className="score-pill">
                  <StarFilled style={{ color: "#faad14" }} />
                  <span>{score}</span>
                </div>
              )}
              <Button
                type="text"
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="action-btn"
              />
              <VolumeControl />
              {onNavigateToFullGame && (
                <Button
                  type="text"
                  icon={<RocketOutlined />}
                  onClick={onNavigateToFullGame}
                  className="action-btn"
                  title="Vào không gian game"
                />
              )}
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={onClose}
                className="action-btn close"
              />
            </div>
          </div>
        }
      >
        {gameState === GAME_STATE.PLAYING && (
          <div className="modern-progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(progress.total > 0 ? (progress.completed / progress.total) : 0) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        <div className="game-viewport">
          <AnimatePresence>
            {gameState === GAME_STATE.START && (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="screen-transition-wrapper"
              >
                <StartScreen
                  levelInfo={levelInfo}
                  onStart={initGame}
                  loading={loading}
                  onNavigateToFullGame={onNavigateToFullGame}
                />
              </motion.div>
            )}

            {gameState === GAME_STATE.PLAYING && (
              <motion.div
                key={`playing-${currentScreen?.id || "loading"}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="screen-transition-wrapper"
              >
                {renderScreen() || (
                  <div className="game-screen-loading">
                    <Spin size="large" tip="Đang khởi tạo thử thách..." />
                  </div>
                )}
              </motion.div>
            )}

            {gameState === GAME_STATE.COMPLETED && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="screen-transition-wrapper"
              >
                <CompletionView
                  completionData={completionData}
                  score={score}
                  startTime={startTime}
                  onRetry={initGame}
                  onClose={onClose}
                  onNavigateToFullGame={onNavigateToFullGame}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {loading && gameState === GAME_STATE.PLAYING && (
            <div className="game-spinner-overlay">
              <Spin size="large" tip="Đang tải..." />
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  if (isFullscreen) {
    return createPortal(gameContent, document.body);
  }

  return gameContent;
};

// --- Sub-components (Moved outside to prevent re-mounting) ---

interface StartScreenProps {
  levelInfo: Level | null;
  onStart: () => void;
  loading: boolean;
  onNavigateToFullGame?: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ levelInfo, onStart, loading, onNavigateToFullGame }) => (
  <div className="game-start-screen">
    <div
      className="start-bg"
      style={{ backgroundImage: `url(${getImageUrl(levelInfo?.thumbnail)})` }}
    />
    <div className="start-overlay" />
    <motion.div
      className="start-content"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="level-badge">LEVEL {levelInfo?.order || 1}</div>
      <Title level={2} className="level-name">
        {levelInfo?.name || (loading ? "Đang tải bài học..." : "Không có thông tin")}
      </Title>
      <Paragraph className="level-desc">
        {levelInfo?.description || "Hãy cùng khám phá những kiến thức di sản thú vị qua các thử thách tương tác!"}
      </Paragraph>
      <div className="level-meta">
        <Space size="large">
          <div className="meta-item">
            <StarFilled style={{ color: "#faad14" }} />
            <span>{levelInfo?.difficulty || "Dễ"}</span>
          </div>
          <div className="meta-item">
            <RocketOutlined style={{ color: "var(--primary-color)" }} />
            <span>{levelInfo?.totalScreens || 5} Thử thách</span>
          </div>
        </Space>
      </div>
      <div className="completion-actions">
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={onStart}
          loading={loading}
          className="start-btn-large seal-button"
        >
          BẮT ĐẦU NGAY
        </Button>

        {onNavigateToFullGame && (
          <Button
            type="default"
            size="large"
            icon={<RocketOutlined />}
            onClick={onNavigateToFullGame}
            className="game-space-btn"
          >
            VÀO KHÔNG GIAN GAME
          </Button>
        )}
      </div>
    </motion.div>
  </div>
);

interface CompletionViewProps {
  completionData: any;
  score: number;
  startTime: number;
  onRetry: () => void;
  onClose: () => void;
  onNavigateToFullGame?: () => void;
}

const CompletionView: React.FC<CompletionViewProps> = ({
  completionData,
  score,
  startTime,
  onRetry,
  onClose,
  onNavigateToFullGame,
}) => (
  <div className="game-completion-screen">
    <div className="confetti-container" />
    <motion.div
      className="completion-card"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 15 }}
    >
      <div className="trophy-wrapper">
        <TrophyTwoTone twoToneColor="#faad14" className="big-trophy" />
        <motion.div
          className="glow-effect"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      <Title level={2}>{completionData?.passed ? "XUẤT SẮC!" : "HOÀN THÀNH!"}</Title>
      <Text className="completion-subtitle">Bạn đã chinh phục thử thách thành công</Text>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="label">CÚP ĐẠT ĐƯỢC</div>
          <div className="value">{score}</div>
        </div>
        <div className="stat-box">
          <div className="label">THỜI GIAN</div>
          <div className="value">{Math.floor((Date.now() - startTime) / 1000)}s</div>
        </div>
      </div>

      {completionData?.rewards && (completionData.rewards.coins > 0 || completionData.rewards.petals > 0) && (
        <div className="rewards-section">
          <div className="section-label">PHẦN THƯỞNG NHẬN ĐƯỢC</div>
          <div className="reward-badges">
            {completionData.rewards.coins > 0 && (
              <div className="reward-badge coin">
                <StarFilled style={{ color: "#faad14" }} /> {completionData.rewards.coins} Xu
              </div>
            )}
            {completionData.rewards.petals > 0 && (
              <div className="reward-badge petal">
                <CheckCircleFilled /> {completionData.rewards.petals} Cánh sen
              </div>
            )}
          </div>
        </div>
      )}

      <div className="completion-actions">
        <Button
          type="primary"
          icon={<RedoOutlined />}
          onClick={onRetry}
          className="seal-button"
        >
          CHƠI LẠI
        </Button>
        <Button icon={<CloseOutlined />} onClick={onClose}>
          ĐÓNG
        </Button>
      </div>

      {onNavigateToFullGame && (
        <div className="promo-footer">
          <Button type="link" onClick={onNavigateToFullGame}>
            Khám phá thêm trong không gian Game chính <ArrowRightOutlined />
          </Button>
        </div>
      )}
    </motion.div>
  </div>
);

export default EmbeddedGameZone;
