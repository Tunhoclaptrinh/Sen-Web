import React from "react";
import { Button, Image } from "antd";
import { ArrowRightOutlined, EyeOutlined } from "@ant-design/icons";
import type { Screen } from "@/types/game.types";
import { useTranslation } from "react-i18next";

import { getImageUrl } from "@/utils/image.helper";

interface Props {
  data: Screen & {
    content?: {
      title?: string;
      description?: string;
      imageUrl?: string;
    };
  };
  onNext: () => void;
  loading?: boolean;
}

const ImageViewerScreen: React.FC<Props> = ({ data, onNext, loading }) => {
  const { t } = useTranslation();
  // Support multiple data structures
  const content = data.content || {};

  const imageUrl = content.imageUrl || data.backgroundImage;
  const title = (data as any).caption || content.title || t('gamePlay.screens.imageViewer.fallbackTitle');
  const description =
    (data as any).description ||
    content.description ||
    t('gamePlay.screens.imageViewer.fallbackDescription');

  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="image-viewer-screen">
      <div
        className="game-background"
        style={{
          backgroundImage: `url("${getImageUrl(data.backgroundImage || imageUrl, "https://via.placeholder.com/1920x1080")}")`,
        }}
      />

      <div className="viewer-container">
        <div className="image-card">
          <div className="image-display-area">
            {imageUrl ? (
              <Image
                src={getImageUrl(imageUrl)}
                alt={title}
                preview={{
                  mask: (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <EyeOutlined />
                      <span>{t('gamePlay.common.zoomIn')}</span>
                    </div>
                  ),
                }}
              />
            ) : (
              <div style={{ color: "#8c8c8c" }}>{t('gamePlay.screens.imageViewer.noImage')}</div>
            )}
          </div>

          <div className="viewer-info">
            <div className="info-content">
              <h3>{title}</h3>
              <div className="description-container">
                <div className={`text-wrapper ${isExpanded ? "expanded" : ""}`}>
                  <p>{isExpanded || description.length <= 150 ? description : `${description.substring(0, 150)}...`}</p>
                </div>
                {description.length > 150 && (
                  <Button type="link" size="small" onClick={() => setIsExpanded(!isExpanded)} className="toggle-btn">
                    {isExpanded ? t('gamePlay.common.collapse') : t('gamePlay.common.expand')}
                  </Button>
                )}
              </div>
            </div>
            <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={onNext} disabled={loading}>
              {t('gamePlay.common.continue')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewerScreen;
