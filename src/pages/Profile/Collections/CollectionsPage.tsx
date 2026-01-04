import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    Button,
    Empty,
    Spin,
    Statistic,
    Tag,
    Modal,
    Form,
    Input,
    Switch,
    message,
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    EyeOutlined,
    LockOutlined,
    GlobalOutlined,
    HeartOutlined,
    PictureOutlined,
} from '@ant-design/icons';
import collectionService from '@services/collection.service';
import type { Collection } from '@/types';
import './styles.less';

const { TextArea } = Input;

const CollectionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await collectionService.getAll();
            setCollections(response.data || []);
        } catch (error) {
            message.error('Không thể tải bộ sưu tập');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollection = async (values: any) => {
        try {
            await collectionService.create(values);
            message.success('Tạo bộ sưu tập thành công!');
            setCreateModalVisible(false);
            form.resetFields();
            fetchCollections();
        } catch (error) {
            message.error('Không thể tạo bộ sưu tập');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải bộ sưu tập..." />
            </div>
        );
    }

    return (
        <div className="collections-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <HeartOutlined /> Bộ Sưu Tập Của Tôi
                    </h1>
                    <p className="page-description">
                        Quản lý và khám phá các bộ sưu tập di sản văn hóa của bạn
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setCreateModalVisible(true)}
                >
                    Tạo Bộ Sưu Tập Mới
                </Button>
            </div>

            {collections.length === 0 ? (
                <Card className="empty-state-card">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div>
                                <h3>Chưa có bộ sưu tập nào</h3>
                                <p>Bắt đầu tạo bộ sưu tập để lưu trữ các di sản yêu thích của bạn</p>
                            </div>
                        }
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setCreateModalVisible(true)}
                        >
                            Tạo Bộ Sưu Tập Đầu Tiên
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <>
                    <div className="collections-stats">
                        <Row gutter={16}>
                            <Col xs={12} sm={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Tổng Bộ Sưu Tập"
                                        value={collections.length}
                                        prefix={<HeartOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Tổng Di Sản"
                                        value={collections.reduce((sum, c) => sum + c.total_items, 0)}
                                        prefix={<PictureOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Công Khai"
                                        value={collections.filter((c) => c.is_public).length}
                                        prefix={<GlobalOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Riêng Tư"
                                        value={collections.filter((c) => !c.is_public).length}
                                        prefix={<LockOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    <Row gutter={[24, 24]} className="collections-grid">
                        {collections.map((collection) => (
                            <Col xs={24} sm={12} lg={8} xl={6} key={collection.id}>
                                <Card
                                    hoverable
                                    className="collection-card"
                                    cover={
                                        <div className="collection-cover">
                                            <div className="collection-overlay">
                                                <PictureOutlined className="collection-icon" />
                                                <div className="collection-count">
                                                    {collection.total_items} di sản
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    actions={[
                                        <Tooltip title="Xem chi tiết">
                                            <Button
                                                type="text"
                                                icon={<EyeOutlined />}
                                                onClick={() =>
                                                    navigate(`/profile/collections/${collection.id}`)
                                                }
                                            >
                                                Xem
                                            </Button>
                                        </Tooltip>,
                                    ]}
                                >
                                    <Card.Meta
                                        title={
                                            <div className="collection-title">
                                                <span>{collection.name}</span>
                                                {collection.is_public ? (
                                                    <Tag color="blue" icon={<GlobalOutlined />}>
                                                        Công khai
                                                    </Tag>
                                                ) : (
                                                    <Tag icon={<LockOutlined />}>Riêng tư</Tag>
                                                )}
                                            </div>
                                        }
                                        description={
                                            <div className="collection-description">
                                                <p>
                                                    {collection.description || 'Chưa có mô tả'}
                                                </p>
                                                <div className="collection-meta">
                                                    <span>
                                                        <strong>{collection.artifact_ids?.length || 0}</strong>{' '}
                                                        hiện vật
                                                    </span>
                                                    <span>
                                                        <strong>
                                                            {collection.heritage_site_ids?.length || 0}
                                                        </strong>{' '}
                                                        di tích
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            <Modal
                title="Tạo Bộ Sưu Tập Mới"
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateCollection}>
                    <Form.Item
                        name="name"
                        label="Tên Bộ Sưu Tập"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên bộ sưu tập' },
                            { min: 3, message: 'Tên phải có ít nhất 3 ký tự' },
                        ]}
                    >
                        <Input placeholder="VD: Di Sản Hà Nội" size="large" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô Tả">
                        <TextArea
                            rows={4}
                            placeholder="Mô tả ngắn về bộ sưu tập này..."
                        />
                    </Form.Item>

                    <Form.Item
                        name="is_public"
                        label="Công Khai"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Switch
                            checkedChildren={<GlobalOutlined />}
                            unCheckedChildren={<LockOutlined />}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>
                            Tạo Bộ Sưu Tập
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CollectionsPage;
