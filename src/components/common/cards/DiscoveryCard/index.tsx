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
    type: 'artifact' | 'heritage' | 'history' | 'exhibition';
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ data, type }) => {
    const navigate = useNavigate();

    if (!data) return null;

    const handleNavigate = () => {
        let path = '';
        if (type === 'artifact') path = `/artifacts/${data.id}`;
        else if (type === 'heritage') path = `/heritage-sites/${data.id}`;
        else if (type === 'history') path = `/history/${data.id}`;
        else if (type === 'exhibition') path = `/exhibitions/${data.id}`;
        
        navigate(path);
    };

    const rawImage = data.mainImage || data.image || (data.images && data.images[0]);
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const apiHost = apiBase.replace(/\/api$/, '');
    const imageUrl = rawImage 
        ? (rawImage.startsWith('http') || rawImage.startsWith('blob') ? rawImage : `${apiHost}${rawImage}`)
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
                                    <CalendarOutlined /> {data.yearCreated || 'N/A'}
                                </span>
                                <span className="meta-item">
                                    <UserOutlined /> {data.dynasty || 'Unknown Dynasty'}
                                </span>
                            </>
                        ) : type === 'exhibition' ? (
                            <>
                                <span className="meta-item">
                                    <CalendarOutlined /> {dayjs(data.startDate).format('DD/MM/YYYY')} - {dayjs(data.endDate).format('DD/MM/YYYY')}
                                </span>
                                {data.theme && (
                                    <span className="meta-item">
                                        <EnvironmentOutlined /> {data.theme}
                                    </span>
                                )}
                                {data.curator && (
                                    <span className="meta-item">
                                        <UserOutlined /> {data.curator}
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="meta-item">
                                    <CalendarOutlined /> {dayjs(data.publishDate || data.createdAt).format('DD/MM/YYYY')}
                                </span>
                                <span className="meta-item">
                                    <UserOutlined /> {data.authorName || data.author || 'Hệ thống'}
                                </span>
                                <span className="meta-item">
                                    <CommentOutlined /> {data.commentCount || 0}
                                </span>
                                {(data.address || data.region) && (
                                    <span className="meta-item">
                                        <EnvironmentOutlined /> {data.address || data.region}
                                    </span>
                                )}
                                {data.rating && (
                                    <span className="meta-item">
                                        <StarFilled style={{ color: '#faad14' }} /> {data.rating.toFixed(1)}
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    <h3 className="card-title">{data.name}</h3>
                    
                    <Paragraph className="card-desc" ellipsis={{ rows: 3 }}>
                        {data.shortDescription || data.description?.replace(/<[^>]+>/g, '') || "Chưa có mô tả ngắn."}
                    </Paragraph>
                </div>

                <button className="action-btn" onClick={handleNavigate}>
                    {type === 'artifact' ? 'Xem chi tiết hiện vật' : 
                     type === 'history' ? 'Đọc bài viết' :
                     type === 'exhibition' ? 'Tham quan triển lãm' :
                     'Khám phá di sản'} <ArrowRightOutlined />
                </button>
            </div>
        </div>
    );
};

export default DiscoveryCard;
