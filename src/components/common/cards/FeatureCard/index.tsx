import React from "react"; 
import { Tag, Tooltip } from "antd"; 
import {
  EnvironmentOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./styles.less";
import { FeatureCardProps } from "./types";
import { HERITAGE_TYPE_LABELS, ARTIFACT_TYPE_LABELS } from "@/config/constants";
import { getImageUrl, resolveImage } from "@/utils/image.helper";

const FeatureCard: React.FC<FeatureCardProps> = ({
  data,
  cardType = 'heritage',
  variant = 'landscape',
}) => { 
  const linkPath = cardType === 'heritage' 
      ? `/heritage-sites/${data.id}` 
      : `/artifacts/${data.id}`;

  const rawImage = resolveImage(data.image) || resolveImage(data.mainImage) || resolveImage(data.images);
  const imageUrl = getImageUrl(rawImage, "https://via.placeholder.com/300x400?text=No+Image");
  const subtitle = cardType === 'heritage' ? data.region : data.dynasty;

  return (
    <Link to={linkPath} style={{ display: 'block', height: '100%' }}>
      <div className={`feature-card ${variant} ${cardType}`}>
        {/* Cover Image Area */}
        <div className="card-cover">
            <div 
              className="card-image-bg"
              style={{ 
                backgroundImage: `url(${imageUrl})` 
              }}
            />

            {/* Top Overlay: UNESCO Badge (Heritage only) */}
            {data.unescoListed && (
                <div className="overlay-badges">
                  <Tag color="gold" className="unesco-tag">
                      UNESCO
                  </Tag>
                </div>
            )}
            
            {/* Bottom Overlay: Type & Rating */}
            <div className="card-info-overlay">
                <Tag className="type-tag">
                  {cardType === 'heritage' 
                    ? HERITAGE_TYPE_LABELS[data.type as keyof typeof HERITAGE_TYPE_LABELS] || (data.type === 'heritage' ? 'Di sản' : data.type) || 'Di sản'
                    : ARTIFACT_TYPE_LABELS[data.type as keyof typeof ARTIFACT_TYPE_LABELS] || (data.type === 'artifact' ? 'Hiện vật' : data.type) || 'Hiện vật'}
                </Tag>
                
                {data.rating && (
                  <div className="card-rating">
                    <StarFilled style={{ color: "#faad14" }} />
                    <span className="rating-value">
                      {data.rating.toFixed(1)}
                    </span>
                    <span className="rating-count">
                      ({data.totalReviews || 0})
                    </span>
                  </div>
                )}
            </div>
        </div>

        {/* Content Area */}
        <div className="card-content">
          {/* Title */}
          <Tooltip title={data.name} placement="top">
             <h3 className="card-title">{data.name}</h3>
          </Tooltip>

          {/* Subtitle: Region or Dynasty */}
          {subtitle && (
            <div className="card-location">
                {cardType === 'heritage' && <EnvironmentOutlined style={{ color: "var(--primary-color)" }} />}
                <span>{subtitle}</span>
            </div>
          )}

          {/* Description (Hidden relative to CSS but kept in DOM if needed later) */}
          <p className="card-description">{data.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;
