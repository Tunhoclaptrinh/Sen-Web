import React from "react";
import { Button, Typography } from "antd";
import { CaretRightFilled } from "@ant-design/icons";
import type { Level } from "@/types";
import "./styles.less";

interface LevelDetailCardProps {
  level: Level;
  onPlay: () => void;
  side: 'left' | 'right';
}

const LevelDetailCard: React.FC<LevelDetailCardProps> = ({ level, onPlay, side }) => {
  const { name, thumbnail, is_locked } = level;

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
        
        {/* Play Button */}
        <Button 
            type="primary" 
            shape="circle" 
            icon={<CaretRightFilled />} 
            size="large"
            onClick={onPlay}
            disabled={is_locked}
            className="play-button-fab"
        />
      </div>
    </div>
  );
};

export default LevelDetailCard;
