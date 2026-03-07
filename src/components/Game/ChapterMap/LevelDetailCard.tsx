import React from "react";
import { Button, Typography } from "antd";
import { CaretRightFilled } from "@ant-design/icons";
import type { Level } from "@/types";
import { useTranslation } from "react-i18next";
// We need to ensure styles are imported. Since we are moving this to components, 
// strictly speaking it should validly import its styles. 
// However, the original file imported "./styles.less". 
// If we are in components/Game/ChapterMap, we probably want to use the same styles or a copy.
// The styles.less is in pages/Game/LevelsPage/styles.less.
// Let's change the import to point to that for now to avoid duplication, or rely on global styles if loaded.
// But to be safe and "correct", let's import the specific less file from the page location
import "@/pages/Game/LevelsPage/styles.less"; 

interface LevelDetailCardProps {
  level: Level;
  onPlay: () => void;
  side: 'left' | 'right';
}

const LevelDetailCard: React.FC<LevelDetailCardProps> = ({ level, onPlay, side }) => {
  const { t } = useTranslation();
  const { name, thumbnail, isLocked } = level;

  const [imageError, setImageError] = React.useState(false);

  // Fallback placeholder logic
  const renderThumbnail = () => {
    // Check for thumbnail, or potentially other image fields from API that might not be in strict type yet
    const imgSrc = thumbnail || (level as any).image;
    
    if (imgSrc && !imageError) {
      return (
        <div className="level-image-wrapper">
            {/* Ambient Backdrop Layer */}
            <img 
              src={imgSrc} 
              alt="" 
              className="level-thumbnail-backdrop" 
            />
            {/* Main Image Layer */}
            <img 
              src={imgSrc} 
              alt={name} 
              className="level-thumbnail-main" 
              onError={() => setImageError(true)} 
            />
        </div>
      );
    }
    
    return (
      <div className="level-thumbnail-placeholder">
        <Typography.Text type="secondary" style={{ color: '#7F6262', opacity: 0.5, fontWeight: 'bold' }}>
           NO IMAGE
        </Typography.Text>
      </div>
    );
  };

  return (
    <div className="level-detail-card">
      {/* Custom Big Arrow */}
      <div className={`custom-card-arrow ${side}`} />

      {/* Header: Level Name */}
      <div className="card-header">
        <Typography.Text className="level-name-header" ellipsis={{ tooltip: name }}>
          {name}
        </Typography.Text>
      </div>

      {/* Body: Thumbnail */}
      <div className="card-content">
        <div className="thumbnail-container">
            {renderThumbnail()}
        </div>

        {level.isCompleted && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 3,
              background: "rgba(255, 249, 230, 0.92)",
              border: "1px solid rgba(180, 145, 100, 0.45)",
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            <Typography.Text style={{ fontSize: 12, fontWeight: 700, color: "#8b1d1d" }}>
              {t("gameLevels.card.reviewProgress", {
                current: level.reviewCount ?? 0,
                total: level.maxReviewRewards ?? 3,
              })}
            </Typography.Text>
          </div>
        )}
        
        {/* Play Button */}
        <Button 
            type="primary" 
            shape="circle" 
            icon={<CaretRightFilled />} 
            size="large"
            onClick={onPlay}
            disabled={isLocked}
            className="play-button-fab"
        />
      </div>
    </div>
  );
};

export default LevelDetailCard;
