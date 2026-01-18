
import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, message, Typography, Empty, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, AppstoreOutlined } from '@ant-design/icons';
import Button from '@/components/common/Button';
import ArticleCard from '@/components/common/cards/ArticleCard';
import collectionService, { Collection, CollectionDTO } from '@/services/collection.service';
import CollectionModal from './CollectionModal';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const CollectionsPage = () => {
    // const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    
    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const res = await collectionService.getAll();
            if (res.success) {
                setCollections(res.data || []);
            }
        } catch (error) {
            message.error("Không thể tải danh sách bộ sưu tập");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleCreate = () => {
        setEditingCollection(null);
        setModalVisible(true);
    };

    const handleEdit = (col: Collection) => {
        setEditingCollection(col);
        setModalVisible(true);
    };

    const handleSave = async (values: CollectionDTO) => {
        setModalLoading(true);
        try {
            if (editingCollection) {
                await collectionService.update(editingCollection.id, values);
                message.success("Cập nhật thành công!");
            } else {
                await collectionService.create(values);
                message.success("Tạo bộ sưu tập thành công!");
            }
            setModalVisible(false);
            fetchCollections();
        } catch (error) {
            message.error("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xóa bộ sưu tập",
            content: "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await collectionService.delete(id);
                    message.success("Đã xóa bộ sưu tập");
                    fetchCollections();
                } catch (error) {
                    message.error("Xóa thất bại");
                }
            }
        });
    };

    return (
        <div className="collections-page" style={{ padding: '24px 0' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                   <Title level={2} style={{ margin: 0 }}>Bộ Sưu Tập Của Tôi</Title>
                   <Paragraph type="secondary" style={{ margin: 0 }}>Quản lý và tổ chức các di sản yêu thích của bạn</Paragraph>
                </div>
                <Button 
                    variant="primary" 
                    buttonSize="medium" 
                    icon={<PlusOutlined />} 
                    onClick={handleCreate}
                >
                    Tạo Mới
                </Button>
            </div>

            {/* List */}
             {loading ? (
                 <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" tip="Đang tải..." /></div> 
             ) : (
                 collections.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {collections.map(col => (
                            <Col key={col.id} xs={24} sm={12} lg={8} xl={6}>
                                <ArticleCard
                                    type="collection"
                                    data={{
                                        id: col.id,
                                        name: col.name,
                                        short_description: col.description,
                                        created_at: col.created_at,
                                        total_items: col.total_items,
                                        thumbnail: "/images/collection-placeholder.jpg"
                                    }}
                                    actions={
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
                                            <Button 
                                                variant="ghost" 
                                                icon={<EditOutlined />} 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(col);
                                                }} 
                                            />
                                            <Button 
                                                variant="ghost" 
                                                danger 
                                                icon={<DeleteOutlined />} 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(col.id);
                                                }} 
                                            />
                                        </div>
                                    }
                                />
                            </Col>
                        ))}
                    </Row>
                 ) : (
                    <Empty
                        image={<div style={{ fontSize: 64, color: '#e0e0e0', marginBottom: 16 }}><AppstoreOutlined /></div>}
                        description={
                            <span>
                                Bạn chưa có bộ sưu tập nào. <br/>
                                <span style={{ color: '#888' }}>Hãy tạo ngay một bộ sưu tập để lưu giữ những di sản bạn yêu thích!</span>
                            </span>
                        }
                    >
                        <Button variant="primary" onClick={handleCreate}>Tạo Ngay</Button>
                    </Empty>
                 )
             )}

             <CollectionModal 
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSave}
                loading={modalLoading}
                initialValues={editingCollection}
             />
        </div>
    );
};

export default CollectionsPage;
