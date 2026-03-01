import React from "react";
import {Button, Space, Modal, Form, Input, Tag, Select, InputNumber, Switch, Card} from "antd";
import {FlagOutlined} from "@ant-design/icons";
import {useQuestModel} from "./model";
import DataTable from "@/components/common/DataTable";
import {useAuth} from "@/hooks/useAuth";

const QuestManagement: React.FC = () => {
  const model = useQuestModel();
  const {user} = useAuth();

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Loại nhiệm vụ",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const colors: Record<string, string> = {
          daily: "cyan",
          main: "gold",
          achievement: "purple",
        };
        return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Phần thưởng",
      key: "rewards",
      render: (_: unknown, record: Record<string, any>) => {
        const reward = Array.isArray(record.rewards) ? record.rewards[0] : record.rewards;
        return (
          <Space>
            {reward?.coins && <Tag color="gold">{reward.coins} Xu</Tag>}
            {reward?.experience && <Tag color="blue">{reward.experience} Exp</Tag>}
            {reward?.petals && <Tag color="pink">{reward.petals} Hoa</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (val: boolean) => (val ? <Tag color="green">KÍCH HOẠT</Tag> : <Tag>ẨN</Tag>),
    },
  ];

  return (
    <>
      <DataTable
        title="Quản lý Nhiệm vụ (Quests)"
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
        title={model.currentRecord ? "Chỉnh sửa nhiệm vụ" : "Tạo nhiệm vụ mới"}
        open={model.formVisible}
        onCancel={model.closeForm}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          layout="vertical"
          initialValues={{
            ...model.currentRecord,
            type: model.currentRecord?.type || "daily",
            isActive: model.currentRecord?.isActive ?? true,
            rewards: Array.isArray(model.currentRecord?.rewards) ? model.currentRecord.rewards[0] : model.currentRecord?.rewards,
            requirements: Array.isArray(model.currentRecord?.requirements) ? model.currentRecord.requirements[0] : model.currentRecord?.requirements
          }}
          onFinish={(values) => {
            const formattedValues = {
              ...values,
              rewards: values.rewards ? [values.rewards] : [],
              requirements: values.requirements ? [values.requirements] : [] // Simplistic mapping, real app might have dynamic lists
            };
            model.handleSubmit(formattedValues);
          }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề nhiệm vụ"
            rules={[
              {required: true, message: "Vui lòng nhập tiêu đề"},
              {min: 5, message: "Tiêu đề nhiệm vụ yêu cầu tối thiểu 5 ký tự"},
            ]}
          >
            <Input prefix={<FlagOutlined />} placeholder="Ví dụ: Hoàn thành 3 màn chơi" />
          </Form.Item>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <Form.Item name="type" label="Loại nhiệm vụ">
              <Select>
                <Select.Option value="daily">Daily (Hàng ngày)</Select.Option>
                <Select.Option value="main">Main (Chính tuyến)</Select.Option>
                <Select.Option value="achievement">Achievement (Thành tựu)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="isActive" label="Đang kích hoạt" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Mô tả nhiệm vụ"
            rules={[{min: 10, message: "Mô tả nhiệm vụ yêu cầu tối thiểu 10 ký tự"}]}
          >
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết cách thực hiện" />
          </Form.Item>

          <Card size="small" title="Phần thưởng" style={{marginBottom: 16}}>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", paddingTop: 8}}>
              <Form.Item name={["rewards", "coins"]} label="Số Xu thưởng">
                <InputNumber style={{width: "100%"}} min={0} />
              </Form.Item>
              <Form.Item name={["rewards", "experience"]} label="Kinh nghiệm (Exp)">
                <InputNumber style={{width: "100%"}} min={0} />
              </Form.Item>
            </div>
          </Card>

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

export default QuestManagement;
