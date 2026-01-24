import React from "react";
import { Button, Image } from "antd";
import { ArrowRightOutlined, EyeOutlined } from "@ant-design/icons";
import type { Screen } from "@/types/game.types";

interface Props {
  data: Screen & {
    content?: {
      title?: string;
      description?: string;
      image_url?: string;
    };
  };
  onNext: () => void;
}

const ImageViewerScreen: React.FC<Props> = ({ data, onNext }) => {
  const imageUrl = data.content?.image_url || data.background_image;
  const title = data.content?.title || "Hình ảnh chi tiết";
  const description =
    data.content?.description ||
    "Khám phá hình ảnh này để tìm hiểu thêm về di sản văn hóa Việt Nam.";

  return (
    <div className="image-viewer-screen">
      <div 
        className="game-background" 
        style={{ 
            backgroundImage: `url("${data.background_image || imageUrl || 'https://via.placeholder.com/1920x1080'}")` 
        }} 
      />

      <div className="viewer-container">
        <div className="image-card">
          <div className="image-display-area">
             {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={title}
                    preview={{
                        mask: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <EyeOutlined />
                                <span>Phóng to</span>
                            </div>
                        )
                    }}
                />
             ) : (
                 <div style={{ color: '#8c8c8c' }}>Không có hình ảnh</div>
             )}
          </div>

          <div className="viewer-info">
            <div className="info-content">
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={onNext}
            >
              Tiếp tục
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewerScreen;
