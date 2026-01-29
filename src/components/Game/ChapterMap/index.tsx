import React, { useMemo } from "react";
import { Popover } from "antd";
import { CheckOutlined, LockFilled, StarFilled } from "@ant-design/icons";
import { Level } from "@/types";
import bronze_drum from "@/assets/images/background/bronze-drum.png";
import LevelDetailCard from "./LevelDetailCard";

const MAP_CONFIG = {
  CONTAINER_WIDTH: 380,
  ITEM_SIZE: 75,
  VERTICAL_SPACING: 200,
  AMPLITUDE: 80,
  FREQUENCY: 1.5,
};

interface ChapterMapProps {
    levels: Level[];
    currentActiveLevelId?: string | number;
    onLevelClick: (level: Level) => void;
    showDetailCards?: boolean;
}

const ChapterMap: React.FC<ChapterMapProps> = ({ 
    levels, 
    currentActiveLevelId, 
    onLevelClick, 
    showDetailCards = true 
}) => {
    
  // --- CORE LOGIC: ABSOLUTE COORDINATE CALCULATION ---
  const levelsWithPos = useMemo(() => {
    if (!levels) return [];
    const centerX = MAP_CONFIG.CONTAINER_WIDTH / 2;

    return levels.map((level, index) => {
      // Offset from center (-80 to +80) creating natural curve
      const xOffset =
        Math.sin(index / MAP_CONFIG.FREQUENCY) * MAP_CONFIG.AMPLITUDE;

      return {
        ...level,
        // Absolute coordinates in 380px frame
        x: centerX + xOffset,
        y: index * MAP_CONFIG.VERTICAL_SPACING + 180, // Padding top
      };
    });
  }, [levels]);

  if (!levels || levels.length === 0) return <div>No levels</div>;

  const mapHeight = levels.length * MAP_CONFIG.VERTICAL_SPACING + 200;
  const numDrums = Math.max(1, Math.floor(mapHeight / 400));

  return (
      <div className="map-scroll-area" style={{position: 'relative', width: '100%', display: 'flex', justifyContent: 'center'}}>
        {/* LAYER 0: BRONZE DRUM PATTERN */}
        <div className="repeating-drums-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: mapHeight, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
             {Array.from({ length: numDrums }).map((_, i) => {
                 const isLeft = i % 2 === 0;
                 return (
                    <div 
                        key={`drum-${i}`} 
                        className="scrolling-drum"
                        style={{ 
                            position: 'absolute',
                            top: 200 + (i * 400),
                            left: isLeft ? '-250px' : 'auto', 
                            right: !isLeft ? '-250px' : 'auto',
                            transform: 'translateY(-50%)',
                            width: '800px',
                            opacity: 0.12
                        }}
                    >
                        <img 
                            src={bronze_drum} 
                            alt="" 
                            style={{ width: '100%', animation: 'drumRotate 60s linear infinite' }} 
                        />
                    </div>
                 );
             })}
        </div>

        <div
          className="map-content"
          style={{ height: mapHeight, width: MAP_CONFIG.CONTAINER_WIDTH, position: 'relative', zIndex: 1 }}
        >
          {/* LAYER 1: CURVED CONNECTOR (SVG) */}
          <svg className="connector-svg" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
            {levelsWithPos.map((level, index) => {
              if (index === levelsWithPos.length - 1) return null;
              const nextLevel = levelsWithPos[index + 1];

              const startX = level.x;
              const startY = level.y + MAP_CONFIG.ITEM_SIZE / 2;
              const endX = nextLevel.x;
              const endY = nextLevel.y - MAP_CONFIG.ITEM_SIZE / 2;

              const controlY1 = startY + 50;
              const controlY2 = endY - 50;

              return (
                <path
                  key={`path-${level.id}`}
                  d={`M ${startX} ${level.y} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${nextLevel.y}`}
                  stroke={nextLevel.is_locked ? "#e5e5e5" : "#1f5f25"}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  className="path-line"
                  strokeDasharray={nextLevel.is_locked ? "10 10" : "0"}
                />
              );
            })}
          </svg>

          {/* LAYER 2: LEVEL NODES */}
          {levelsWithPos.map((level, index) => {
            const isCurrent = level.id === currentActiveLevelId;
            const popoverProps = showDetailCards ? { open: true } : {};

            return (
              <div
                key={level.id}
                className={`level-node-wrapper ${level.is_locked ? "locked" : ""} ${isCurrent ? "current" : ""} ${level.is_completed ? "completed" : ""}`}
                style={{ left: level.x, top: level.y, position: 'absolute', transform: 'translate(-50%, -50%)' }}
                onClick={() => onLevelClick(level)}
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
                      onPlay={() => onLevelClick(level)} 
                      side={index % 2 === 0 ? "right" : "left"}
                    />
                  }
                  trigger="hover"
                  placement={index % 2 === 0 ? "right" : "left"}
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
  );
};

export default ChapterMap;
