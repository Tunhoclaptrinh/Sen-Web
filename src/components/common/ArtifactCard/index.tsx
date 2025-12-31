import React from 'react';
import { Card, Tag, Typography, Tooltip } from 'antd';
import { EyeOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Meta } = Card;
const { Text } = Typography;

interface ArtifactCardProps {
    artifact: {
        id: number | string;
        name: string;
        images?: string[];
        dynasty?: string;
        rarity?: string;
        category?: string;
    };
    actions?: React.ReactNode[];
}

const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, actions }) => {
    const imageUrl = artifact.images && artifact.images.length > 0 ? artifact.images[0] : 'https://via.placeholder.com/300x200?text=No+Image';

    const getRarityColor = (rarity?: string) => {
        switch (rarity?.toLowerCase()) {
            case 'legendary': return 'gold';
            case 'epic': return 'purple';
            case 'rare': return 'blue';
            default: return 'default';
        }
    };

    return (
        <Card
            hoverable
            cover={
                <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                    <img
                        alt={artifact.name}
                        src={imageUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    {artifact.rarity && (
                        <Tag
                            color={getRarityColor(artifact.rarity)}
                            style={{ position: 'absolute', top: 10, right: 10, zIndex: 1, margin: 0 }}
                        >
                            {artifact.rarity.toUpperCase()}
                        </Tag>
                    )}
                </div>
            }
            actions={actions || [
                <Tooltip title="Xem chi tiết" key="view">
                    <Link to={`/artifacts/${artifact.id}`}>
                        <EyeOutlined key="view" />
                    </Link>
                </Tooltip>,
                <Tooltip title="Yêu thích" key="favorite">
                    <HeartOutlined key="favorite" />
                </Tooltip>,
                <Tooltip title="Chia sẻ" key="share">
                    <ShareAltOutlined key="share" />
                </Tooltip>,
            ]}
            style={{ borderRadius: 12, overflow: 'hidden', height: '100%' }}
        >
            <Meta
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{artifact.name}</span>
                    </div>
                }
                description={
                    <div>
                        {artifact.dynasty && <Tag color="geekblue">{artifact.dynasty}</Tag>}
                        {artifact.category && <Text type="secondary" style={{ fontSize: 12 }}>{artifact.category}</Text>}
                    </div>
                }
            />
        </Card>
    );
};

export default ArtifactCard;
