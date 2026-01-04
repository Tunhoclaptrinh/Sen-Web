import React from 'react';
import { Card, Button, Typography } from 'antd';
import { PlayCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { Screen } from '@/types/game.types';

const { Title, Paragraph } = Typography;

interface Props {
    data: Screen & {
        content?: {
            title?: string;
            description?: string;
            video_url: string;
        }
    };
    onNext: () => void;
}

const VideoScreen: React.FC<Props> = ({ data, onNext }) => {
    return (
        <div className="video-screen" style={{ height: '100%', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <Card
                style={{ maxWidth: 900, width: '100%', background: 'rgba(255,255,255,0.9)' }}
                className="video-card"
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: 8, overflow: 'hidden' }}>
                        {data.content?.video_url ? (
                            <iframe
                                src={data.content.video_url}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                title="Video Content"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <PlayCircleOutlined style={{ fontSize: 48 }} />
                                <span style={{ marginLeft: 12 }}>Video Placeholder</span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 24 }}>
                        <Title level={3}>{data.content?.title || "Video giới thiệu"}</Title>
                        <Paragraph>
                            {data.content?.description || "Xem video để tìm hiểu thêm..."}
                        </Paragraph>
                    </div>

                    <div style={{ marginTop: 32 }}>
                        <Button type="primary" size="large" onClick={onNext} icon={<ArrowRightOutlined />}>
                            Tiếp tục hành trình
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default VideoScreen;
