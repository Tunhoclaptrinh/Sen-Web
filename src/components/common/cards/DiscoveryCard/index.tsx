import React from 'react';
import { Typography } from 'antd';
import {
    StarFilled,
    CommentOutlined,
    ArrowRightOutlined,
    CalendarOutlined,
    UserOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './styles.less';

const { Paragraph } = Typography;

interface DiscoveryCardProps {
    data: any; // Using any for flexibility or shared interface
    type: 'artifact' | 'heritage';
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ data, type }) => {
    const navigate = useNavigate();

    if (!data) return null;

    const handleNavigate = () => {
        const path = type === 'artifact' 
            ? `/artifacts/${data.id}` 
            : `/heritage-sites/${data.id}`;
        navigate(path);
    };

    const imageUrl = data.main_image || data.image || (data.images && data.images[0]) || 'https://via.placeholder.com/1200x600';
    
    return (
        <div className="discovery-card-wrapper">
            <div className="image-wrapper">
                <img src={imageUrl} alt={data.name} />
            </div>

            <div className="info-card">
                <div className="card-content-top">
                    <div className="card-meta">
                        {type === 'artifact' ? (
                            <>
                                <span className="meta-item">
                                    <CalendarOutlined /> {data.year_created || 'N/A'}
                                </span>
                                <span className="meta-item">
                                    <UserOutlined /> {data.dynasty || 'Unknown Dynasty'}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="meta-item">
                                    <CalendarOutlined /> {data.publishDate ? new Date(data.publishDate).toLocaleDateString() : 'N/A'}
                                </span>
                                <span className="meta-item">
                                    <UserOutlined /> {data.author || 'Admin'}
                                </span>
                                <span className="meta-item">
                                    <CommentOutlined /> {data.commentCount || 0}
                                </span>
                                <span className="meta-item">
                                    <EnvironmentOutlined /> {data.address || data.region}
                                </span>
                                <span className="meta-item">
                                    <StarFilled style={{ color: '#faad14' }} /> {data.rating ? data.rating.toFixed(1) : 'N/A'}
                                </span>
                            </>
                        )}
                    </div>

                    <h3 className="card-title">{data.name}</h3>
                    
                    <Paragraph className="card-desc" ellipsis={{ rows: 3 }}>
                        {data.shortDescription || data.description?.replace(/<[^>]+>/g, '') || "Chưa có mô tả ngắn."}
                    </Paragraph>
                </div>

                <button className="action-btn" onClick={handleNavigate}>
                    {type === 'artifact' ? 'Xem chi tiết hiện vật' : 'Khám phá di sản'} <ArrowRightOutlined />
                </button>
            </div>
        </div>
    );
};

export default DiscoveryCard;
