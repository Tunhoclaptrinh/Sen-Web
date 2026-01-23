import React from "react";
import { Button, Typography } from "antd";
import { CaretRightFilled } from "@ant-design/icons";
import type { Level } from "@/types";
import "./styles.less";

interface LevelDetailCardProps {
  level: Level;
  onPlay: () => void;
}

const LevelDetailCard: React.FC<LevelDetailCardProps> = ({ level, onPlay }) => {
  const { name, thumbnail, is_locked } = level;

  const [imageError, setImageError] = React.useState(false);

  // Fallback placeholder logic
  const renderThumbnail = () => {
    // Check for thumbnail, or potentially other image fields from API that might not be in strict type yet
    const imgSrc = thumbnail || (level as any).image || (level as any).background_image;
    
    if (imgSrc && !imageError) {
      return (
        <img 
          src={imgSrc} 
          alt={name} 
          className="level-thumbnail" 
          onError={() => setImageError(true)} 
        />
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
