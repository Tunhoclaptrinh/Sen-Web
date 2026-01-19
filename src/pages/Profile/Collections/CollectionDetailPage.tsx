import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Button, Spin, message, Empty, Modal } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, ShareAltOutlined } from '@ant-design/icons';
import collectionService from '@/services/collection.service';
import { Collection, CollectionItem, CollectionDTO } from '@/types/collection.types';
import ArticleCard from '@/components/common/cards/ArticleCard';
import ProfileHeader from '../ProfileHeader';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import CollectionModal from './CollectionModal';
import '../Profile/styles.less'; // Reuse profile styles

const { Title, Paragraph } = Typography;

const CollectionDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    
    const [collection, setCollection] = useState<Collection | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [updating, setUpdating] = useState(false);

    const fetchDetail = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await collectionService.getById(id);
            if (res.success && res.data) {
                setCollection(res.data);
            } else {
                message.error('Không tìm thấy bộ sưu tập');
                navigate('/profile/library');
            }
        } catch (error) {
            message.error('Lỗi khi tải bộ sưu tập');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleRemoveItem = async (itemId: number, type: 'heritage' | 'artifact') => {
        if (!id) return;
        try {
            await collectionService.removeItem(id, itemId, type);
            message.success('Đã xóa khỏi bộ sưu tập');
            fetchDetail(); // Refresh
        } catch (error) {
            message.error('Xóa thất bại');
        }
    };
    
    const handleDeleteCollection = () => {
        if (!id) return;
        Modal.confirm({
            title: 'Xóa bộ sưu tập?',
            content: 'Bạn có chắc muốn xóa bộ sưu tập này không?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: async () => {
                try {
                    await collectionService.delete(id);
                    message.success('Đã xóa bộ sưu tập');
                    navigate('/profile/library');
                } catch (error) {
                    message.error('Xóa thất bại');
                }
            }
        });
    };

    const handleUpdateCollection = async (values: CollectionDTO) => {
        if (!collection) return;
        setUpdating(true);
        try {
            const res = await collectionService.update(collection.id, values);
            if (res.success) {
                message.success('Cập nhật thành công');
                fetchDetail();
                setShowEditModal(false);
            } else {
                message.error(res.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            message.error('Đã có lỗi xảy ra');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
    if (!collection) return null;

    return (
        <div className="profile-page collection-detail-page">
             <ProfileHeader user={user} activeTab="library" showTabs={true} />
             
             <div className="profile-content" style={{ marginTop: -20, padding: '24px' }}>
                 <div className="profile-container">
                    <Button 
                        type="link" 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/profile/library')} 
                        style={{ marginBottom: 16, paddingLeft: 0, color: '#666' }}
                    >
                        Quay lại Thư viện
                    </Button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 32 }}>
                        <div>
                            <Title level={2} style={{ marginBottom: 8 }}>{collection.name}</Title>
                            {collection.description && <Paragraph type="secondary">{collection.description}</Paragraph>}
                            <div style={{ color: '#888' }}>
                                <span>{collection.total_items} mục</span>
                                <span style={{ margin: '0 8px' }}>•</span>
                                <span>{collection.is_public ? 'Công khai' : 'Riêng tư'}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                             <Button icon={<ShareAltOutlined />}>Chia sẻ</Button>
                             <Button icon={<EditOutlined />} onClick={() => setShowEditModal(true)}>Sửa</Button>
                             <Button danger icon={<DeleteOutlined />} onClick={handleDeleteCollection}>Xóa</Button>
                        </div>
                    </div>

                    <CollectionModal
                        visible={showEditModal}
                        initialValues={collection}
                        onCancel={() => setShowEditModal(false)}
                        onOk={handleUpdateCollection}
                        loading={updating}
                    />

                    {collection.items && collection.items.length > 0 ? (
                        <Row gutter={[24, 24]}>
                            {collection.items.map((item: CollectionItem) => {
                                // Fallback if details are missing, construct basic data
                                const articleData = item.details || {
                                    id: item.id,
                                    name: `Tài nguyên không tồn tại (ID: ${item.id})`,
                                    description: `Không thể tải thông tin chi tiết cho ${item.type}.`,
                                    image: null
                                };
                                
                                return (
                                    <Col key={`${item.type}-${item.id}`} xs={24} sm={12} lg={8} xl={6}>
                                        <ArticleCard 
                                            type={item.type === 'heritage' ? 'heritage' : 'artifact'}
                                            data={articleData}
                                            showReadMore={true}
                                            secondaryAction={
                                                 <Button 
                                                    type="text" 
                                                    danger 
                                                    icon={<DeleteOutlined />} 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveItem(item.id, item.type);
                                                    }}
                                                />
                                            }
                                        />
                                    </Col>
                                );
                            })}
                        </Row>
                    ) : (
                        <Empty description="Bộ sưu tập trống" />
                    )}
                 </div>
             </div>
        </div>
    );
};

export default CollectionDetailPage;
