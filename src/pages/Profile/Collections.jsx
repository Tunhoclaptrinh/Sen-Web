import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, List, Button, Spin, message, Modal, Input, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchCollections, createCollection, deleteCollection } from '@store/slices/collectionSlice';

const { Title } = Typography;

const Collections = () => {
  const dispatch = useDispatch();
  const { items: collections, loading, error } = useSelector((state) => state.collection);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // 1. Fetch collections on mount
  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  // 2. Handle Errors
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // 3. Handle Create Collection Modal
  const handleCreate = () => {
    if (!newCollectionName.trim()) {
      message.error('Tên bộ sưu tập không được để trống');
      return;
    }
    dispatch(createCollection({ name: newCollectionName }))
      .unwrap()
      .then(() => {
        message.success('Tạo bộ sưu tập thành công!');
        setIsModalVisible(false);
        setNewCollectionName('');
      })
      .catch((err) => {
        message.error(err.message || 'Lỗi khi tạo bộ sưu tập');
      });
  };

  // 4. Handle Delete Collection
  const handleDelete = (id, name) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa bộ sưu tập "${name}"?`,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        dispatch(deleteCollection(id))
          .unwrap()
          .then(() => {
            message.success(`Đã xóa bộ sưu tập "${name}"`);
          })
          .catch((err) => {
            message.error(err.message || 'Lỗi khi xóa bộ sưu tập');
          });
      },
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Title level={3}>Bộ Sưu Tập Cá Nhân</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Tạo Bộ Sưu Tập Mới
        </Button>
      </div>

      <Spin spinning={loading}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 5 }}
          dataSource={collections}
          renderItem={(item) => (
            <List.Item>
              <Card
                title={item.name}
                hoverable
                actions={[
                  <DeleteOutlined key="delete" onClick={() => handleDelete(item.id, item.name)} />,
                  // <EditOutlined key="edit" />, // Thêm chức năng chỉnh sửa sau
                ]}
              >
                <p>Mô tả: {item.description || 'Chưa có mô tả.'}</p>
                <p>Tổng số hiện vật: <b>{item.total_items || 0}</b></p>
                <p>Công khai: {item.is_public ? 'Có' : 'Không'}</p>
              </Card>
            </List.Item>
          )}
        />
      </Spin>

      {/* Modal for Creating New Collection */}
      <Modal
        title="Tạo Bộ Sưu Tập Mới"
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={() => setIsModalVisible(false)}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Input
          placeholder="Nhập tên bộ sưu tập"
          value={newCollectionName}
          onChange={(e) => setNewCollectionName(e.target.value)}
          style={{ marginTop: '20px' }}
        />
      </Modal>
    </div>
  );
};

export default Collections;