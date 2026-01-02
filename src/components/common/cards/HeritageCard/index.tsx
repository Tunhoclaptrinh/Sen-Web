import React, { useState } from "react";
import { Card, Tag, Button, Tooltip, Image } from "antd";
import {
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  EnvironmentOutlined,
  StarFilled,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./styles.less";
import { HeritageCardProps } from "./types";

const HeritageCard: React.FC<HeritageCardProps> = ({
  site,
  onFavoriteToggle,
  isFavorite = false,
  loading = false,
}) => {
  const [localFavorite, setLocalFavorite] = useState(isFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !localFavorite;
    setLocalFavorite(newState);
    onFavoriteToggle?.(site.id, newState);
  };

  return (
    <Link to={`/heritage-sites/${site.id}`}>
      <Card
        hoverable
        loading={loading}
        className="heritage-card"
        cover={
          <div className="card-cover">
            <Image
              src={
                site.image ||
                "https://via.placeholder.com/300x200?text=No+Image"
              }
              alt={site.name}
              preview={false}
              className="card-image"
              fallback="https://via.placeholder.com/300x200?text=No+Image"
            />

            {/* Overlay Badges */}
            <div className="overlay-badges">
              {site.unesco_listed && (
                <Tag color="gold" className="unesco-tag">
                  UNESCO
                </Tag>
              )}
            </div>

            {/* Favorite Button */}
            <Tooltip
              title={
                localFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"
              }
            >
              <Button
                type="text"
                shape="circle"
                icon={
                  localFavorite ? (
                    <HeartFilled style={{ color: "#ff4d4f" }} />
                  ) : (
                    <HeartOutlined />
                  )
                }
                onClick={handleFavoriteClick}
                className="favorite-button"
              />
            </Tooltip>
          </div>
        }
      >
        <div className="card-content">
          {/* Title */}
          <h3 className="card-title">{site.name}</h3>

          {/* Location */}
          <div className="card-location">
            <EnvironmentOutlined style={{ color: "#F43F5E" }} />
            <span>{site.region}</span>
          </div>

          {/* Rating */}
          {site.rating && (
            <div className="card-rating">
              <StarFilled style={{ color: "#faad14" }} />
              <span className="rating-value">
                {site.rating.toFixed(1)}
              </span>
              <span className="rating-count">
                ({site.total_reviews || 0} đánh giá)
              </span>
            </div>
          )}

          {/* Description */}
          <p className="card-description">{site.description}</p>

          {/* Footer */}
          <div className="card-footer">
            <Tag color="blue">{site.type}</Tag>
            <Button type="link" size="small" icon={<EyeOutlined />}>
              Chi tiết
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default HeritageCard;
