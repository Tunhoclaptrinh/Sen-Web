import {
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  Form,
  Tabs,
  message,
} from "antd";
import {
  FormModal,
  TinyEditor,
  Button as StyledButton,
} from "@/components/common";
import ImageUpload from "@/components/common/Upload/ImageUpload";
import {
  ArtifactType,
  ArtifactCondition,
  ArtifactTypeLabels,
  ArtifactConditionLabels,
} from "@/types";
import { useEffect, useState } from "react";
import heritageService from "@/services/heritage.service";
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
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    if (open) setActiveTab("1");
  }, [open]);

  useEffect(() => {
    const initData = async () => {
      if (open && initialValues && initialValues.id) {
        try {
          // Fetch labels for related IDs
          const [relHeritageRes, relHistoryRes] = await Promise.all([
            initialValues.related_heritage_ids?.length > 0
              ? heritageService.getAll({
                  ids: initialValues.related_heritage_ids.join(","),
                })
              : Promise.resolve({ success: true, data: [] }),
            initialValues.related_history_ids?.length > 0
              ? historyService.getAll({
                  ids: initialValues.related_history_ids.join(","),
                })
              : Promise.resolve({ success: true, data: [] }),
          ]);

          // Map related heritage to {label, value}
          const relatedHeri = (initialValues.related_heritage_ids || []).map(
            (id: any) => {
              const heri =
                relHeritageRes.success && relHeritageRes.data
                  ? relHeritageRes.data.find(
                      (h: any) =>
                        h.id === (typeof id === "object" ? id.value : id),
                    )
                  : null;
              return heri
                ? { label: heri.name, value: heri.id }
                : typeof id === "object"
                  ? id
                  : { label: `ID: ${id}`, value: id };
            },
          );

          // Map related history to {label, value}
          const relatedHistoryArr = (
            initialValues.related_history_ids || []
          ).map((id: any) => {
            const hist =
              relHistoryRes.success && relHistoryRes.data
                ? relHistoryRes.data.find(
                    (h: any) =>
                      h.id === (typeof id === "object" ? id.value : id),
                  )
                : null;
            return hist
              ? { label: hist.title, value: hist.id }
              : typeof id === "object"
                ? id
                : { label: `ID: ${id}`, value: id };
          });

          const formattedValues = {
            ...initialValues,
            short_description:
              initialValues.short_description || initialValues.shortDescription,
            related_heritage_ids: relatedHeri,
            related_history_ids: relatedHistoryArr,
          };
          form.setFieldsValue(formattedValues);
        } catch (error) {
          console.error("Failed to init artifact data", error);
          form.setFieldsValue(initialValues);
        }
      } else if (open) {
        form.resetFields();
        form.setFieldsValue({
          is_on_display: true,
          condition: ArtifactCondition.GOOD,
        });
      }
    };

    initData();
  }, [open, initialValues, form]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [heritageRes, categoryRes] = await Promise.all([
          heritageService.getAll({ _limit: 100 }),
          categoryService.getAll({ _limit: 100 }),
        ]);

        if (heritageRes.success) setHeritageSites(heritageRes.data || []);
        if (categoryRes.success) setCategories(categoryRes.data || []);
      } catch (error) {
        console.error("Failed to fetch form data", error);
      }
    };
    if (open) fetchInitialData();
  }, [open]);

  const handleSubmitClick = async () => {
    try {
      const values = await form.validateFields();
      await handleOk(values);
    } catch (error: any) {
      console.error("Validation failed:", error);

      if (error.errorFields && error.errorFields.length > 0) {
        const firstErrorField = error.errorFields[0].name[0];

        // Map fields to tabs
        const tab1Fields = [
          "image",
          "gallery",
          "short_description",
          "name",
          "artifact_type",
          "heritage_site_id",
          "category_id",
          "year_created",
          "material",
          "dimensions",
          "condition",
          "creator",
          "location_in_site",
          "is_on_display",
        ];
        const tab2Fields = [
          "description",
          "historical_context",
          "cultural_significance",
        ];
        const tab3Fields = ["related_heritage_ids", "related_history_ids"];

        if (tab1Fields.includes(firstErrorField)) {
          setActiveTab("1");
        } else if (tab2Fields.includes(firstErrorField)) {
          setActiveTab("2");
        } else if (tab3Fields.includes(firstErrorField)) {
          setActiveTab("3");
        }

        message.warning("Vui lòng kiểm tra lại thông tin trong các tab");
      }
    }
  };

  const handleOk = async (values: any) => {
    // Transform values before submit
    const submitData = {
      ...values,
      image: Array.isArray(values.image) ? values.image[0] || "" : values.image,
      shortDescription: values.short_description, // Sync for compatibility
      related_heritage_ids: values.related_heritage_ids?.map((item: any) =>
        typeof item === "object" ? item.value : item,
      ),
      related_history_ids: values.related_history_ids?.map((item: any) =>
        typeof item === "object" ? item.value : item,
      ),
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
          value: item.id,
        }));
      }
      return [];
    } catch (error) {
      console.error("Fetch heritage sites failed", error);
      return [];
    }
  };

  // Fetch function for History Articles Search
  const fetchHistoryList = async (search: string) => {
    try {
      const response = await historyService.getAll({ q: search, limit: 10 });
      if (response.success && response.data) {
        return response.data.map((item: any) => ({
          label: item.title,
          value: item.id,
        }));
      }
      return [];
    } catch (error) {
      console.error("Fetch history articles failed", error);
      return [];
    }
  };

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
      footer={
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <StyledButton
            variant="outline"
            onClick={onCancel}
            style={{ minWidth: "120px" }}
          >
            Hủy
          </StyledButton>
          <StyledButton
            variant="primary"
            loading={loading}
            onClick={handleSubmitClick}
            style={{ minWidth: "120px" }}
          >
            Lưu lại
          </StyledButton>
        </div>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "1",
            label: "Thông tin cơ bản",
            children: (
              <>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Hình ảnh đại diện" name="image">
                      <ImageUpload maxCount={1} />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item label="Thư viện ảnh" name="gallery">
                      <ImageUpload maxCount={10} folder="artifacts/gallery" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="short_description"
                      label="Mô tả ngắn"
                      rules={[
                        { required: true, message: "Vui lòng nhập mô tả ngắn" },
                      ]}
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="Mô tả ngắn gọn về hiện vật..."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Tên Hiện vật"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập tên hiện vật",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập tên hiện vật..." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="artifact_type"
                      label="Loại hình"
                      rules={[
                        { required: true, message: "Vui lòng chọn loại hình" },
                      ]}
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
                  <Col span={12}>
                    <Form.Item
                      name="heritage_site_id"
                      label="Thuộc Di sản"
                      rules={[
                        { required: true, message: "Vui lòng chọn di sản" },
                      ]}
                    >
                      <Select
                        placeholder="Chọn di sản"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                      >
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
                      rules={[
                        { required: true, message: "Vui lòng chọn phân loại" },
                      ]}
                    >
                      <Select
                        placeholder="Chọn loại hình văn hóa"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                      >
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
                      <InputNumber style={{ width: "100%" }} controls={false} />
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
                      <Input placeholder="Tên tác giả..." />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="location_in_site" label="Vị trí trưng bày">
                      <Input placeholder="Phòng số X..." />
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
                      <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: "2",
            label: "Mô tả chi tiết",
            children: (
              <>
                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                >
                  <TinyEditor
                    height={350}
                    placeholder="Mô tả chi tiết về hiện vật..."
                    enableImageUpload={true}
                    enableVideoEmbed={true}
                  />
                </Form.Item>

                <Form.Item name="historical_context" label="Bối cảnh lịch sử">
                  <TinyEditor
                    height={250}
                    placeholder="Mô tả bối cảnh lịch sử..."
                  />
                </Form.Item>

                <Form.Item name="cultural_significance" label="Ý nghĩa văn hóa">
                  <TinyEditor height={250} placeholder="Giá trị văn hóa..." />
                </Form.Item>
              </>
            ),
          },
          {
            key: "3",
            label: "Liên kết liên quan",
            children: (
              <>
                <Form.Item
                  label="Di sản liên quan"
                  name="related_heritage_ids"
                  tooltip="Các địa điểm di sản gắn liền với hiện vật này"
                >
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm di sản..."
                    fetchOptions={fetchHeritageList}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label="Lịch sử liên quan"
                  name="related_history_ids"
                  tooltip="Các bài viết lịch sử bổ trợ thông tin cho hiện vật"
                >
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm bài viết..."
                    fetchOptions={fetchHistoryList}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </>
            ),
          },
        ]}
      />
    </FormModal>
  );
};

export default ArtifactForm;
