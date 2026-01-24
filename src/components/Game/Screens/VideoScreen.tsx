import React from "react";
import { Button } from "antd";
import { PlayCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import type { Screen } from "@/types/game.types";
import "./styles.less";

// const { Title, Paragraph } = Typography; // Unused

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
    <div className="video-screen">
      <div className="cinema-bg" />
      
      <div className="theater-container">
        {/* Video Content - Main Stage */}
        <div className="video-frame">
          {data.content?.video_url ? (
             <iframe
               src={data.content.video_url}
               title="Video Content"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
             />
          ) : (
             <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                <PlayCircleOutlined style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
                <span>Không có video</span>
             </div>
          )}
        </div>

        {/* Info & Navigation - Bottom Overlay matching Dialogue Style */}
        <div className="video-info-overlay">
            <div className="info-text">
                <h2>{data.content?.title || "Video"}</h2>
                <p>{data.content?.description || "Xem đoạn phim này để hiểu rõ hơn về câu chuyện."}</p>
            </div>
            
            <Button 
                type="primary" 
                className="continue-btn"
                onClick={onNext}
                icon={<ArrowRightOutlined />}
            >
                Tiếp tục
            </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoScreen;
