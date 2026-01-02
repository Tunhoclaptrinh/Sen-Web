import React from 'react';
import { Card, Tag, Typography, Tooltip } from 'antd';
import { EyeOutlined, HeartOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import "./styles.less";

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
            className="artifact-card"
            cover={
                <div className="artifact-card__cover">
                    <img
                        alt={artifact.name}
                        src={imageUrl}
                    />
                    {artifact.rarity && (
                        <Tag
                            color={getRarityColor(artifact.rarity)}
                            className="artifact-card__rarity-tag"
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
        >
            <Meta
                title={
                    <div className="artifact-meta__title">
                        <span>{artifact.name}</span>
                    </div>
                }
                description={
                    <div>
                        {artifact.dynasty && <Tag color="geekblue">{artifact.dynasty}</Tag>}
                        {artifact.category && <Text type="secondary" className="artifact-meta__category">{artifact.category}</Text>}
                    </div>
                }
            />
        </Card>
    );
};

export default ArtifactCard;
