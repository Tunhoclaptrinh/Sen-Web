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
import styles from "./HeritageCard.module.css";

interface HeritageSite {
  id: number;
  name: string;
  description: string;
  image?: string;
  region: string;
  type: string;
  rating?: number;
  total_reviews?: number;
  unesco_listed?: boolean;
}

interface HeritageCardProps {
  site: HeritageSite;
  onFavoriteToggle?: (id: number, isFavorite: boolean) => void;
  isFavorite?: boolean;
  loading?: boolean;
}

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
        className={styles.heritageCard}
        cover={
          <div className={styles.cardCover}>
            <Image
              src={
                site.image ||
                "https://via.placeholder.com/300x200?text=No+Image"
              }
              alt={site.name}
              preview={false}
              className={styles.cardImage}
              fallback="https://via.placeholder.com/300x200?text=No+Image"
            />

            {/* Overlay Badges */}
            <div className={styles.overlayBadges}>
              {site.unesco_listed && (
                <Tag color="gold" className={styles.unescoTag}>
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
                className={styles.favoriteButton}
              />
            </Tooltip>
          </div>
        }
      >
        <div className={styles.cardContent}>
          {/* Title */}
          <h3 className={styles.cardTitle}>{site.name}</h3>

          {/* Location */}
          <div className={styles.cardLocation}>
            <EnvironmentOutlined style={{ color: "#d4a574" }} />
            <span>{site.region}</span>
          </div>

          {/* Rating */}
          {site.rating && (
            <div className={styles.cardRating}>
              <StarFilled style={{ color: "#faad14" }} />
              <span className={styles.ratingValue}>
                {site.rating.toFixed(1)}
              </span>
              <span className={styles.ratingCount}>
                ({site.total_reviews || 0} đánh giá)
              </span>
            </div>
          )}

          {/* Description */}
          <p className={styles.cardDescription}>{site.description}</p>

          {/* Footer */}
          <div className={styles.cardFooter}>
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
