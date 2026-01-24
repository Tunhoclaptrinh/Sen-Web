import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchLevelsByChapter,
  setCurrentLevel,
} from "@/store/slices/gameSlice";
import { Button, Spin, Typography, Progress, Popover, Switch, Tooltip } from "antd";
import { CheckOutlined, LockFilled, StarFilled, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import type { Level } from "@/types";
import LevelDetailCard from "./LevelDetailCard";
import "./styles.less";

const { Title } = Typography;

// CẤU HÌNH BẢN ĐỒ
const MAP_CONFIG = {
  CONTAINER_WIDTH: 380, // Chiều rộng cố định của bản đồ để dễ căn SVG
  ITEM_SIZE: 75, // Nút to hơn
  VERTICAL_SPACING: 200, // Khoảng cách đủ rộng cho card
  AMPLITUDE: 80, // Độ rộng uốn lượn tự nhiên
  FREQUENCY: 1.5, // Tần số sóng
};

const LevelsPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { levels, levelsLoading, currentChapter } = useAppSelector(
    (state) => state.game,
  );
  
  // Controls validity of card "Always On" mode
  const [showDetailCards, setShowDetailCards] = React.useState(false);

  useEffect(() => {
    if (chapterId) {
      dispatch(fetchLevelsByChapter(Number(chapterId)));
    }
  }, [dispatch, chapterId, levels?.length, currentChapter?.id]); // Refetch if chapter mismatches or initially

  // ✅ Force refetch when progress changes (level completed)
  const { progress } = useAppSelector((state) => state.game); // Needs to be destructured from state.game
  
  useEffect(() => {
    if (chapterId) {
       dispatch(fetchLevelsByChapter(Number(chapterId)));
    }
  }, [dispatch, chapterId, progress?.completed_levels]); // Re-run when completion status changes

  // --- CORE LOGIC: TÍNH TOÁN TOẠ ĐỘ TUYỆT ĐỐI (PIXEL) ---
  const levelsWithPos = useMemo(() => {
    if (!levels) return [];
    const centerX = MAP_CONFIG.CONTAINER_WIDTH / 2;

    return levels.map((level, index) => {
      // Offset từ tâm (-80 đến +80) tạo đường cong tự nhiên
      const xOffset =
        Math.sin(index / MAP_CONFIG.FREQUENCY) * MAP_CONFIG.AMPLITUDE;

      return {
        ...level,
        // Toạ độ tuyệt đối trong khung 380px
        x: centerX + xOffset,
        y: index * MAP_CONFIG.VERTICAL_SPACING + 180, // Padding top
      };
    });
  }, [levels]);

  const handleStartLevel = (level: Level) => {
    if (!level.is_locked) {
      dispatch(setCurrentLevel(level));
      navigate(`/game/play/${level.id}`);
    }
  };

  const currentActiveLevelId = levels?.find(
    (l) => !l.is_completed && !l.is_locked,
  )?.id;

  if (levelsLoading)
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  if (!levels || levels.length === 0) return null;

  const mapHeight = levels.length * MAP_CONFIG.VERTICAL_SPACING + 200;

  return (
    <div className="levels-page-container">
      {/* HEADER */}
      <div className="fixed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left: Back Button */}
        <Button
          type="link"
          icon={<span>←</span>}
          onClick={() => navigate("/game/chapters")}
        >
          Trở về
        </Button>

        {/* Center: Chapter Info (Absolute centering might be better, but flex works if sides are balanced. Let's try simple flex for now) */}
        {currentChapter && (
           <div className="chapter-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0 }}>
              {currentChapter.name}
            </Title>
            <Progress
              percent={currentChapter.completion_rate}
              showInfo={false}
              strokeColor="#1f5f25"
              trailColor="#e5e5e5"
              size="small"
              style={{ width: 100 }}
            />
          </div>
        )}

        {/* Right: Toggle Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <Typography.Text style={{ fontSize: 12 }}>Chi tiết</Typography.Text>
           <Tooltip title="Bấm vào đây để thêm thẻ màn chơi"><Switch 
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
              checked={showDetailCards}
              onChange={(checked) => setShowDetailCards(checked)}
           /></Tooltip>
        </div>
      </div>

      {/* MAP AREA */}
      <div className="map-scroll-area">
        <div
          className="map-content"
          style={{ height: mapHeight, width: MAP_CONFIG.CONTAINER_WIDTH }}
        >
          {/* LỚP 1: ĐƯỜNG CONG (SVG BEZIER CURVE) */}
          <svg className="connector-svg">
            {levelsWithPos.map((level, index) => {
              if (index === levelsWithPos.length - 1) return null;
              const nextLevel = levelsWithPos[index + 1];

              // Logic Bezier Curve: M(start) C(control1) (control2) (end)
              const startX = level.x;
              const startY = level.y + MAP_CONFIG.ITEM_SIZE / 2; // Nối từ tâm dưới nút trên
              const endX = nextLevel.x;
              const endY = nextLevel.y - MAP_CONFIG.ITEM_SIZE / 2; // Đến tâm trên nút dưới (để ẩn dây sau nút)

              const controlY1 = startY + 50; // Điểm uốn 1 đi xuống
              const controlY2 = endY - 50; // Điểm uốn 2 đi lên

              return (
                <path
                  key={`path-${level.id}`}
                  d={`M ${startX} ${level.y} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${nextLevel.y}`}
                  stroke={nextLevel.is_locked ? "#e5e5e5" : "#1f5f25"}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  className="path-line"
                  // Vẽ nét đứt nếu bị khóa
                  strokeDasharray={nextLevel.is_locked ? "10 10" : "0"}
                />
              );
            })}
          </svg>

          {/* LỚP 2: CÁC NÚT LEVEL (HTML) */}
          {levelsWithPos.map((level, index) => {
            const isCurrent = level.id === currentActiveLevelId;
            // Spread props conditionally
            const popoverProps = showDetailCards ? { open: true } : {};

            return (
              <div
                key={level.id}
                className={`level-node-wrapper ${level.is_locked ? "locked" : ""} ${isCurrent ? "current" : ""} ${level.is_completed ? "completed" : ""}`}
                style={{ left: level.x, top: level.y }}
                onClick={() => handleStartLevel(level)}
              >
                {/* Tooltip START */}
                {isCurrent && (
                  <div className="start-tooltip">
                    BẮT ĐẦU
                    <div className="tooltip-arrow" />
                  </div>
                )}

                <Popover
                  content={
                    <LevelDetailCard 
                      level={level} 
                      onPlay={() => handleStartLevel(level)} 
                      side={index % 2 === 0 ? "right" : "left"}
                    />
                  }
                  trigger="hover"
                  // Force alternating sides (So le): Right -> Left -> Right...
                  placement={index % 2 === 0 ? "right" : "left"}
                  // Offset popup xa hơn (50px)
                  align={{
                    offset: index % 2 === 0 ? [50, 0] : [-50, 0]
                  }}
                  autoAdjustOverflow={false}
                  rootClassName="transparent-popover"
                  zIndex={900}
                  getPopupContainer={(trigger) => trigger.parentElement || document.body}
                  {...popoverProps}
                >
                  <div className="level-circle">
                    {level.is_locked ? (
                      <LockFilled className="icon-locked" />
                    ) : level.is_completed ? (
                      <CheckOutlined className="icon-completed" />
                    ) : (
                      <StarFilled className="icon-active" />
                    )}

                    {/* Hiệu ứng bóng sáng trên nút (Highlight) */}
                    <div className="shine-effect"></div>
                  </div>
                </Popover>

                {/* Stars / Score */}
                {level.is_completed &&
                  level.player_best_score !== undefined && (
                    <div className="level-stars-container">
                      {[1, 2, 3].map((i) => (
                        <StarFilled
                          key={i}
                          style={{
                            color:
                              i <=
                              ((level.player_best_score ?? 0) > 80
                                ? 3
                                : (level.player_best_score ?? 0) > 50
                                  ? 2
                                  : 1)
                                ? "#ffd700"
                                : "#e0e0e0",
                            fontSize: 10,
                          }}
                        />
                      ))}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelsPage;
