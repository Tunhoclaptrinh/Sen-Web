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
import historyService from "@/services/history.service";
import categoryService from "@/services/category.service";
import DebounceSelect from "@/components/common/Select/DebounceSelect";

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
  const [categories, setCategories] = useState<any[]>([]);

  // Prepare initialValues so DatePicker receives dayjs objects instead of raw numbers
  const preparedInitialValues = (() => {
    if (!initialValues) return undefined;
    const prepared = { ...initialValues } as any;
    const y = initialValues.year_created;
    if (y != null && !(typeof y === "object" && typeof (y as any).isValid === "function")) {
      prepared.year_created = dayjs(String(y), "YYYY");
    }
    return prepared;
  })();

  useEffect(() => {
    const initData = async () => {
        if (open && initialValues && initialValues.id) {
            try {
                // Fetch labels for related IDs
                const [relHeritageRes, relHistoryRes] = await Promise.all([
                    initialValues.related_heritage_ids?.length > 0 
                      ? heritageService.getAll({ ids: initialValues.related_heritage_ids.join(',') })
                      : Promise.resolve({ success: true, data: [] }),
                    initialValues.related_history_ids?.length > 0
                      ? historyService.getAll({ ids: initialValues.related_history_ids.join(',') })
                      : Promise.resolve({ success: true, data: [] })
                ]);

                // Map related heritage to {label, value}
                const relatedHeri = (initialValues.related_heritage_ids || []).map((id: any) => {
                    const heri = relHeritageRes.success && relHeritageRes.data 
                      ? relHeritageRes.data.find((h: any) => h.id === (typeof id === 'object' ? id.value : id)) 
                      : null;
                    return heri ? { label: heri.name, value: heri.id } : (typeof id === 'object' ? id : { label: `ID: ${id}`, value: id });
                });

                // Map related history to {label, value}
                const relatedHistoryArr = (initialValues.related_history_ids || []).map((id: any) => {
                    const hist = relHistoryRes.success && relHistoryRes.data 
                      ? relHistoryRes.data.find((h: any) => h.id === (typeof id === 'object' ? id.value : id)) 
                      : null;
                    return hist ? { label: hist.title, value: hist.id } : (typeof id === 'object' ? id : { label: `ID: ${id}`, value: id });
                });

                const formattedValues = {
                    ...initialValues,
                    short_description: initialValues.short_description || initialValues.shortDescription,
                    related_heritage_ids: relatedHeri,
                    related_history_ids: relatedHistoryArr,
                    year_created: initialValues.year_created
                      ? dayjs(String(initialValues.year_created), "YYYY")
                      : null,
                };
                form.setFieldsValue(formattedValues);
            } catch (error) {
                console.error("Failed to init artifact data", error);
                const fallback = {
                  ...initialValues,
                  year_created: initialValues?.year_created ? dayjs(String(initialValues.year_created), "YYYY") : null,
                };
                form.setFieldsValue(fallback);
            }
        } else if (open) {
            form.resetFields();
        }
    };

    initData();
  }, [open, initialValues, form]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [heritageRes, categoryRes] = await Promise.all([
          heritageService.getAll({ limit: 100 }),
          categoryService.getAll({ limit: 100 })
        ]);
        
        if (heritageRes.success) setHeritageSites(heritageRes.data || []);
        if (categoryRes.success) setCategories(categoryRes.data || []);
      } catch (error) {
        console.error("Failed to fetch form data", error);
      }
    };
    if (open) fetchInitialData();
  }, [open]);

  const handleOk = async (values: any) => {
    // Transform values before submit
    const submitData = {
        ...values,
        shortDescription: values.short_description, // Sync for compatibility
        related_heritage_ids: values.related_heritage_ids?.map((item: any) => 
          typeof item === 'object' ? item.value : item
        ),
        related_history_ids: values.related_history_ids?.map((item: any) => 
          typeof item === 'object' ? item.value : item
        ),
        year_created: values.year_created ? values.year_created.year() : null,
    };
    await onSubmit(submitData);
  };

  // Fetch function for Heritage Sites Search
  const fetchHeritageList = async (search: string) => {
    try {
        const response = await heritageService.getAll({ q: search, limit: 10 });
        if (response.success && response.data) {
            return response.data.map((item: any) => ({
                label: item.name,
                value: item.id
            }));
        }
        return [];
    } catch (error) {
        console.error("Fetch heritage sites failed", error);
        return [];
    }
  }

  // Fetch function for History Articles Search
  const fetchHistoryList = async (search: string) => {
    try {
        const response = await historyService.getAll({ q: search, limit: 10 });
        if (response.success && response.data) {
            return response.data.map((item: any) => ({
                label: item.title,
                value: item.id
            }));
        }
        return [];
    } catch (error) {
        console.error("Fetch history articles failed", error);
        return [];
    }
  }

  return (
    <FormModal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      title={title}
      width={1000}
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

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="short_description"
              label="Mô tả ngắn"
              rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn" }]}
            >
              <Input.TextArea rows={2} placeholder="Mô tả ngắn gọn về hiện vật..." />
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
          <Form.Item
            name="heritage_site_id"
            label="Thuộc Di sản"
            rules={[{ required: true, message: "Vui lòng chọn di sản" }]}
          >
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
          <Form.Item
            name="category_id"
            label="Phân loại"
            rules={[{ required: true, message: "Vui lòng chọn phân loại" }]}
          >
            <Select placeholder="Chọn loại hình văn hóa" allowClear>
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
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
        <Col span={8}>
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
        <Col span={8}>
          <Form.Item name="creator" label="Tác giả/Nghệ nhân">
            <Input placeholder="Tên tác giả nếu có" />
          </Form.Item>
        </Col>
        <Col span={8}>
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

      {/* Related Items Section */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <h3 style={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>Liên kết & Tham chiếu</h3>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Di sản liên quan" name="related_heritage_ids">
             <DebounceSelect
                mode="multiple"
                placeholder="Tìm kiếm và chọn di sản..."
                fetchOptions={fetchHeritageList}
                style={{ width: '100%' }}
             />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Lịch sử liên quan" name="related_history_ids">
             <DebounceSelect
                mode="multiple"
                placeholder="Tìm kiếm và chọn bài viết lịch sử..."
                fetchOptions={fetchHistoryList}
                style={{ width: '100%' }}
             />
          </Form.Item>
        </Col>
      </Row>
    </FormModal>
  );
};

export default ArtifactForm;
