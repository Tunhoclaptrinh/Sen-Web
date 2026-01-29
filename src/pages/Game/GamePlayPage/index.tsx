import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Typography,
  Spin,
  Modal,
  message,
  Progress,
} from "antd";
import {
  ArrowLeftOutlined,
  TrophyTwoTone,
  RedoOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  SoundOutlined,
  MutedOutlined,
} from "@ant-design/icons";
import gameService from "@/services/game.service";
import type { Screen, Level } from "@/types/game.types";
import { SCREEN_TYPES } from "@/types/game.types";
import { getImageUrl } from "@/utils/image.helper";

// Screens
import DialogueScreen from "@/components/Game/Screens/DialogueScreen";
import QuizScreen from "@/components/Game/Screens/QuizScreen";
import HiddenObjectScreen from "@/components/Game/Screens/HiddenObjectScreen";
import TimelineScreen from "@/components/Game/Screens/TimelineScreen";
import ImageViewerScreen from "@/components/Game/Screens/ImageViewerScreen";
import VideoScreen from "@/components/Game/Screens/VideoScreen";
import AudioSettingsPopover from "@/components/Game/AudioSettingsPopover";

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
  const [isMuted, setIsMuted] = useState(false);
  const bgmAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const [pointsGained, setPointsGained] = useState<number | null>(null);
  
  // Audio State
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [sfxVolume, setSfxVolume] = useState(1.0);

  useEffect(() => {
    if (levelId) {
      initGame(parseInt(levelId));
    }
    return () => {
        // Cleanup BGM
        if (bgmAudioRef.current) {
            bgmAudioRef.current.pause();
            bgmAudioRef.current = null;
        }
    };
  }, [levelId]);

  // Handle BGM Playback
  useEffect(() => {
      if (!levelInfo?.background_music) return;

      const bgmUrl = getImageUrl(levelInfo.background_music);
      
      if (!bgmAudioRef.current) {
          bgmAudioRef.current = new Audio(bgmUrl);
          bgmAudioRef.current.loop = true;
      } else if (bgmAudioRef.current.src !== bgmUrl) {
          bgmAudioRef.current.src = bgmUrl;
      }

      // Update volume
      bgmAudioRef.current.volume = bgmVolume;

      const isVideoScreen = currentScreen?.type === SCREEN_TYPES.VIDEO;

      if (isMuted || isVideoScreen) {
          bgmAudioRef.current.pause();
      } else {
          // Play only if game is not loading and not completed
          if (!loading && !gameCompleted) {
              const playPromise = bgmAudioRef.current.play();
              if (playPromise !== undefined) {
                  playPromise.catch(error => {
                      console.warn("Autoplay prevented:", error);
                      // Interaction needed mainly
                  });
              }
          } else {
               bgmAudioRef.current.pause();
          }
      }
  }, [levelInfo?.background_music, isMuted, bgmVolume, loading, gameCompleted, currentScreen?.type]);

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

    try {
      setLoading(true);
      const response = await gameService.navigateToNextScreen(sessionId);

      if (response.level_finished) {
        await handleFinishLevel();
        return;
      }

      setCurrentScreen(response.current_screen);
      setProgress({
        completed: response.progress.completed_screens,
        total: response.progress.total_screens,
      });
      
      // ⚡ Animation
      if (response.points_earned && response.points_earned > 0) {
          const points = response.points_earned;
          setScore(prev => prev + points);
          triggerScoreAnimation(points);
      }

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
            fallbackImage={levelInfo?.thumbnail}
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
            fallbackImage={levelInfo?.thumbnail}
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
          <div className="custom-completion-layout">
            <div className="completion-header">
               <TrophyTwoTone twoToneColor="#faad14" style={{ fontSize: 80 }} />
               <Title level={2} className="completion-title">
                  {completionData.passed === false ? "RẤT TIẾC!" : "HOÀN THÀNH MÀN CHƠI!"}
               </Title>
               <Paragraph className="completion-subtitle">
                  {completionData.passed === false 
                    ? `Bạn chưa đủ điểm qua màn. Hãy thử lại nhé!` 
                    : `Bạn đã xuất sắc vượt qua màn chơi này với số điểm: ${completionData.score}`}
               </Paragraph>
            </div>

            <div className="completion-body-row">
               {/* LEFT: Score Breakdown */}
               <div className="completion-section">
                  {completionData.passed === false ? (
                    <div className="score-breakdown">
                         <div className="breakdown-row">
                              <span>Điểm đạt được:</span>
                              <span>{completionData.score}</span>
                          </div>
                          <div className="breakdown-divider"></div>
                          <div className="breakdown-row total">
                              <span>Cần đạt:</span>
                              <span>{completionData.required_score}</span>
                          </div>
                    </div>
                  ) : (
                    <div className="score-breakdown success">
                        {completionData.breakdown && (
                           <>
                            <div className="breakdown-row">
                                <span>Điểm màn chơi:</span>
                                <span>{completionData.breakdown.base_score}</span>
                            </div>
                            {completionData.breakdown.time_bonus > 0 && (
                                <div className="breakdown-row bonus">
                                    <span>Thưởng tốc độ:</span>
                                    <span>+{completionData.breakdown.time_bonus}</span>
                                </div>
                            )}
                            <div className="breakdown-divider"></div>
                           </>
                        )}
                        <div className="breakdown-row total">
                            <span>Tổng điểm:</span>
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
                            <span className="reward-value coins">
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
                  ) : (
                    <div className="rewards-summary info-only">
                        <Title level={4} style={{ color: "#faad14" }}>
                          🔄 Chế độ ôn tập
                        </Title>
                        <Paragraph style={{ fontSize: 16, marginBottom: 0 }}>
                          Bạn đã hoàn thành màn chơi này rồi! <br/> Lần chơi này không nhận thêm phần thưởng.
                        </Paragraph>
                    </div>
                  )}
               </div>
            </div>

            <div className="completion-footer">
               <Button
                 type="primary"
                 key="console"
                 size="large"
                 icon={<ArrowLeftOutlined />}
                 onClick={() => navigate("/game/chapters")}
               >
                 Quay về Sảnh
               </Button>
               <Button
                 key="buy"
                 size="large"
                 icon={<RedoOutlined />}
                 onClick={() => window.location.reload()}
               >
                 Chơi Lại
               </Button>
               {(completionData.new_totals || completionData.passed || completionData.is_completed) && (
                   <Button
                     type="primary"
                     key="next"
                     size="large"
                     className="next-level-btn"
                     onClick={() => {
                         const chapterId = levelInfo?.chapter_id || 1;
                         navigate(`/game/chapters/${chapterId}/levels`);
                     }}
                   >
                     Về Bản đồ
                   </Button>
               )}
            </div>
          </div>
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

          <div className="score-display">
            <span className="current-score">Điểm: {score}</span>
            {currentScreen?.potential_score && !currentScreen.is_completed && (
                <span className="potential-score" title="Điểm có thể đạt được">
                    (+{currentScreen.potential_score})
                </span>
            )}
            {pointsGained && (
                <div className="score-gained-popup">+{pointsGained}</div>
            )}
          </div>
        </div>

        <div className="game-viewport">{renderScreen()}</div>

        <AudioSettingsPopover
            isMuted={isMuted}
            onMuteToggle={setIsMuted}
            bgmVolume={bgmVolume}
            onBgmVolumeChange={setBgmVolume}
            sfxVolume={sfxVolume}
            onSfxVolumeChange={setSfxVolume}
        >
            <Button
              icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
              className="sound-button"
              size="large"
              title="Cài đặt âm thanh"
              style={{ position: 'absolute', bottom: 20, right: 80, zIndex: 100 }}
            />
        </AudioSettingsPopover>

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
