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
  const content = data.content || {};
  const videoUrl = (data as any).video_url || content.video_url || "";
  const title = (data as any).caption || content.title || "Video";
  const description = (data as any).description || content.description || "Xem đoạn phim này để hiểu rõ hơn về câu chuyện.";

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
                 if (url.startsWith('<iframe')) {
                     return (
                         <div 
                            className="raw-embed-container"
                            dangerouslySetInnerHTML={{ __html: url }} 
                         />
                     );
                 }
                 
                 // Case 2: Standard URL - Convert YouTube if needed
                 let embedUrl = url;
                 if (url.includes('youtube.com/watch?v=')) {
                     const videoId = url.split('v=')[1]?.split('&')[0];
                     if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                 } else if (url.includes('youtu.be/')) {
                     const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                     if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
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
             <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                <PlayCircleOutlined style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
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
            >
                Tiếp tục
            </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoScreen;
