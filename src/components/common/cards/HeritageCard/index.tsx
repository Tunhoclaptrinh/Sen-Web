// Removed unused imports
import React from "react"; 
import { Tag, Tooltip } from "antd"; 
import {
  EnvironmentOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./styles.less";
import { HeritageCardProps } from "./types";

const HeritageCard: React.FC<HeritageCardProps> = ({
  site,
  variant = 'landscape',
}) => { 

  return (
    <Link to={`/heritage-sites/${site.id}`} style={{ display: 'block', height: '100%' }}>
      <div className={`heritage-card ${variant}`}>
        {/* Cover Image Area */}
        <div className="card-cover">
            <div 
              className="card-image-bg"
              style={{ 
                backgroundImage: `url(${site.image || "https://via.placeholder.com/300x400?text=No+Image"})` 
              }}
            />

            {/* Top Overlay: UNESCO Badge */}
            <div className="overlay-badges">
              {site.unesco_listed && (
                <Tag color="gold" className="unesco-tag">
                  UNESCO
                </Tag>
              )}
            </div>
            
            {/* Bottom Overlay: Type & Rating */}
            <div className="card-info-overlay">
                <Tag color="blue" className="type-tag">{site.type}</Tag>
                
                {site.rating && (
                  <div className="card-rating">
                    <StarFilled style={{ color: "#faad14" }} />
                    <span className="rating-value">
                      {site.rating.toFixed(1)}
                    </span>
                    <span className="rating-count">
                      ({site.total_reviews || 0})
                    </span>
                  </div>
                )}
            </div>
        </div>

        {/* Content Area */}
        <div className="card-content">
          {/* Title */}
          <Tooltip title={site.name} placement="topLeft">
             <h3 className="card-title">{site.name}</h3>
          </Tooltip>

          {/* Location */}
          <div className="card-location">
            <EnvironmentOutlined style={{ color: "#F43F5E" }} />
            <span>{site.region}</span>
          </div>

          {/* Description */}
          <p className="card-description">{site.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default HeritageCard;
