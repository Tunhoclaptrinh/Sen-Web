import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message, Row, Col, Typography, Empty, Button, Divider, Tag, Tabs, Timeline } from "antd";
import {
  EnvironmentOutlined,
  HeartOutlined,
  HeartFilled,
  CalendarOutlined,
  UserOutlined,
  ShareAltOutlined,
  ReadOutlined,
  RocketOutlined,
  ShopOutlined,
  ArrowLeftOutlined,
  EyeOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import historyService from "@/services/history.service"; // Adapt service
import favoriteService from "@/services/favorite.service";
import ArticleCard from "@/components/common/cards/ArticleCard";
import { useViewTracker } from "@/hooks/useViewTracker";
import { HistoryArticle, HeritageSite, Artifact, TimelineEvent } from "@/types";
import "./styles.less";

const { Title } = Typography;

const HistoryDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState<HistoryArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false); // Placeholder for now

    // Track view
    useViewTracker('history', id);

    // Data states
    const [relatedHeritage, setRelatedHeritage] = useState<HeritageSite[]>([]);
    const [relatedArtifacts, setRelatedArtifacts] = useState<Artifact[]>([]);
    const [relatedLevels, setRelatedLevels] = useState<any[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    
    // Fallback for general related history
    const [relatedHistory, setRelatedHistory] = useState<HistoryArticle[]>([]);


    useEffect(() => {
        if (id) {
            fetchData(id);
            checkFavoriteStatus(id);
            window.scrollTo(0, 0);
        }
    }, [id]);

     const fetchData = async (currentId: string) => {
        try {
            setLoading(true);
            const res = await historyService.getById(currentId);
            if (res && res.data) {
                 const data = res.data;
                 setArticle(data);
                 setRelatedHeritage(data.relatedHeritage || []);
                 setRelatedArtifacts(data.relatedArtifacts || []);
                 setRelatedLevels(data.relatedLevels || []);
                 setRelatedProducts(data.relatedProducts || []);

                 // Also fetch general related history items for the bottom section
                 const resRelated = await historyService.getRelated(currentId);
                 if (resRelated.success) setRelatedHistory(resRelated.data || []);

            } else {
                message.error('Không tìm thấy bài viết');
            }
        } catch (error) {
            console.error(error);
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const checkFavoriteStatus = async (currentId: string) => {
        try {
            const res = await favoriteService.check('article', currentId);
            if (res.data) {
                setIsFavorite(res.data.isFavorited);
            }
        } catch (error) {
            console.error("Error checking favorite status:", error);
        }
    };

    const handleToggleFavorite = async () => {
        try {
            if (!id) return;
            const res = await favoriteService.toggle('article', id);
            if (res.success && res.data) {
                setIsFavorite(res.data.isFavorited);
                message.success(res.message);
            }
        } catch (error) {
            message.error("Lỗi khi cập nhật yêu thích");
        }
    };

    if (loading) return <div className="loading-container"><Spin size="large"/></div>;
    if (!article) return <Empty description="Không tìm thấy bài viết" />;
    
    const mainImage = article.image || 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=1200';
    const publishDate = article.publishDate || article.createdAt;
    const authorName = article.authorName || article.author || 'Hệ thống';

    return (
        <div className="heritage-blog-page history-detail-page">
            {/* 0. Nav Back (Added on top of Hero) */}
            <div className="nav-back-wrapper">
                <Button 
                    type="default" 
                    shape="circle" 
                    icon={<ArrowLeftOutlined />} 
                    size="large"
                    onClick={() => navigate('/history')}
                    className="nav-back-btn"
                />
            </div>

            {/* 1. HERO SECTION (Identical to Heritage) */}
            <section className="detail-hero">
                <div className="hero-bg" style={{backgroundImage: `url('${mainImage}')`}} />
                <div className="hero-overlay">
                    <div className="hero-content">
                        <Tag color="var(--primary-color)" style={{border: 'none', marginBottom: 16}}>LỊCH SỬ VIỆT NAM</Tag>
                        <h1>{article.title}</h1>
                        <div className="hero-meta">
                             <span><CalendarOutlined /> {dayjs(publishDate).format('DD/MM/YYYY')}</span>
                             <span><UserOutlined /> {authorName}</span>
                             <span><EyeOutlined /> {article.views || 0} lượt xem</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="content-container">
                <Tabs 
                    defaultActiveKey="content" 
                    className="heritage-tabs" // Reuse heritage-tabs class for consistent styling
                    centered
                    items={[
                        {
                            key: 'content',
                            label: 'Nội dung',
                            children: (
                                <div className="article-main-wrapper">
                                    <div className="article-meta-header">
                                        <SpaceItem icon={<ReadOutlined />} text="Bài viết chi tiết" />
                                    </div>

                                    <h2 className="article-main-title">{article.title}</h2>

                                    {/* Abstract/Short Description */}
                                    {article.shortDescription && (
                                        <blockquote>
                                            {article.shortDescription}
                                        </blockquote>
                                    )}
                                    <div 
                                        className="article-body-content"
                                        dangerouslySetInnerHTML={{ __html: article.content || '' }}
                                    />

                                    {article.references && (
                                        <div className="references-section">
                                            <h3>Nguồn tham khảo</h3>
                                            <div className="references-content" dangerouslySetInnerHTML={{ __html: article.references }} />
                                        </div>
                                    )}

                                    <div className="article-footer-info">
                                        <Divider />
                                        <div className="action-row">
                                            <Button 
                                                type="text" 
                                                size="large"
                                                icon={isFavorite ? <HeartFilled style={{color: '#ff4d4f'}} /> : <HeartOutlined />}
                                                onClick={handleToggleFavorite}
                                            >
                                                {isFavorite ? 'Đã lưu' : 'Lưu bài viết'}
                                            </Button>
                                            <Button type="text" size="large" icon={<ShareAltOutlined />}>Chia sẻ</Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: 'timeline',
                            label: 'Dòng thời gian',
                            children: (
                                <div className="article-main-wrapper">
                                    <Title level={3} style={{fontFamily: 'Aleo, serif', marginBottom: 32, textAlign: 'center'}}>Các Mốc Sự Kiện Quan Trọng</Title>
                                    {article.timelineEvents && article.timelineEvents.length > 0 ? (
                                        <div style={{maxWidth: 800, margin: '0 auto'}}>
                                            <Timeline mode="alternate">
                                                {article.timelineEvents.map((event: TimelineEvent, index: number) => (
                                                    <Timeline.Item key={index} label={event.year} color={index % 2 === 0 ? "red" : "blue"}>
                                                        <strong style={{fontSize: 18, color: '#d4380d'}}>{event.title}</strong>
                                                        <p style={{marginTop: 8, color: '#666'}}>{event.description}</p>
                                                    </Timeline.Item>
                                                ))}
                                            </Timeline>
                                        </div>
                                    ) : (
                                        <Empty description="Chưa có dữ liệu dòng thời gian" />
                                    )}
                                </div>
                            )
                        },
                        {
                            key: 'discovery',
                            label: 'Khám phá & Trải nghiệm',
                            children: (
                                <div className="article-main-wrapper">
                                    {/* 1. Related Games */}
                                    {relatedLevels.length > 0 && (
                                        <div className="discovery-block" style={{marginBottom: 48}}>
                                            <Title level={3}><RocketOutlined /> Trải nghiệm Lịch sử</Title>
                                            <p>Tham gia các màn chơi tương tác để hiểu rõ hơn về sự kiện này.</p>
                                            <Row gutter={[16, 16]}>
                                                {relatedLevels.map((level: any) => (
                                                    <Col xs={24} md={12} key={level.id}>
                                                        <div className="game-card-mini" style={{border: '1px solid #eee', borderRadius: 12, padding: 16, display: 'flex', gap: 16, alignItems: 'center'}}>
                                                            <div className="game-thumb" style={{width: 80, height: 80, borderRadius: 8, background: '#eee', backgroundImage: `url(${level.backgroundImage})`, backgroundSize: 'cover'}} />
                                                            <div className="game-info" style={{flex: 1}}>
                                                                <h4 style={{margin: 0, fontSize: 16}}>{level.name}</h4>
                                                                <div style={{color: '#888', fontSize: 13}}>{level.description}</div>
                                                            </div>
                                                            <Button type="primary" shape="round" icon={<RocketOutlined />}>Chơi ngay</Button>
                                                        </div>
                                                    </Col>
                                                ))}
                                            </Row>
                                            <Divider />
                                        </div>
                                    )}

                                    {/* 2. Related Heritage & Artifacts */}
                                    {(relatedHeritage.length > 0 || relatedArtifacts.length > 0) && (
                                        <div className="discovery-block" style={{marginBottom: 48}}>
                                             <Title level={3}><EnvironmentOutlined /> Di sản & Hiện vật liên quan</Title>
                                             <Row gutter={[16, 16]}>
                                                {relatedHeritage.map((h: any) => (
                                                    <Col xs={24} sm={12} md={8} key={`h-${h.id}`}>
                                                        <ArticleCard data={h} type="heritage" />
                                                    </Col>
                                                ))}
                                                {relatedArtifacts.map((a: any) => (
                                                    <Col xs={24} sm={12} md={8} key={`a-${a.id}`}>
                                                        <ArticleCard data={a} type="artifact" />
                                                    </Col>
                                                ))}
                                             </Row>
                                             <Divider />
                                        </div>
                                    )}

                                    {/* 3. Related Products */}
                                    {relatedProducts.length > 0 && (
                                        <div className="discovery-block">
                                            <Title level={3}><ShopOutlined /> Sản phẩm Văn hóa</Title>
                                            <Row gutter={[16, 16]}>
                                                {relatedProducts.map((p: any) => (
                                                    <Col xs={24} sm={12} md={6} key={p.id}>
                                                         <div className="product-card" style={{textAlign: 'center'}}>
                                                             <div className="prod-img" style={{height: 200, marginBottom: 16, borderRadius: 8, overflow: 'hidden'}}>
                                                                 <img src={p.image} alt={p.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                             </div>
                                                             <h4 style={{marginBottom: 8}}>{p.name}</h4>
                                                             <div style={{color: '#d4380d', fontWeight: 'bold', marginBottom: 12}}>{p.price?.toLocaleString()} đ</div>
                                                             <Button block>Xem chi tiết</Button>
                                                         </div>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    )}
                                     
                                     {/* Empty State if absolutely nothing */}
                                     {!relatedLevels.length && !relatedHeritage.length && !relatedArtifacts.length && !relatedProducts.length && (
                                         <Empty description="Đang cập nhật thêm các nội dung khám phá..." />
                                     )}
                                </div>
                            )
                        }
                    ]}
                />
            </div>

            {/* RELATED HISTORY BOTTOM */}
            <div className="related-bottom-section">
                <div className="content-container">
                    <Divider />
                    <Title level={3} className="section-title">Bài viết lịch sử khác</Title>
                    <Row gutter={[24, 24]}>
                        {relatedHistory.map(item => (
                            <Col xs={24} sm={12} md={8} key={item.id}>
                                <ArticleCard data={{...item, name: item.title}} type="history" />
                            </Col>
                        ))}
                    </Row>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const SpaceItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <span className="meta-space-item" style={{marginRight: 24, fontSize: 14, color: '#888'}}>
        {icon} <span style={{marginLeft: 6}}>{text}</span>
    </span>
);

export default HistoryDetailPage;
