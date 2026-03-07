
import { useState, useEffect } from 'react';

import { Row, Col, Spin, message, Typography, Empty, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, AppstoreOutlined } from '@ant-design/icons';
import Button from '@/components/common/Button';
import ArticleCard from '@/components/common/cards/ArticleCard';
import collectionService from '@/services/collection.service';
import { Collection, CollectionDTO } from '@/types/collection.types';
import CollectionModal from './CollectionModal';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

const CollectionsPage = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'profile' });
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
            message.error(t("collectionsPage.loadFailed"));
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
                message.success(t("collectionsPage.updateSuccess"));
            } else {
                await collectionService.create(values);
                message.success(t("collectionsPage.createSuccess"));
            }
            setModalVisible(false);
            fetchCollections();
        } catch (error) {
            message.error(t("collectionsPage.errorOccurred"));
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: t("collectionsPage.deleteTitle"),
            content: t("collectionsPage.deleteConfirm"),
            okText: t("collectionsPage.deleteBtn"),
            okType: "danger",
            cancelText: t("collectionsPage.cancelBtn"),
            onOk: async () => {
                try {
                    await collectionService.delete(id);
                    message.success(t("collectionsPage.deleteSuccess"));
                    fetchCollections();
                } catch (error) {
                    message.error(t("collectionsPage.deleteFailed"));
                }
            }
        });
    };

    return (
        <div className="collections-page" style={{ padding: '24px 0' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>{t("collectionsPage.title")}</Title>
                    <Paragraph type="secondary" style={{ margin: 0 }}>{t("collectionsPage.description")}</Paragraph>
                </div>
                <Button
                    variant="primary"
                    buttonSize="medium"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    {t("collectionsPage.createNewBtn")}
                </Button>
            </div>

            {/* List */}
            {loading ? (
                <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" tip={t("collectionsPage.loading")} /></div>
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
                                        shortDescription: col.description,
                                        createdAt: col.createdAt,
                                        totalItems: col.totalItems,
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
                                {t("collectionsPage.emptyMessage1")} <br />
                                <span style={{ color: '#888' }}>{t("collectionsPage.emptyMessage2")}</span>
                            </span>
                        }
                    >
                        <Button variant="primary" onClick={handleCreate}>{t("collectionsPage.createNowBtn")}</Button>
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
