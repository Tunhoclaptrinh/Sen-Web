import React from "react";
import { Card, Button, Typography } from "antd";
import { PlayCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import type { Screen } from "@/types/game.types";

const { Title, Paragraph } = Typography;

interface Props {
  data: Screen & {
    content?: {
      title?: string;
      description?: string;
      video_url: string;
    };
  };
  onNext: () => void;
}

const VideoScreen: React.FC<Props> = ({ data, onNext }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        gap: 20,
      }}
    >
      {/* Video Container - Căn giữa như ImageViewer */}
      {data.content?.video_url ? (
        <div
          style={{
            width: "100%",
            maxWidth: 850,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              position: "relative",
              paddingTop: "48%", // Chiều cao vừa phải
              background: "#000",
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <iframe
              src={data.content.video_url}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              title="Video Content"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div style={{ color: "white", textAlign: "center" }}>
          <PlayCircleOutlined style={{ fontSize: 64, marginBottom: 16 }} />
          <Paragraph style={{ color: "rgba(255,255,255,0.65)" }}>
            Không có video
          </Paragraph>
        </div>
      )}

      {/* Dialogue Card - Ở dưới */}
      <Card
        style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}
        bodyStyle={{ padding: 32, textAlign: "center" }}
      >
        {data.content?.title && (
          <Title level={3} style={{ marginBottom: 12 }}>
            {data.content.title}
          </Title>
        )}
        <Paragraph style={{ fontSize: 16, marginBottom: 24, lineHeight: 1.6 }}>
          {data.content?.description || "Xem video để tìm hiểu thêm về di sản văn hóa."}
        </Paragraph>

        <Button
          type="primary"
          size="large"
          icon={<ArrowRightOutlined />}
          onClick={onNext}
        >
          Tiếp tục hành trình
        </Button>
      </Card>
    </div>
  );
};

export default VideoScreen;
