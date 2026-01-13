import { Input, InputNumber, Select, Switch, Row, Col, Form, DatePicker } from "antd";
import { FormModal, TinyEditor } from "@/components/common";
import {
  ArtifactType,
  ArtifactCondition,
  ArtifactTypeLabels,
  ArtifactConditionLabels,
} from "@/types";
import { useEffect, useState } from "react";
import heritageService from "@/services/heritage.service";
import dayjs from "dayjs";

interface ArtifactFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<boolean>;
  initialValues?: any;
  loading?: boolean;
  title?: string;
}

const ArtifactForm: React.FC<ArtifactFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  title = "Thông tin Hiện vật",
}) => {
  const [form] = Form.useForm();
  const [heritageSites, setHeritageSites] = useState<any[]>([]);

  useEffect(() => {
    if (open && initialValues) {
      const formattedValues = {
        ...initialValues,
        year_created: initialValues.year_created
          ? dayjs(String(initialValues.year_created), "YYYY")
          : null,
      };
      form.setFieldsValue(formattedValues);
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    const fetchHeritageSites = async () => {
      try {
        const response = await heritageService.getAll({ limit: 100 });
        if (response.success) {
          setHeritageSites(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch heritage sites", error);
      }
    };
    if (open) fetchHeritageSites();
  }, [open]);

  const handleOk = async (values: any) => {
    const submitData = {
      ...values,
      year_created: values.year_created ? values.year_created.year() : null,
    };
    await onSubmit(submitData);
  };

  return (
    <FormModal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      title={title}
      width={1200}
      form={form}
      loading={loading}
      initialValues={{
        is_on_display: true,
        condition: ArtifactCondition.GOOD,
        ...initialValues,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Tên Hiện vật"
            rules={[{ required: true, message: "Vui lòng nhập tên hiện vật" }]}
          >
            <Input placeholder="Nhập tên hiện vật (VD: Trống đồng Ngọc Lũ)" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="artifact_type"
            label="Loại hình"
            rules={[{ required: true, message: "Vui lòng chọn loại hình" }]}
          >
            <Select placeholder="Chọn loại hình">
              {Object.values(ArtifactType).map((type) => (
                <Select.Option key={type} value={type}>
                  {ArtifactTypeLabels[type]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="description"
        label="Mô tả chi tiết"
        rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
      >
        <TinyEditor
          height={400}
          placeholder="Nhập mô tả chi tiết về hiện vật, lịch sử, đặc điểm, ý nghĩa văn hóa..."
          enableImageUpload={true}
          enableVideoEmbed={true}
        />
      </Form.Item>

      <Form.Item name="historical_context" label="Bối cảnh lịch sử">
        <TinyEditor
          height={300}
          placeholder="Mô tả bối cảnh lịch sử ra đời của hiện vật..."
        />
      </Form.Item>

      <Form.Item name="cultural_significance" label="Ý nghĩa văn hóa">
        <TinyEditor
          height={300}
          placeholder="Giá trị văn hóa, tinh thần mà hiện vật mang lại..."
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="heritage_site_id" label="Thuộc Di sản">
            <Select placeholder="Chọn di sản" allowClear>
              {heritageSites.map((site) => (
                <Select.Option key={site.id} value={site.id}>
                  {site.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="condition" label="Tình trạng">
            <Select placeholder="Chọn tình trạng">
              {Object.values(ArtifactCondition).map((cond) => (
                <Select.Option key={cond} value={cond}>
                  {ArtifactConditionLabels[cond]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="year_created" label="Năm sáng tạo">
            <DatePicker
              picker="year"
              format="YYYY"
              placeholder="Chọn năm"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="material" label="Chất liệu">
            <Input placeholder="Vàng, Đồng, Gốm..." />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="dimensions" label="Kích thước">
            <Input placeholder="Dài x Rộng x Cao" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="creator" label="Tác giả/Nghệ nhân">
            <Input placeholder="Tên tác giả nếu có" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="location_in_site" label="Vị trí trưng bày">
            <Input placeholder="Phòng số X, tầng Y..." />
          </Form.Item>
        </Col>
      </Row>

      <Row>
        <Col span={6}>
          <Form.Item
            name="is_on_display"
            label="Đang trưng bày"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </FormModal>
  );
};

export default ArtifactForm;
