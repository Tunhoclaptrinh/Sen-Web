import React from 'react';
import { Typography } from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    CommentOutlined,
    EnvironmentOutlined,
    ArrowRightOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import './styles.less';

const { Paragraph } = Typography;

interface ArticleCardProps {
    data: any; // Using any for shared convenience
    type: 'artifact' | 'heritage' | 'history';
    variant?: 'default' | 'portrait'; // Added variant support
}

const ArticleCard: React.FC<ArticleCardProps> = ({ data, type, variant = 'default' }) => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        let path = '';
        if (type === 'artifact') path = `/artifacts/${data.id}`;
        else if (type === 'heritage') path = `/heritage-sites/${data.id}`;
        else if (type === 'history') path = `/history/${data.id}`;
        
        navigate(path);
    };

    const rawImage = data.image || data.main_image || (data.images && data.images[0]);
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const apiHost = apiBase.replace(/\/api$/, '');
    const imageUrl = rawImage 
        ? (rawImage.startsWith('http') ? rawImage : `${apiHost}${rawImage}`)
        : 'https://via.placeholder.com/800x600';

    return (
        <div className={`article-card ${type} ${variant}`} onClick={handleNavigate} style={{ cursor: 'pointer' }}>
            <div className="card-image-wrapper">
                 <div className="card-image" style={{ backgroundImage: `url('${imageUrl}')` }} />
                 {/* Optional: Add Region/Location badge if Heritage */}
                 {type === 'heritage' && data.region && (
                     <div className="location-badge">
                         <EnvironmentOutlined /> {data.region}
                     </div>
                 )}
            </div>

            <div className="card-content">
                {/* Meta Row: Date | Author | Comments */}
                <div className="card-meta">
                    <span className="meta-item">
                        <CalendarOutlined /> {dayjs(data.publishDate || data.createdAt).format('MMM D, YYYY')}
                    </span>
                    <span className="meta-item">
                        <UserOutlined /> {data.author || 'Admin'}
                    </span>
                    {data.commentCount !== undefined && (
                        <span className="meta-item">
                             <CommentOutlined /> {data.commentCount > 0 ? `${data.commentCount}` : '0'}
                        </span>
                    )}
                </div>

                <h3 className="card-title" title={data.name}>{data.name}</h3>

                {/* Short Description or Truncated Description */}
                <Paragraph className="card-desc" ellipsis={{ rows: 3 }}>
                    {data.short_description || data.shortDescription || "Chưa có mô tả ngắn."}
                </Paragraph>
                
                <div className="card-footer">
                    <button className="read-more-btn">
                        {data.short_description || data.shortDescription ? 'Đọc thêm' : 'Khám phá'} <ArrowRightOutlined />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;
