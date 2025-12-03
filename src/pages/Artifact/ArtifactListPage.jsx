// ============================================
// src/pages/Artifact/ArtifactListPage.jsx - Artifact CRUD
// ============================================
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Row,
  Col,
  Select,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import artifactService from '../../api/services/artifact.service';

const { TextArea } = Input;

const ArtifactListPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [form] = Form.useForm();

  // Fetch data on mount and pagination change
  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  /**
   * Fetch artifacts
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      const response = await artifactService.getAll(params);

      setData(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.metadata?.total || 0,
      }));
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search artifacts
   */
  const handleSearch = async (value) => {
    if (!value) {
      fetchData();
      return;
    }

    setLoading(true);
    try {
      const response = await artifactService.search(value);
      setData(response.data || []);
    } catch (error) {
      message.error('Tìm kiếm thất bại');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Open modal for create
   */
  const handleAdd = () => {
    form.resetFields();
    setEditingRecord(null);
    setModalVisible(true);
  };

  /**
   * Open modal for edit
   */
  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingRecord(record);
    setModalVisible(true);
  };

  /**
   * Delete artifact
   */
  const handleDelete = async (id) => {
    try {
      await artifactService.delete(id);
      message.success('Xóa thành công');
      fetchData();
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

  /**
   * Submit form (Create or Update)
   */
  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        // Update
        await artifactService.update(editingRecord.id, values);
        message.success('Cập nhật thành công');
      } else {
        // Create
        await artifactService.create(values);
        message.success('Thêm mới thành công');
      }

      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error(editingRecord ? 'Cập nhật thất bại' : 'Thêm mới thất bại');
    }
  };

  /**
   * Handle table pagination change
   */
  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: newPagination.total,
    });
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: 'Tên Hiện Vật',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Thời Kỳ',
      dataIndex: 'period',
      key: 'period',
      width: 150,
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                message.info('Chức năng xem chi tiết đang phát triển')
              }
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa?"
            description="Bạn có chắc chắn muốn xóa hiện vật này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            Quản Lý Hiện Vật
          </span>
        }
        extra={
          <Space wrap>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />

            <Tooltip title="Làm mới">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
                loading={loading}
              />
            </Tooltip>

            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm Mới
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} mục`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingRecord ? 'Chỉnh Sửa Hiện Vật' : 'Thêm Hiện Vật Mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
        okText={editingRecord ? 'Cập Nhật' : 'Thêm Mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Tên Hiện Vật"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Nhập tên hiện vật" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô Tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <TextArea rows={4} placeholder="Nhập mô tả chi tiết" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh Mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  options={[
                    { label: 'Nhạc cụ', value: 'Nhạc cụ' },
                    { label: 'Vũ khí', value: 'Vũ khí' },
                    { label: 'Trang sức', value: 'Trang sức' },
                    { label: 'Gốm sứ', value: 'Gốm sứ' },
                    { label: 'Khác', value: 'Khác' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="period"
                label="Thời Kỳ"
                rules={[{ required: true, message: 'Vui lòng nhập thời kỳ' }]}
              >
                <Input placeholder="VD: Đông Sơn, Lý, Trần..." />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="culturalSignificance" label="Ý Nghĩa Văn Hóa">
                <TextArea rows={3} placeholder="Nhập ý nghĩa văn hóa" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ArtifactListPage;
