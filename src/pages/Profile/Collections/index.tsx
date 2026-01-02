import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, List, Button, Spin, message, Modal, Input, Typography, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
// import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import {
  fetchCollections,
  createCollection,
  deleteCollection,
} from '@/store/slices/collectionSlice';
import ArtifactCard from '@/components/common/ArtifactCard';

const { Title, Paragraph } = Typography;

const Collections = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const navigate = useNavigate();
  const { items, loading, error } = useSelector((state: RootState) => state.collection);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      message.error('Vui lòng nhập tên bộ sưu tập');
      return;
    }

    try {
      await dispatch(createCollection({
        name: newCollectionName,
        description: newCollectionDesc
      })).unwrap();
      message.success('Tạo bộ sưu tập thành công');
      setIsModalVisible(false);
      setNewCollectionName('');
      setNewCollectionDesc('');
    } catch (err: any) {
      message.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteCollection = async (id: number | string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bộ sưu tập này?')) {
      try {
        await dispatch(deleteCollection(id)).unwrap();
        message.success('Đã xóa bộ sưu tập');
      } catch (err: any) {
        message.error(err.message || 'Có lỗi xảy ra');
      }
    }
  };

  if (loading && items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Bộ Sưu Tập Của Tôi</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{
            background: 'linear-gradient(45deg, #F43F5E, #E11D48)',
            border: 'none',
            height: '40px'
          }}
        >
          Tạo Bộ Sưu Tập Mới
        </Button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      {items.length === 0 ? (
        <Empty description="Bạn chưa có bộ sưu tập nào" />
      ) : (
        <List
          grid={{ gutter: 24, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
          dataSource={items}
          renderItem={(collection: any) => (
            <List.Item>
              <Card
                title={collection.name}
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteCollection(collection.id)}
                  >
                    Xóa
                  </Button>
                }
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                {collection.description && (
                  <Paragraph type="secondary">{collection.description}</Paragraph>
                )}

                {(!collection.artifacts || collection.artifacts.length === 0) ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có hiện vật nào" />
                ) : (
                  <div style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {collection.artifacts.map((artifact: any) => (
                        <div key={artifact.id} style={{ minWidth: '200px', width: '200px' }}>
                          <ArtifactCard artifact={artifact} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </List.Item>
          )}
        />
      )}

      <Modal
        title="Tạo Bộ Sưu Tập Mới"
        open={isModalVisible}
        onOk={handleCreateCollection}
        onCancel={() => setIsModalVisible(false)}
        okText="Tạo"
        cancelText="Hủy"
        centered
      >
        <Input
          placeholder="Tên bộ sưu tập"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Input.TextArea
          placeholder="Mô tả (tùy chọn)"
          value={newCollectionDesc}
          onChange={(e) => setNewCollectionDesc(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  );
};

export default Collections;
