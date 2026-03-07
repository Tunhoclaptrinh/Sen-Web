import React from "react";
import { Link } from "react-router-dom";
import { Tag, Tooltip } from "antd";
import { StarFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { resolveImage, getImageUrl } from "@/utils/image.helper";
import { ITEM_TYPES } from "@/config/constants";
import { FeatureCardProps } from "./types";
import "./styles.less";

const FeatureCard: React.FC<FeatureCardProps> = ({ data, cardType = ITEM_TYPES.HERITAGE, variant = "landscape" }) => {
  const { t } = useTranslation();
  const linkPath = cardType === ITEM_TYPES.HERITAGE ? `/heritage-sites/${data.id}` : `/artifacts/${data.id}`;

  const rawImage = resolveImage(data.image) || resolveImage(data.mainImage) || resolveImage(data.images);
  const imageUrl = getImageUrl(rawImage, "https://via.placeholder.com/300x400?text=No+Image");

  return (
    <Link to={linkPath} style={{ display: "block", height: "100%" }}>
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
              {cardType === ITEM_TYPES.HERITAGE
                ? t(`common.heritageTypes.${data.type}`, { defaultValue: t("common.heritage") })
                : t(`common.artifactTypes.${data.type}`, { defaultValue: t("common.artifact") })}
            </Tag>

            {data.rating && (
              <div className="card-rating">
                <StarFilled style={{ color: "#faad14" }} />
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
            {cardType === ITEM_TYPES.HERITAGE ? (
              data.region && (
                <div className="meta-item">
                  <span className="meta-label">{t('common.metadata.region')}</span>
                  <span className="meta-value">{data.region}</span>
                </div>
              )
            ) : (
              <>
                {(data.locationInSite || data.currentLocation) && (
                  <div className="meta-item">
                    <span className="meta-label">{t('common.metadata.storage')}</span>
                    <span className="meta-value">{data.locationInSite || data.currentLocation}</span>
                  </div>
                )}
                {(data.dynasty || data.yearCreated) && (
                  <div className="meta-item">
                    <span className="meta-label">{t('common.metadata.age')}</span>
                    <span className="meta-value">{data.dynasty || data.yearCreated}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="card-action-hint">
            <span>{t('common.details')}</span>
            <span className="hint-arrow">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;
