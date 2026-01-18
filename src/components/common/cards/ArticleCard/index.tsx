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
import { getImageUrl, resolveImage } from '@/utils/image.helper';
import './styles.less';

const { Paragraph } = Typography;

interface ArticleCardProps {
    data: any; // Using any for shared convenience
    type: 'artifact' | 'heritage' | 'history' | 'collection';
    variant?: 'default' | 'portrait'; // Added variant support
    actions?: React.ReactNode;
    secondaryAction?: React.ReactNode;
    showReadMore?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ data, type, variant = 'default', actions, secondaryAction, showReadMore = true }) => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        let path = '';
        if (type === 'artifact') path = `/artifacts/${data.id}`;
        else if (type === 'heritage') path = `/heritage-sites/${data.id}`;
        else if (type === 'history') path = `/history/${data.id}`;
        else if (type === 'collection') path = `/profile/collections/${data.id}`;
        
        if (path) navigate(path);
    };

    const rawImage = resolveImage(data.image) || resolveImage(data.main_image) || resolveImage(data.images) || data.thumbnail; // Added thumbnail for collection
    const imageUrl = getImageUrl(rawImage, type === 'collection' ? '/images/collection-placeholder.jpg' : 'https://via.placeholder.com/800x600');

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
                 {type === 'collection' && data.total_items !== undefined && (
                     <div className="location-badge" style={{ background: 'rgba(0,0,0,0.7)' }}>
                         {data.total_items} mục
                     </div>
                 )}
            </div>

            <div className="card-content">
                {/* Meta Row: Date | Author | Comments */}
                <div className="card-meta">
                    <span className="meta-item">
                        <CalendarOutlined /> {dayjs(data.publishDate || data.createdAt || data.created_at).format('DD/MM/YYYY')}
                    </span>
                    {type !== 'collection' && (
                        <span className="meta-item">
                            <UserOutlined /> {data.author || 'Admin'}
                        </span>
                    )}
                    {(data.commentCount !== undefined && type !== 'collection') && (
                        <span className="meta-item">
                             <CommentOutlined /> {data.commentCount > 0 ? `${data.commentCount}` : '0'}
                        </span>
                    )}
                </div>

                <h3 className="card-title" title={data.name || data.title}>{data.name || data.title}</h3>

                {/* Short Description or Truncated Description */}
                <Paragraph className="card-desc" ellipsis={{ rows: 3 }}>
                    {data.short_description || data.shortDescription || data.description || "Chưa có mô tả ngắn."}
                </Paragraph>
                
                <div className="card-footer">
                    <div className="footer-left" onClick={(e) => e.stopPropagation()}>
                        {secondaryAction}
                    </div>
                    <div className="footer-right" onClick={(e) => actions && e.stopPropagation()}>
                        {actions ? actions : (showReadMore && (
                            <button className="read-more-btn">
                                {(data.short_description || data.shortDescription) ? 'Đọc thêm' : 'Khám phá'} <ArrowRightOutlined />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;
