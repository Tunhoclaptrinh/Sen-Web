// ============================================
// src/pages/Heritage/HeritageListPage.jsx - Heritage CRUD
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
  InputNumber,
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
import heritageService from '../../services/heritage.service';

const { TextArea } = Input;

const HeritageListPage = () => {
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
   * Fetch heritage sites
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        _page: pagination.current,
        _limit: pagination.pageSize,
      };

      const response = await heritageService.getAll(params);

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
   * Search heritage sites
   */
  const handleSearch = async (value) => {
    if (!value) {
      fetchData();
      return;
    }

    setLoading(true);
    try {
      const response = await heritageService.search(value);
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
   * Delete heritage site
   */
  const handleDelete = async (id) => {
    try {
      await heritageService.delete(id);
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
        await heritageService.update(editingRecord.id, values);
        message.success('Cập nhật thành công');
      } else {
        // Create
        await heritageService.create(values);
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
      title: 'Tên Di Sản',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: 'Vùng',
      dataIndex: 'region',
      key: 'region',
      width: 120,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 150,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Đánh Giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating) => (rating ? `⭐ ${rating.toFixed(1)}` : 'N/A'),
    },
    {
      title: 'UNESCO',
      dataIndex: 'unesco_listed',
      key: 'unesco_listed',
      width: 100,
      render: (unesco) => (
        <Tag color={unesco ? 'green' : 'default'}>
          {unesco ? 'Có' : 'Không'}
        </Tag>
      ),
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
            description="Bạn có chắc chắn muốn xóa di sản này?"
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
            Quản Lý Di Sản Văn Hóa
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
        title={editingRecord ? 'Chỉnh Sửa Di Sản' : 'Thêm Di Sản Mới'}
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
                label="Tên Di Sản"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Nhập tên di sản" />
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
                name="region"
                label="Vùng"
                rules={[{ required: true, message: 'Vui lòng chọn vùng' }]}
              >
                <Select
                  placeholder="Chọn vùng"
                  options={[
                    { label: 'Hà Nội', value: 'Hà Nội' },
                    { label: 'Huế', value: 'Huế' },
                    { label: 'Hội An', value: 'Hội An' },
                    { label: 'Quảng Nam', value: 'Quảng Nam' },
                    { label: 'Đà Nẵng', value: 'Đà Nẵng' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại"
                rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
              >
                <Select
                  placeholder="Chọn loại"
                  options={[
                    { label: 'Di tích', value: 'monument' },
                    { label: 'Đền chùa', value: 'temple' },
                    { label: 'Bảo tàng', value: 'museum' },
                    { label: 'Thành cổ', value: 'ancient_city' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="address" label="Địa Chỉ">
                <Input placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="year_established" label="Năm Thành Lập">
                <InputNumber
                  placeholder="Nhập năm"
                  style={{ width: '100%' }}
                  min={0}
                  max={new Date().getFullYear()}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="entrance_fee" label="Phí Vào Cửa (VNĐ)">
                <InputNumber
                  placeholder="Nhập phí vào cửa"
                  style={{ width: '100%' }}
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="unesco_listed" label="UNESCO">
                <Select
                  placeholder="Chọn"
                  options={[
                    { label: 'Có', value: true },
                    { label: 'Không', value: false },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default HeritageListPage;
