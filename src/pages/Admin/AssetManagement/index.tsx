import React from "react";
import {Button, Space, Modal, Form, Input, Select, Tag, Switch, InputNumber} from "antd";
import {QrcodeOutlined, DownloadOutlined, ExperimentOutlined} from "@ant-design/icons";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {useAssetModel} from "./model";
import DataTable from "@/components/common/DataTable";
import {useAuth} from "@/hooks/useAuth";
import {ITEM_TYPES} from "@/config/constants";

const AssetManagement: React.FC = () => {
  const [form] = Form.useForm();
  const model = useAssetModel();
  const {user} = useAuth();

  const columns = [
    {
      title: "Mã (QR)",
      dataIndex: "code",
      key: "code",
      width: 150,
      render: (code: string, record: any) => (
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <QRCodeSVG value={code} size={40} />
          <Tag icon={<QrcodeOutlined />} color="blue">
            {code}
          </Tag>
          <Button 
            type="link" 
            size="small" 
            icon={<DownloadOutlined />} 
            onClick={() => model.downloadQRCode(code, record.name)}
          >
            Tải mã
          </Button>
          {/* Hidden Canvas for Downloading */}
          <div style={{ display: 'none' }}>
            <QRCodeCanvas 
              id={`qr-code-download-${code}`} 
              value={code} 
              size={512} 
              includeMargin={true}
            />
          </div>
        </Space>
      ),
    },
    {
      title: "Tên đối tượng",
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
      title: "Phần thưởng",
      key: "reward",
      render: (_: any, record: any) => (
        <Space>
          {record.rewardCoins && <Tag color="gold">{record.rewardCoins} Xu</Tag>}
          {record.rewardPetals && <Tag color="pink">{record.rewardPetals} Cánh sen</Tag>}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (val: boolean) => (val ? <Tag color="green">HOẠT ĐỘNG</Tag> : <Tag>KHOÁ</Tag>),
    },
  ];

  return (
    <>
      <DataTable
        title="Quản lý Đối tượng Quét (Scan Assets)"
        user={user}
        loading={model.loading}
        columns={columns}
        dataSource={model.data}
        pagination={model.pagination}
        onChange={model.handleTableChange}
        searchable
        onSearch={model.search}
        onAdd={model.openCreate}
        onEdit={model.openEdit}
        onDelete={model.remove}
      />

      <Modal
        title={model.currentRecord ? "Chỉnh sửa đối tượng quét" : "Tạo đối tượng quét mới"}
        open={model.formVisible}
        onCancel={model.closeForm}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={
            model.currentRecord || {type: ITEM_TYPES.ARTIFACT, isActive: true, rewardCoins: 100, rewardPetals: 1}
          }
          onFinish={model.handleSubmit}
        >
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <Form.Item
              name="code"
              label="Mã định danh (QR Code)"
              rules={[{required: true, message: "Vui lòng nhập mã"}]}
            >
              <Input 
                placeholder="Ví dụ: QR001, ART_VN_01" 
                suffix={
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<ExperimentOutlined />} 
                    onClick={() => model.handleGenerateCode(form)}
                  >
                    Tự tạo
                  </Button>
                }
              />
            </Form.Item>
            <Form.Item
              name="name"
              label="Tên đối tượng"
              rules={[
                {required: true, message: "Vui lòng nhập tên"},
                {min: 3, message: "Tên đối tượng yêu cầu tối thiểu 3 ký tự"},
              ]}
            >
              <Input placeholder="Ví dụ: Trống đồng Ngọc Lũ" />
            </Form.Item>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px"}}>
            <Form.Item name="type" label="Loại đối tượng">
              <Select>
                <Select.Option value={ITEM_TYPES.ARTIFACT}>Artifact (Hiện vật)</Select.Option>
                <Select.Option value={ITEM_TYPES.HERITAGE_SITE}>Heritage Site (Di sản)</Select.Option>
                <Select.Option value="other">Other (Khác)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="referenceId" label="ID tham chiếu" rules={[{required: true, message: "Vui lòng nhập ID"}]}>
              <InputNumber style={{width: "100%"}} placeholder="ID của hiện vật/di sản" />
            </Form.Item>
            <Form.Item name="isActive" label="Đang hoạt động" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <Form.Item name="rewardCoins" label="Thưởng Xu khi quét">
              <InputNumber style={{width: "100%"}} min={0} />
            </Form.Item>
            <Form.Item name="rewardPetals" label="Thưởng Cánh sen khi quét">
              <InputNumber style={{width: "100%"}} min={0} />
            </Form.Item>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <Form.Item name="latitude" label="Vĩ độ (Latitude)">
              <InputNumber style={{width: "100%"}} step={0.000001} />
            </Form.Item>
            <Form.Item name="longitude" label="Kinh độ (Longitude)">
              <InputNumber style={{width: "100%"}} step={0.000001} />
            </Form.Item>
          </div>

          {model.formVisible && (
            <Form.Item label="Xem trước mã QR" style={{ textAlign: 'center' }}>
               <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.code !== currentValues.code}>
                {({ getFieldValue }) => {
                  const code = getFieldValue('code');
                  return code ? (
                    <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', display: 'inline-block' }}>
                      <QRCodeSVG value={code} size={150} includeMargin={true} />
                    </div>
                  ) : <Tag color="warning">Nhập mã để xem trước QR</Tag>;
                }}
              </Form.Item>
            </Form.Item>
          )}

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

export default AssetManagement;
