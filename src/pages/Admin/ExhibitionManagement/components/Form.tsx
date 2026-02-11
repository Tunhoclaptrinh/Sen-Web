import React, {useEffect} from "react";
import {Form, Input, Switch, DatePicker, Transfer, Space, Button} from "antd";
import {PictureOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {useAuth} from "@/hooks/useAuth";

interface ExhibitionFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  availableArtifacts: any[];
  isEdit?: boolean;
}

const ExhibitionForm: React.FC<ExhibitionFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading,
  availableArtifacts,
  isEdit,
}) => {
  const [form] = Form.useForm();
  const {user} = useAuth();

  const memoizedInitialValues = React.useMemo(() => {
    if (!initialValues)
      return {
        isActive: true,
        isPermanent: false,
        curator: user?.name,
        author: user?.name,
      };

    return {
      ...initialValues,
      publishDate: initialValues.publishDate ? dayjs(initialValues.publishDate) : undefined,
      dates:
        initialValues.startDate && initialValues.endDate
          ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
          : undefined,
    };
  }, [initialValues, user]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(memoizedInitialValues);
    }
  }, [memoizedInitialValues, form, initialValues]);

  const handleFinish = (values: any) => {
    const {dates, ...rest} = values;
    if (dates && Array.isArray(dates) && dates.length === 2 && !rest.isPermanent) {
      rest.startDate = dates[0].toISOString();
      rest.endDate = dates[1].toISOString();
    }
    onSubmit(rest);
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish} initialValues={memoizedInitialValues}>
      <Form.Item
        name="name"
        label="Tên triển lãm"
        rules={[
          {required: true, message: "Vui lòng nhập tên"},
          {min: 5, message: "Tên triển lãm yêu cầu tối thiểu 5 ký tự"},
        ]}
      >
        <Input prefix={<PictureOutlined />} placeholder="Ví dụ: Triển lãm Gốm Chu Đậu" />
      </Form.Item>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
        <Form.Item name="theme" label="Chủ đề" rules={[{min: 2, message: "Chủ đề yêu cầu tối thiểu 2 ký tự"}]}>
          <Input placeholder="Ví dụ: Gốm sứ, Lịch sử" />
        </Form.Item>
        <Form.Item name="curator" label="Người phụ trách">
          <Input placeholder="Tên cán bộ phụ trách" readOnly />
        </Form.Item>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
        <Form.Item name="author" label="Tác giả">
          <Input readOnly placeholder="Hệ thống tự động" />
        </Form.Item>
        <Form.Item name="publishDate" label="Ngày xuất bản">
          <DatePicker
            style={{width: "100%"}}
            disabled
            format="DD/MM/YYYY HH:mm"
            showTime
            placeholder="Tự động khi duyệt"
          />
        </Form.Item>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
        <Form.Item name="isPermanent" label="Triển lãm vĩnh viễn?" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="isActive" label="Công khai" valuePropName="checked">
          <Switch />
        </Form.Item>
      </div>

      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isPermanent !== curr.isPermanent}>
        {({getFieldValue}) =>
          !getFieldValue("isPermanent") && (
            <Form.Item
              name="dates"
              label="Thời gian diễn ra"
              rules={[{required: true, message: "Vui lòng chọn thời gian"}]}
            >
              <DatePicker.RangePicker style={{width: "100%"}} />
            </Form.Item>
          )
        }
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[
          {required: true, message: "Vui lòng nhập mô tả"},
          {min: 20, message: "Mô tả triển lãm yêu cầu tối thiểu 20 ký tự"},
        ]}
      >
        <Input.TextArea rows={4} placeholder="Mô tả nội dung triển lãm" />
      </Form.Item>

      <Form.Item name="artifactIds" label="Chọn hiện vật trưng bày">
        <Transfer
          dataSource={availableArtifacts as any[]}
          showSearch
          listStyle={{
            width: "100%",
            height: 300,
          }}
          titles={["Hiện vật kho", "Đã chọn"]}
          render={(item) => item.name}
          rowKey={(item) => item.id}
          filterOption={(inputValue, item) => item.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1}
        />
      </Form.Item>

      <Form.Item style={{marginBottom: 0, textAlign: "right"}}>
        <Space>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit || initialValues ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ExhibitionForm;
