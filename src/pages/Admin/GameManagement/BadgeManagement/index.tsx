import React from "react";
import {Button, Space, Modal, Form, Input, Tag, Select, InputNumber, Switch} from "antd";
import {useBadgeModel} from "./model";
import DataTable from "@/components/common/DataTable";
import {useAuth} from "@/hooks/useAuth";

const BadgeManagement: React.FC = () => {
  const model = useBadgeModel();
  const {user} = useAuth();

  const columns = [
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 80,
      align: "center" as const,
      render: (icon: string) => <span style={{fontSize: "24px"}}>{icon}</span>,
    },
    {
      title: "Tên huy hiệu",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Điều kiện",
      key: "condition",
      render: (_: any, record: any) => (
        <span>
          {record.conditionType}: {record.conditionValue}
        </span>
      ),
    },
    {
      title: "Phần thưởng",
      key: "rewards",
      render: (_: any, record: any) => (
        <Space>
          {record.rewardCoins && <Tag color="gold">{record.rewardCoins} Xu</Tag>}
          {record.rewardPetals && <Tag color="pink">{record.rewardPetals} Cánh sen</Tag>}
        </Space>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Quản lý Huy hiệu & Thành tựu"
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
        batchOperations={true}
        onBatchDelete={model.batchDelete}
        rowSelection={{
          selectedRowKeys: model.selectedIds,
          onChange: model.setSelectedIds,
        }}
        // Import/Export
        importable={true}
        importLoading={model.importLoading}
        onImport={model.importData}
        onDownloadTemplate={model.downloadTemplate}
        exportable={true}
        exportLoading={model.exportLoading}
        onExport={model.exportData}
      />

      <Modal
        title={model.currentRecord ? "Chỉnh sửa huy hiệu" : "Tạo huy hiệu mới"}
        open={model.formVisible}
        onCancel={model.closeForm}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          layout="vertical"
          initialValues={model.currentRecord || {isActive: true, conditionType: "level_reached"}}
          onFinish={model.handleSubmit}
        >
          <div style={{display: "grid", gridTemplateColumns: "1fr 3fr", gap: "16px"}}>
            <Form.Item name="icon" label="Icon (Emoji)" rules={[{required: true, message: "Nhập icon"}]}>
              <Input placeholder="🏆" maxLength={2} />
            </Form.Item>
            <Form.Item name="name" label="Tên huy hiệu" rules={[{required: true, message: "Nhập tên"}]}>
              <Input placeholder="Ví dụ: Nhà sử học nhí" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Cách đạt được huy hiệu này" />
          </Form.Item>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <Form.Item
              name="conditionType"
              label="Loại điều kiện"
              tooltip="Điều kiện để người dùng đạt được huy hiệu này"
            >
              <Select>
                <Select.Option value="level_reached">Đạt cấp độ (VD: 5)</Select.Option>
                <Select.Option value="quests_completed">Hoàn thành nhiệm vụ (VD: 10)</Select.Option>
                <Select.Option value="artifacts_scanned">Quét hiện vật (VD: 1)</Select.Option>
                <Select.Option value="days_logged">Số ngày đăng nhập (VD: 7)</Select.Option>
                <Select.Option value="perfect_quiz">Trả lời đúng câu hỏi (VD: 50)</Select.Option>
                <Select.Option value="chapter_completed">Hoàn thành Chapter (VD: 1)</Select.Option>
                <Select.Option value="characters_collected">Thu thập nhân vật (VD: 10)</Select.Option>
                <Select.Option value="clues_collected">Thu thập manh mối (VD: 100)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="conditionValue"
              label="Giá trị mục tiêu"
              rules={[
                {required: true, message: "Nhập giá trị"},
                {type: "number", min: 1, message: "Giá trị phải lớn hơn 0"},
              ]}
            >
              <InputNumber style={{width: "100%"}} min={1} placeholder="VD: 5" />
            </Form.Item>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <Form.Item name="rewardCoins" label="Thưởng Xu">
              <InputNumber style={{width: "100%"}} min={0} placeholder="0" />
            </Form.Item>
            <Form.Item name="rewardPetals" label="Thưởng Cánh sen">
              <InputNumber style={{width: "100%"}} min={0} placeholder="0" />
            </Form.Item>
          </div>

          <Form.Item name="isActive" label="Đang kích hoạt" valuePropName="checked">
            <Switch />
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

export default BadgeManagement;
