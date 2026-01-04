import React from 'react';
import { Card, Button, Image, Typography } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import type { Screen } from '@/types/game.types';

const { Title, Paragraph } = Typography;

interface Props {
    data: Screen & {
        content?: {
            title?: string;
            description?: string;
            image_url: string;
        }
    };
    onNext: () => void;
}

const ImageViewerScreen: React.FC<Props> = ({ data, onNext }) => {
    return (
        <div className="image-viewer-screen" style={{ height: '100%', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <Card
                style={{ maxWidth: 900, width: '100%', background: 'rgba(255,255,255,0.9)' }}
                className="viewer-card"
            >
                <div style={{ textAlign: 'center' }}>
                    <Image
                        src={data.content?.image_url || data.background_image}
                        alt="Artifact"
                        style={{ maxHeight: 500, objectFit: 'contain', borderRadius: 8 }}
                    />

                    <div style={{ marginTop: 24 }}>
                        <Title level={3}>{data.content?.title || "Hình ảnh di sản"}</Title>
                        <Paragraph>
                            {data.content?.description || "Chi tiết về hình ảnh này..."}
                        </Paragraph>
                    </div>

                    <div style={{ marginTop: 32 }}>
                        <Button type="primary" size="large" onClick={onNext} icon={<ArrowRightOutlined />}>
                            Tiếp tục
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ImageViewerScreen;
