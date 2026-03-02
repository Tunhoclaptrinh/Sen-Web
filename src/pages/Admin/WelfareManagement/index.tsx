import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Typography, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  DatePicker, 
  message,
  Statistic,
  Row,
  Col,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  GiftOutlined,
  BarChartOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

const WelfareManagement: React.FC = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    // Real app would call adminWelfareService.getVouchers()
    setTimeout(() => {
      setVouchers([
        { id: 1, name: 'P-Coffee 20%', type: 'external', price: 10, currencyType: 'pcoin', stock: 50, claimed: 12, expiryDate: '2024-12-31' },
        { id: 2, name: 'P-Shop 50K', type: 'external', price: 25, currencyType: 'pcoin', stock: 20, claimed: 5, expiryDate: '2024-10-15' },
        { id: 3, name: 'Travel Voucher', type: 'external', price: 1000, currencyType: 'coins', stock: 5, claimed: 0, expiryDate: '2025-01-01' },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleAddVoucher = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditVoucher = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null
    });
    setModalVisible(true);
  };

  const handleDeleteVoucher = (_id: number) => {
    Modal.confirm({
      title: 'Xóa Voucher',
      content: 'Bạn có chắc chắn muốn xóa voucher này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        message.success('Đã xóa voucher thành công');
        // Refresh
      }
    });
  };

  const onFinish = () => {
    
    if (editingId) {
      message.success('Cập nhật voucher thành công');
    } else {
      message.success('Thêm voucher mới thành công');
    }
    setModalVisible(false);
  };

  const columns = [
    {
      title: 'Tên Voucher',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'external' ? 'blue' : 'orange'}>
          {type === 'external' ? 'Dịch vụ đối tác' : 'Vật phẩm game'}
        </Tag>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: any) => (
        <Space size="small">
          <Text strong style={{ color: record.currencyType === 'pcoin' ? '#c5a065' : record.currencyType === 'coins' ? '#faad14' : '#eb2f96' }}>
            {price}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.currencyType === 'pcoin' ? 'P' : record.currencyType === 'coins' ? 'Coins' : 'Petals'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Tồn kho',
      key: 'inventory',
      render: (_: any, record: any) => (
        <span>{record.claimed} / {record.stock}</span>
      ),
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string) => date || 'Không giới hạn',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} onClick={() => handleEditVoucher(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteVoucher(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="welfare-management">
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false} className="stat-card blue-gradient">
            <Statistic title="Tổng Voucher" value={15} prefix={<GiftOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="stat-card gold-gradient">
            <Statistic title="Đã trao đổi" value={245} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="stat-card green-gradient">
            <Statistic title="Tỷ lệ quy đổi" value={85.5} suffix="%" prefix={<BarChartOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="stat-card purple-gradient">
            <Statistic title="P-Coin lưu hành" value={12500} prefix={<PlusOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card 
        title={<Space><GiftOutlined /><span>Danh sách Voucher</span></Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAddVoucher}>Thêm Voucher</Button>}
      >
        <Table 
          columns={columns} 
          dataSource={vouchers} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Chỉnh sửa Voucher' : 'Thêm Voucher mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Tên Voucher" rules={[{ required: true }]}>
                <Input placeholder="Ví dụ: Voucher P-Coffee 20%" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="type" label="Loại" initialValue="external">
                <Select>
                  <Option value="external">Dịch vụ đối tác</Option>
                  <Option value="item">Vật phẩm game</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Chi tiết ưu đãi..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="currencyType" label="Loại tiền" initialValue="pcoin" rules={[{ required: true }]}>
                <Select>
                  <Option value="pcoin">P-Coin</Option>
                  <Option value="coins">Tiền vàng</Option>
                  <Option value="petals">Cánh Sen</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="stock" label="Tổng kho" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="expiryDate" label="Ngày hết hạn">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <style>{`
        .welfare-management .stat-card {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: all 0.3s;
        }
        .welfare-management .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .welfare-management .blue-gradient { border-left: 4px solid #1890ff; }
        .welfare-management .gold-gradient { border-left: 4px solid #faad14; }
        .welfare-management .green-gradient { border-left: 4px solid #52c41a; }
        .welfare-management .purple-gradient { border-left: 4px solid #722ed1; }
      `}</style>
    </div>
  );
};

export default WelfareManagement;
