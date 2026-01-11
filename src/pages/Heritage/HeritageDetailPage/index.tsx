import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Spin, message, Row, Col, Typography, Empty, Button, Divider, Tag, Tabs, Timeline } from "antd";
import {
  EnvironmentOutlined,
  HeartOutlined,
  HeartFilled,
  CalendarOutlined,
  StarFilled,
  UserOutlined,
  CommentOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BankOutlined,
  GlobalOutlined,
  SafetyCertificateFilled
} from "@ant-design/icons";
import dayjs from 'dayjs';
import { fetchHeritageSiteById } from "@store/slices/heritageSlice";
import favoriteService from "@/services/favorite.service";
import heritageService from "@/services/heritage.service";
import { RootState, AppDispatch } from "@/store";
import ArticleCard from "@/components/common/cards/ArticleCard";
import type { HeritageSite, TimelineEvent } from "@/types";
import "./styles.less";

const { Title } = Typography;

const HeritageDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const {
        currentItem: site,
        loading,
        error,
    } = useSelector((state: RootState) => state.heritage);
    const [isFavorite, setIsFavorite] = useState(false);
    const [relatedSites, setRelatedSites] = useState<HeritageSite[]>([]);
    const [siteArtifacts, setSiteArtifacts] = useState<any[]>([]);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

    useEffect(() => {
        if (id) {
            dispatch(fetchHeritageSiteById(id));
            fetchRelatedData(id);
            window.scrollTo(0, 0);
        }
    }, [dispatch, id]);

     const fetchRelatedData = async (currentId: string) => {
        try {
            const resRelated = await heritageService.getAll({ limit: 4 });
            if (resRelated.data) {
                // Fetch 4 to ensure we have 3 after filtering current one
                setRelatedSites(resRelated.data.filter(s => s.id !== Number(currentId)).slice(0, 3));
            }

            const resArtifacts = await heritageService.getArtifacts(currentId);
            if (resArtifacts.success && resArtifacts.data) setSiteArtifacts(resArtifacts.data);

            const resTimeline = await heritageService.getTimeline(currentId);
            if(resTimeline.success && resTimeline.data) setTimelineEvents(resTimeline.data);

        } catch (e) {
            console.error("Failed to fetch related data");
        }
    }

    useEffect(() => {
        if (error) {
            message.error(error);
            navigate("/heritage-sites");
        }
    }, [error, navigate]);

    const handleToggleFavorite = async () => {
        if (!id) return;
        try {
            if (isFavorite) {
                await favoriteService.remove("heritage_site", Number(id));
                setIsFavorite(false);
                message.success("Đã xóa khỏi yêu thích");
            } else {
                await favoriteService.add("heritage_site", Number(id));
                setIsFavorite(true);
                message.success("Đã thêm vào yêu thích");
            }
        } catch (error) {
            message.error("Thao tác thất bại");
        }
    };

    if (loading) return <div className="loading-container"><Spin size="large"/></div>;
    if (!site) return <Empty description="Không tìm thấy di sản" />;
    
    const mainImage = site.main_image || site.image || (site.images && site.images[0]) || 'https://images.unsplash.com/photo-1599525281489-0824b223c285?w=1200';
    const publishDate = site.publishDate || site.created_at || new Date().toISOString();
    const authorName = site.author || 'Admin';

    return (
        <div className="heritage-blog-page">
            {/* 1. RESTORED HERO SECTION */}
            <section className="detail-hero">
                <div className="hero-bg" style={{backgroundImage: `url('${mainImage}')`}} />
                <div className="hero-overlay">
                    <div className="hero-content">
                        <Tag color="#F43F5E" style={{border: 'none', marginBottom: 16}}>{site.type?.toUpperCase().replace('_', ' ') || 'HERITAGE'}</Tag>
                        <h1>{site.name}</h1>
                        <div className="hero-meta">
                            <span><EnvironmentOutlined /> {site.address || site.region}</span>
                            {site.unesco_listed && <span className="unesco-badge"><StarFilled style={{color: '#FFD700'}} /> UNESCO World Heritage</span>}
                        </div>
                    </div>
                </div>
            </section>

            <div className="content-container">
                <Tabs 
                    defaultActiveKey="description" 
                    className="heritage-tabs"
                    centered
                    items={[
                        {
                            key: 'description',
                            label: 'Mô Tả',
                            children: (
                                <div className="article-main-wrapper">
                                    {/* Article Header Meta */}
                                    <div className="article-meta-header">
                                        <SpaceItem icon={<CalendarOutlined />} text={dayjs(publishDate).format('MMM D, YYYY')} />
                                        <SpaceItem icon={<UserOutlined />} text={authorName} />
                                        <SpaceItem icon={<CommentOutlined />} text={`${site.commentCount || 0} comments`} />
                                    </div>

                                    {/* Main Title */}
                                    <h2 className="article-main-title">{site.name}</h2>

                                    {/* Content Body (Rich Text) */}
                                    <div 
                                        className="article-body-content"
                                        dangerouslySetInnerHTML={{ __html: site.description || '' }}
                                    />

                                        {/* Actions Row */}
                                        <div className="article-footer-info">
                                        <Divider />
                                        <div className="action-row">
                                                <Button 
                                                type="text" 
                                                size="large"
                                                icon={isFavorite ? <HeartFilled style={{color: '#ff4d4f'}} /> : <HeartOutlined />}
                                                onClick={handleToggleFavorite}
                                                >
                                                {isFavorite ? 'Đã thích' : 'Yêu thích'}
                                                </Button>
                                                <Button type="text" size="large" icon={<ShareAltOutlined />}>Chia sẻ</Button>
                                        </div>
                                        </div>
                                </div>
                            )
                        },
                        {
                            key: 'info',
                            label: 'Thông Tin',
                            children: (
                                <div className="article-main-wrapper">
                                    <div className="info-tab-content" style={{ maxWidth: 900, margin: '0 auto' }}>
                                        <div className="info-card-widget large-format">
                                            <Row gutter={[48, 24]}>
                                                <Col xs={24} md={12}>
                                                    <h3 className="info-section-title">Chi Tiết Tham Quan</h3>
                                                    <ul className="info-grid-list">
                                                        <li>
                                                            <div className="icon-wrapper"><ClockCircleOutlined /></div>
                                                            <div className="info-text">
                                                                <span className="label">Giờ mở cửa</span>
                                                                <span className="value">{site.visit_hours || "8:00 - 17:00"}</span>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="icon-wrapper"><DollarOutlined /></div>
                                                            <div className="info-text">
                                                                <span className="label">Giá vé tham quan</span>
                                                                <span className="value highlight">{site.entrance_fee ? `${site.entrance_fee.toLocaleString()} VNĐ` : "Miễn phí"}</span>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="icon-wrapper"><CalendarOutlined /></div>
                                                            <div className="info-text">
                                                                <span className="label">Năm thành lập</span>
                                                                <span className="value">{site.year_established || "Không rõ"}</span>
                                                            </div>
                                                        </li>
                                                         <li>
                                                            <div className="icon-wrapper"><BankOutlined /></div>
                                                            <div className="info-text">
                                                                <span className="label">Niên đại / Thời kỳ</span>
                                                                <span className="value">{site.cultural_period || "Đang cập nhật"}</span>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <h3 className="info-section-title">Địa Điểm & Xếp Hạng</h3>
                                                    <ul className="info-grid-list">
                                                        <li>
                                                            <div className="icon-wrapper"><EnvironmentOutlined /></div>
                                                            <div className="info-text">
                                                                <span className="label">Địa chỉ</span>
                                                                <span className="value">{site.address || site.region}</span>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="icon-wrapper"><StarFilled style={{color: '#fadb14'}} /></div>
                                                            <div className="info-text">
                                                                <span className="label">Đánh giá du khách</span>
                                                                <span className="value">{site.rating || 0}/5 <span className="sub">({site.total_reviews || 0} đánh giá)</span></span>
                                                            </div>
                                                        </li>
                                                         <li>
                                                            <div className="icon-wrapper"><GlobalOutlined /></div>
                                                            <div className="info-text">
                                                                <span className="label">Vùng miền</span>
                                                                <span className="value">{site.region}</span>
                                                            </div>
                                                        </li>
                                                        {site.unesco_listed && (
                                                            <li>
                                                                <div className="icon-wrapper" style={{background: '#FFF7E6', color: '#FA8C16'}}><SafetyCertificateFilled /></div>
                                                                <div className="info-text">
                                                                    <span className="label">Danh hiệu</span>
                                                                    <span className="value" style={{color: '#FA8C16'}}>Di sản văn hóa UNESCO</span>
                                                                </div>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </Col>
                                            </Row>
                                            
                                            <Divider dashed />
                                            
                                            <div className="info-footer-actions">
                                                <div className="booking-note">
                                                    * Vé có thể được mua trực tiếp tại quầy hoặc đặt trước online để tránh xếp hàng.
                                                </div>
                                                <div className="action-buttons">
                                                     <Button size="large" className="direction-btn" icon={<EnvironmentOutlined />}>Chỉ Đường</Button>
                                                     <Button type="primary" size="large" className="booking-btn-large">Đặt Vé Ngay</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: 'artifacts',
                            label: 'Hiện Vật',
                            children: (
                                <div className="article-main-wrapper">
                                    <Title level={3} style={{fontFamily: 'Aleo, serif', marginBottom: 24}}>Hiện Vật Liên Quan</Title>
                                    {siteArtifacts.length > 0 ? (
                                        <Row gutter={[16, 16]}>
                                            {siteArtifacts.map(artifact => (
                                                <Col xs={24} sm={12} md={8} key={artifact.id}>
                                                    <ArticleCard 
                                                        data={artifact}
                                                        type="artifact"
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    ) : (
                                        <Empty description="Chưa có hiện vật nào được cập nhật" />
                                    )}
                                </div>
                            )
                        },
                        {
                            key: 'timeline',
                            label: 'Dòng Thời Gian',
                            children: (
                                <div className="article-main-wrapper">
                                    <Title level={3} style={{fontFamily: 'Aleo, serif', marginBottom: 24}}>Sự Kiện Lịch Sử</Title>
                                    {timelineEvents.length > 0 ? (
                                        <Timeline mode="alternate">
                                            {timelineEvents.map(event => (
                                                <Timeline.Item key={event.id} label={event.year}>
                                                    <strong style={{fontSize: 16}}>{event.title}</strong>
                                                    <p style={{color: '#666'}}>{event.description}</p>
                                                </Timeline.Item>
                                            ))}
                                        </Timeline>
                                    ) : (
                                        <Empty description="Chưa có dữ liệu dòng thời gian" />
                                    )}
                                </div>
                            )
                        }
                    ]}
                />
            </div>

            {/* RELATED SECTION (Bottom) */}
            <div className="related-bottom-section">
                <div className="content-container">
                    <Divider />
                    <Title level={3} className="section-title">Có thể bạn quan tâm</Title>
                    <Row gutter={[24, 24]}>
                        {relatedSites.map(item => (
                            <Col xs={24} sm={12} md={8} key={item.id}>
                                <ArticleCard data={item} type="heritage" />
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
    <span className="meta-space-item">
        {icon} <span style={{marginLeft: 6}}>{text}</span>
    </span>
);

export default HeritageDetailPage;
