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
import dayjs from 'dayjs';
import './styles.less';

const { Paragraph } = Typography;

interface DiscoveryCardProps {
    data: any; // Using any for flexibility or shared interface
    type: 'artifact' | 'heritage' | 'history';
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ data, type }) => {
    const navigate = useNavigate();

    if (!data) return null;

    const handleNavigate = () => {
        let path = '';
        if (type === 'artifact') path = `/artifacts/${data.id}`;
        else if (type === 'heritage') path = `/heritage-sites/${data.id}`;
        else if (type === 'history') path = `/history/${data.id}`;
        
        navigate(path);
    };

    const rawImage = data.main_image || data.image || (data.images && data.images[0]);
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const apiHost = apiBase.replace(/\/api$/, '');
    const imageUrl = rawImage 
        ? (rawImage.startsWith('http') ? rawImage : `${apiHost}${rawImage}`)
        : 'https://via.placeholder.com/1200x600';
    
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
                                    <CalendarOutlined /> {dayjs(data.publishDate || data.created_at || data.createdAt).format('DD/MM/YYYY')}
                                </span>
                                <span className="meta-item">
                                    <UserOutlined /> {data.author_name || data.author || 'Hệ thống'}
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
                        {data.short_description || data.shortDescription || data.description?.replace(/<[^>]+>/g, '') || "Chưa có mô tả ngắn."}
                    </Paragraph>
                </div>

                <button className="action-btn" onClick={handleNavigate}>
                    {type === 'artifact' ? 'Xem chi tiết hiện vật' : 
                     type === 'history' ? 'Đọc bài viết' :
                     'Khám phá di sản'} <ArrowRightOutlined />
                </button>
            </div>
        </div>
    );
};

export default DiscoveryCard;
