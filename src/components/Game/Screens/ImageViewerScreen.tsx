import React from "react";
import { Card, Button, Typography, Image } from "antd";
import { ArrowRightOutlined, EyeOutlined } from "@ant-design/icons";
import type { Screen } from "@/types/game.types";

const { Paragraph } = Typography;

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
  const description =
    data.content?.description ||
    "Khám phá hình ảnh này để tìm hiểu thêm về di sản văn hóa Việt Nam.";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      {imageUrl && (
        <div style={{ 
          textAlign: 'center',
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Image
            src={imageUrl}
            alt="Heritage"
            preview={{
              mask: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <EyeOutlined />
                  <span>Xem trước</span>
                </div>
              ),
            }}
            style={{
              maxWidth: "85%",
              maxHeight: "70vh",
              objectFit: "contain",
              borderRadius: 8,
              cursor: 'pointer',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>
      )}

      <Card
        style={{ width: "100%", maxWidth: 900 }}
        bodyStyle={{ padding: 24 }}
      >
        <div>
          <Paragraph style={{ fontSize: 16, marginBottom: 16 }}>
            {description}
          </Paragraph>
        </div>

        <div style={{ textAlign: "right" }}>
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={onNext}
          >
            Tiếp tục
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ImageViewerScreen;
