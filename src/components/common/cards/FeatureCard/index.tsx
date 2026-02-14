import React from "react";
import {Link} from "react-router-dom";
import {Tag, Tooltip} from "antd";
import {StarFilled} from "@ant-design/icons";
import {resolveImage, getImageUrl} from "@/utils/image.helper";
import {HERITAGE_TYPE_LABELS, ARTIFACT_TYPE_LABELS} from "@/config/constants";
import {FeatureCardProps} from "./types";
import "./styles.less";

const FeatureCard: React.FC<FeatureCardProps> = ({data, cardType = "heritage", variant = "landscape"}) => {
  const linkPath = cardType === "heritage" ? `/heritage-sites/${data.id}` : `/artifacts/${data.id}`;

  const rawImage = resolveImage(data.image) || resolveImage(data.mainImage) || resolveImage(data.images);
  const imageUrl = getImageUrl(rawImage, "https://via.placeholder.com/300x400?text=No+Image");

  return (
    <Link to={linkPath} style={{display: "block", height: "100%"}}>
      <div className={`feature-card ${variant} ${cardType}`}>
        {/* Cover Image Area */}
        <div className="card-cover">
          <div
            className="card-image-bg"
            style={{
              backgroundImage: `url(${imageUrl})`,
            }}
          />

          {/* Top Overlay: UNESCO Badge (Heritage only) */}
          <div className="overlay-badges">
            {data.unescoListed && (
              <Tag color="gold" className="unesco-tag">
                UNESCO
              </Tag>
            )}
          </div>

          {/* Bottom Overlay: Type & Rating */}
          <div className="card-info-overlay">
            <Tag className="type-tag">
              {cardType === "heritage"
                ? HERITAGE_TYPE_LABELS[data.type as keyof typeof HERITAGE_TYPE_LABELS] ||
                  (data.type === "heritage" ? "Di sản" : data.type) ||
                  "Di sản"
                : ARTIFACT_TYPE_LABELS[data.type as keyof typeof ARTIFACT_TYPE_LABELS] ||
                  (data.type === "artifact" ? "Hiện vật" : data.type) ||
                  "Hiện vật"}
            </Tag>

            {data.rating && (
              <div className="card-rating">
                <StarFilled style={{color: "#faad14"}} />
                <span className="rating-value">{data.rating.toFixed(1)}</span>
                <span className="rating-count">({data.totalReviews || 0})</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="card-content">
          <div className="content-main">
            <Tooltip title={data.name} placement="top">
              <h3 className="card-title">{data.name}</h3>
            </Tooltip>

            {data.description && variant !== "portrait" && (
              <p className="card-desc-excerpt">
                {data.description.length > 80 ? `${data.description.slice(0, 80)}...` : data.description}
              </p>
            )}
          </div>

          {/* Structured Metadata List */}
          <div className="metadata-list">
            {cardType === "heritage" ? (
              data.region && (
                <div className="meta-item">
                  <span className="meta-label">Vùng miền:</span>
                  <span className="meta-value">{data.region}</span>
                </div>
              )
            ) : (
              <>
                {(data.locationInSite || data.currentLocation) && (
                  <div className="meta-item">
                    <span className="meta-label">Nơi lưu giữ:</span>
                    <span className="meta-value">{data.locationInSite || data.currentLocation}</span>
                  </div>
                )}
                {(data.dynasty || data.yearCreated) && (
                  <div className="meta-item">
                    <span className="meta-label">Niên đại:</span>
                    <span className="meta-value">{data.dynasty || data.yearCreated}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="card-action-hint">
            <span>Chi tiết</span>
            <span className="hint-arrow">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;
