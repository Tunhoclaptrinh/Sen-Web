import React from "react";
import {Button} from "antd";
import {PlayCircleOutlined, ArrowRightOutlined} from "@ant-design/icons";
import type {Screen} from "@/types/game.types";
import "./styles.less";
import {getImageUrl} from "@/utils/image.helper";
import {getYouTubeEmbedUrl} from "@/utils/youtube.helper";

// const { Title, Paragraph } = Typography; // Unused

interface Props {
  data: Screen & {
    content?: {
      title?: string;
      description?: string;
      videoUrl: string;
    };
  };
  onNext: () => void;
  loading?: boolean;
}

const VideoScreen: React.FC<Props> = ({data, onNext, loading}) => {
  const content = data.content || {};
  const videoUrl = (data as any).videoUrl || content.videoUrl || content.contentUrl || "";
  const title = (data as any).caption || content.title || "Video";
  const description =
    (data as any).description || content.description || "Xem đoạn phim này để hiểu rõ hơn về câu chuyện.";

  return (
    <div className="video-screen">
      <div className="cinema-bg" />

      <div className="theater-container">
        {/* Video Content - Main Stage */}
        <div className="video-frame">
          {videoUrl ? (
            (() => {
              const url = videoUrl.trim();
              // Case 1: Raw Iframe Embed Code
              if (url.startsWith("<iframe")) {
                return <div className="raw-embed-container" dangerouslySetInnerHTML={{__html: url}} />;
              }

              // Resolve full URL for local files
              let embedUrl = getImageUrl(url);

              // Standard URL - Convert YouTube if needed using helper
              const youtubeEmbed = getYouTubeEmbedUrl(url);
              if (youtubeEmbed) {
                embedUrl = youtubeEmbed;
              }

              return (
                <iframe
                  src={embedUrl}
                  title="Video Content"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              );
            })()
          ) : (
            <div style={{textAlign: "center", color: "rgba(255,255,255,0.5)"}}>
              <PlayCircleOutlined style={{fontSize: 48, marginBottom: 16, display: "block"}} />
              <span>Không có video</span>
            </div>
          )}
        </div>

        {/* Info & Navigation - Bottom Overlay matching Dialogue Style */}
        <div className="video-info-overlay">
          <div className="info-text">
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          <Button
            type="primary"
            className="continue-btn"
            onClick={onNext}
            icon={<ArrowRightOutlined />}
            disabled={loading}
          >
            Tiếp tục
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoScreen;
