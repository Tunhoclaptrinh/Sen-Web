import React from "react";
import {Button, Space, Modal, Form, Input, Tag, Select, InputNumber, Switch, Radio} from "antd";
import {ShoppingCartOutlined, LinkOutlined} from "@ant-design/icons";
import {useShopModel} from "./model";
import DataTable from "@/components/common/DataTable";
import {useAuth} from "@/hooks/useAuth";
import {getImageUrl} from "@/utils/image.helper";
import ImageUpload from "@/components/common/Upload/ImageUpload";
import ShopDetailModal from "./components/ShopDetailModal";

const ShopManagement: React.FC = () => {
  const model = useShopModel();
  const {user} = useAuth();
  const [form] = Form.useForm();
  const [imageType, setImageType] = React.useState<'url' | 'upload'>('url');
  const [showCustomType, setShowCustomType] = React.useState(false);

  // Default types for dropdown
  const defaultTypes = [
    { label: "Trang trí (Vĩnh viễn)", value: "decoration" },
    { label: "Giao diện (Vĩnh viễn)", value: "permanent_theme" },
    { label: "Avatar (Vĩnh viễn)", value: "permanent_avatar" },
    { label: "Gợi ý (Tiêu tốn)", value: "consumable_hint" },
    { label: "Bảo vệ (Tiêu tốn)", value: "consumable_shield" },
    { label: "Sức mạnh (Tiêu tốn)", value: "powerup" },
    { label: "Characters", value: "character" },
    { label: "Premium AI", value: "premium_ai" },
  ];

  // Sync state when editing
  React.useEffect(() => {
    if (model.currentRecord) {
      // Image type sync
      const isUpload = model.currentRecord.image?.startsWith('/uploads/');
      setImageType(isUpload ? 'upload' : 'url');
      form.setFieldsValue({ imageType: isUpload ? 'upload' : 'url' });

      // Type sync
      const isDefaultType = defaultTypes.some(t => t.value === model.currentRecord.type);
      if (isDefaultType) {
        setShowCustomType(false);
        form.setFieldsValue({ typeSelect: model.currentRecord.type });
      } else {
        setShowCustomType(true);
        form.setFieldsValue({ 
          typeSelect: 'other',
          customType: model.currentRecord.type 
        });
      }
    } else {
      setImageType('url');
      setShowCustomType(false);
      form.setFieldsValue({ imageType: 'url', typeSelect: 'avatar' });
    }
  }, [model.currentRecord, form]);

  const onTypeChange = (value: string) => {
    const isOther = value === 'other';
    setShowCustomType(isOther);
    
    if (!isOther) {
      form.setFieldsValue({ type: value });
      
      // Auto-set isConsumable for specific types
      if (['permanent_theme', 'permanent_avatar', 'decoration'].includes(value)) {
        form.setFieldsValue({ isConsumable: false });
      } else if (['consumable_hint', 'consumable_shield', 'powerup'].includes(value)) {
        form.setFieldsValue({ isConsumable: true });
      }
    }
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (url: string) =>
        url ? <img src={getImageUrl(url)} alt="item" style={{width: 40, height: 40, borderRadius: 4}} /> : null,
    },
    {
      title: "Tên vật phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
    },
    {
      title: "Giá",
      key: "price",
      render: (_: any, record: any) => (
        <Tag color={record.currency === "petals" ? "pink" : "gold"}>
          {record.price} {record.currency === "petals" ? "Cánh sen" : "Xu"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (val: boolean) => (val ? <Tag color="green">ĐANG BÁN</Tag> : <Tag>HẾT HÀNG</Tag>),
    },
  ];

  // Generate dynamic filter options from existing data types
  const dynamicTypeOptions = React.useMemo(() => {
    const typesInOrder = defaultTypes.map(t => t.value);
    const existingTypes = Array.from(new Set(model.data.map((item: any) => item.type))).filter(Boolean);
    
    // Merge default and existing
    const allTypes = Array.from(new Set([...typesInOrder, ...existingTypes]));
    
    return allTypes.map(type => {
      const defaultMatch = defaultTypes.find(t => t.value === type);
      return {
        label: defaultMatch ? defaultMatch.label : type.charAt(0).toUpperCase() + type.slice(1),
        value: type
      };
    });
  }, [model.data]);

  const filters = [
    {
      key: "type",
      label: "Loại vật phẩm",
      type: "select" as const,
      options: dynamicTypeOptions,
    },
    {
      key: "currency",
      label: "Loại tiền tệ",
      type: "select" as const,
      options: [
        {label: "Xu (Coins)", value: "coins"},
        {label: "Cánh sen (Petals)", value: "petals"},
      ],
    },
    {
      key: "isActive",
      label: "Trạng thái",
      type: "select" as const,
      options: [
        {label: "Đang bán", value: true},
        {label: "Hết hàng", value: false},
      ],
    },
  ];

  return (
    <>
      <DataTable
        title="Quản lý Cửa hàng vật phẩm"
        user={user}
        loading={model.loading}
        columns={columns}
        dataSource={model.data}
        pagination={model.pagination}
        onChange={model.handleTableChange}
        onRefresh={model.refresh}
        searchable
        onSearch={model.search}
        filters={filters}
        filterValues={model.filters}
        onFilterChange={(key, value) => model.updateFilters({[key]: value})}
        onClearFilters={model.clearFilters}
        onAdd={model.openCreate}
        onView={model.openDetail}
        onEdit={model.openEdit}
        onDelete={model.remove}
      />

      <ShopDetailModal 
        visible={model.detailVisible}
        onClose={model.closeDetail}
        record={model.viewRecord}
      />

      <Modal
        title={model.currentRecord ? "Chỉnh sửa vật phẩm" : "Thêm vật phẩm mới"}
        open={model.formVisible}
        onCancel={model.closeForm}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={model.currentRecord || {currency: "coins", type: "avatar", isActive: true, imageType: 'url', isConsumable: false, maxStack: 1}}
          onFinish={model.handleSubmit}
        >
          <Form.Item name="name" label="Tên vật phẩm" rules={[{required: true, message: "Nhập tên"}]}>
            <Input prefix={<ShoppingCartOutlined />} placeholder="Ví dụ: Nón lá Sen" />
          </Form.Item>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <Form.Item label="Loại vật phẩm">
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="typeSelect" noStyle>
                  <Select onChange={onTypeChange} style={{ width: showCustomType ? '40%' : '100%' }}>
                    {defaultTypes.map(t => (
                      <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>
                    ))}
                    <Select.Option value="other">Khác...</Select.Option>
                  </Select>
                </Form.Item>
                {showCustomType && (
                  <Form.Item 
                    name="customType" 
                    noStyle 
                    rules={[{ required: true, message: 'Nhập loại' }]}
                  >
                    <Input 
                      placeholder="VD: Pet" 
                      onChange={(e) => form.setFieldsValue({ type: e.target.value })}
                    />
                  </Form.Item>
                )}
              </Space.Compact>
              <Form.Item name="type" noStyle hidden>
                <Input />
              </Form.Item>
            </Form.Item>
            <Form.Item name="isActive" label="Đang mở bán" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <Form.Item 
              noStyle 
              shouldUpdate={(prev, curr) => prev.typeSelect !== curr.typeSelect}
            >
              {({ getFieldValue }) => {
                const type = getFieldValue('typeSelect');
                const isPermanent = ['permanent_theme', 'permanent_avatar', 'decoration'].includes(type);
                return (
                  <Form.Item 
                    name="isConsumable" 
                    label="Cho phép mua nhiều lần" 
                    valuePropName="checked"
                    tooltip={isPermanent ? "Các vật phẩm vĩnh viễn không thể mua nhiều lần" : ""}
                  >
                    <Switch disabled={isPermanent} />
                  </Form.Item>
                );
              }}
            </Form.Item>
            <Form.Item 
              noStyle 
              shouldUpdate={(prev, curr) => prev.isConsumable !== curr.isConsumable || prev.typeSelect !== curr.typeSelect}
            >
              {({ getFieldValue }) => 
                getFieldValue('isConsumable') ? (
                  <Form.Item name="maxStack" label="Số lượng tối đa">
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 99" />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <Form.Item name="price" label="Giá bán" rules={[{required: true, message: "Nhập giá"}]}>
              <InputNumber style={{width: "100%"}} min={0} />
            </Form.Item>
            <Form.Item name="currency" label="Loại tiền tệ">
              <Select>
                <Select.Option value="coins">Xu (Coins)</Select.Option>
                <Select.Option value="petals">Cánh sen (Petals)</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Hình ảnh vật phẩm">
            <div style={{ marginBottom: 8 }}>
              <Radio.Group 
                value={form.getFieldValue('imageType') || 'url'} 
                onChange={(e) => {
                  form.setFieldsValue({ imageType: e.target.value });
                  // Force re-render to switch input
                  setImageType(e.target.value);
                }}
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="url">Dán liên kết</Radio.Button>
                <Radio.Button value="upload">Tải ảnh lên</Radio.Button>
              </Radio.Group>
            </div>
            
            <Form.Item name="imageType" noStyle hidden>
              <Input />
            </Form.Item>

            {imageType === 'upload' ? (
              <Form.Item name="image" noStyle>
                <ImageUpload />
              </Form.Item>
            ) : (
              <Form.Item name="image" noStyle>
                <Input placeholder="https://..." prefix={<LinkOutlined />} />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả công dụng hoặc ý nghĩa vật phẩm" />
          </Form.Item>

          <Form.Item style={{marginBottom: 0, textAlign: "right"}}>
            <Space>
              <Button onClick={model.closeForm}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={model.loading}>
                {model.currentRecord ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ShopManagement;
