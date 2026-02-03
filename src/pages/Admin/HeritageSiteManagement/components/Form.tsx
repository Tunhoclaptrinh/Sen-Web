import {
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  Form,
  Button,
  Tabs,
  message,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import {
  FormModal,
  TinyEditor,
  Button as StyledButton,
  DebounceSelect,
} from "@/components/common";
import ImageUpload from "@/components/common/Upload/ImageUpload";

import {
  HeritageType,
  SignificanceLevel,
  HeritageTypeLabels,
  SignificanceLevelLabels,
  HeritageRegion,
  HeritageRegionLabels,
  HeritageProvince,
  HeritageProvinceLabels,
  ProvincesByRegion,
  TimelineCategory,
  TimelineCategoryLabels,
} from "@/types";
import { useEffect, useState } from "react";
import artifactService from "@/services/artifact.service";
import heritageService from "@/services/heritage.service";
import historyService from "@/services/history.service";

interface HeritageFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<boolean>;
  initialValues?: any;
  loading?: boolean;
  title?: string;
  isEdit?: boolean;
}

const HeritageForm: React.FC<HeritageFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  isEdit = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    const initData = async () => {
      // 1. Chế độ Sửa (isEdit = true)
      if (open && initialValues && isEdit) {
        try {
          // Fetch labels for related IDs to show in DebounceSelect
          const [timelineRes, artifactsRes, relArtifactsRes, relHistoryRes] =
            await Promise.all([
              heritageService.getTimeline(initialValues.id),
              heritageService.getArtifacts(initialValues.id),
              initialValues.relatedArtifactIds?.length > 0
                ? artifactService.getAll({
                    ids: initialValues.relatedArtifactIds.join(","),
                  })
                : Promise.resolve({ success: true, data: [] }),
              initialValues.related_history_ids?.length > 0
                ? historyService.getAll({
                    ids: initialValues.related_history_ids.join(","),
                  })
                : Promise.resolve({ success: true, data: [] }),
            ]);

          let timeline = timelineRes.success
            ? timelineRes.data
            : initialValues.timeline || [];

          // Map related artifacts to {label, value}
          const artifactMap = new Map();
          if (artifactsRes.success && artifactsRes.data) {
            artifactsRes.data.forEach((art: any) =>
              artifactMap.set(art.id, art),
            );
          }
          if (relArtifactsRes.success && relArtifactsRes.data) {
            relArtifactsRes.data.forEach((art: any) =>
              artifactMap.set(art.id, art),
            );
          }

          const relatedArtifacts = (
            initialValues.relatedArtifactIds || []
          ).map((id: any) => {
            const art = artifactMap.get(typeof id === "object" ? id.value : id);
            return art
              ? { label: art.name, value: art.id }
              : typeof id === "object"
                ? id
                : { label: `ID: ${id}`, value: id };
          });

          // Map related history to {label, value}
          const relatedHistory = (initialValues.related_history_ids || []).map(
            (id: any) => {
              const hist = relHistoryRes.success
                ? relHistoryRes.data?.find(
                    (h: any) =>
                      h.id === (typeof id === "object" ? id.value : id),
                  )
                : null;
              return hist
                ? { label: hist.title, value: hist.id }
                : typeof id === "object"
                  ? id
                  : { label: `ID: ${id}`, value: id };
            },
          );

          const formattedValues = {
            ...initialValues,
            shortDescription:
              initialValues.short_description || initialValues.shortDescription,
            timeline: timeline,
            relatedArtifactIds: relatedArtifacts,
            related_history_ids: relatedHistory,
          };

          // Set available provinces based on region
          if (initialValues.region) {
            // Find the label for the region (handle both enum value and label)
            let regionLabel = initialValues.region;
            const regionKey = Object.keys(HeritageRegionLabels).find(
              (key) =>
                key === initialValues.region ||
                HeritageRegionLabels[key as HeritageRegion] ===
                  initialValues.region,
            ) as HeritageRegion;
            if (regionKey) {
              regionLabel = HeritageRegionLabels[regionKey];
              formattedValues.region = regionLabel; // Update region to label for form display
              setSelectedRegion(regionLabel);
              // Ensure available provinces are set immediately
              const provinces = ProvincesByRegion[regionKey] || [];
              setAvailableProvinces(provinces);
              
              // Validate current province exists in new list
              if (formattedValues.province && !provinces.includes(formattedValues.province)) {
                  formattedValues.province = undefined;
              }
            }
          }

          form.setFieldsValue(formattedValues);
        } catch (error) {
          console.error("Failed to init heritage data", error);
          // Fallback to initialValues if fetch fails
          const fallbackValues = {
            ...initialValues,
          };

          // Set available provinces based on region for fallback
          if (initialValues.region) {
            // Find the label for the region (handle both enum value and label)
            let regionLabel = initialValues.region;
            const regionKey = Object.keys(HeritageRegionLabels).find(
              (key) =>
                key === initialValues.region ||
                HeritageRegionLabels[key as HeritageRegion] ===
                  initialValues.region,
            ) as HeritageRegion;
            if (regionKey) {
              regionLabel = HeritageRegionLabels[regionKey];
              fallbackValues.region = regionLabel; // Update region to label for form display
              setSelectedRegion(regionLabel);
              setAvailableProvinces(ProvincesByRegion[regionKey]);
            }
          }

          form.setFieldsValue(fallbackValues);
        }
      } 
      // 2. Chế độ Thêm mới (isEdit = false) -> Reset form
      else if (open && !isEdit) {
        // Aggressively clear all fields
        const currentFields = form.getFieldsValue(true);
        const resetValues = Object.keys(currentFields).reduce((acc: any, key) => {
            acc[key] = undefined;
            return acc;
        }, {});
        form.setFieldsValue(resetValues);
        form.resetFields();

        setSelectedRegion("");
        setAvailableProvinces([]);
        form.setFieldsValue({
          isActive: true,
          unescoListed: false,
          yearEstablished: new Date().getFullYear(),
        });
      }
    };

    initData();
  }, [open, isEdit, initialValues, form]);

  const [activeTab, setActiveTab] = useState("1");
  const [availableProvinces, setAvailableProvinces] = useState<
    HeritageProvince[]
  >([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  useEffect(() => {
    if (open) setActiveTab("1");
  }, [open]);

  // Update available provinces when region changes
  useEffect(() => {
    if (selectedRegion) {
      const regionKey = Object.keys(HeritageRegionLabels).find(
        (key) => HeritageRegionLabels[key as HeritageRegion] === selectedRegion,
      ) as HeritageRegion;
      
      if (regionKey && ProvincesByRegion[regionKey]) {
        const newProvinces = ProvincesByRegion[regionKey];
        setAvailableProvinces(newProvinces);
        
        // Only clear province if it's not valid for the new region
        // And ensure we don't clear it immediately after init if it matches
        const currentProvince = form.getFieldValue("province");
        if (currentProvince && !newProvinces.includes(currentProvince)) {
          form.setFieldsValue({ province: undefined });
        }
      } else {
        setAvailableProvinces([]);
        form.setFieldsValue({ province: undefined });
      }
    } else {
      setAvailableProvinces([]);
      form.setFieldsValue({ province: undefined });
    }
  }, [selectedRegion, form]);

  const handleSubmitClick = async () => {
    try {
      // Validate only visible fields first to show UI feedback
      await form.validateFields();
      
      // Get ALL values including hidden tabs
      const values = form.getFieldsValue(true);
      await handleOk(values);
    } catch (error: any) {
      console.error("Validation failed:", error);

      if (error.errorFields && error.errorFields.length > 0) {
        const firstErrorField = error.errorFields[0].name[0];

        // Map fields to tabs
        const tab1Fields = [
          "image",
          "gallery",
          "shortDescription",
          "name",
          "type",
          "address",
          "region",
          "province",
          "cultural_period",
          "significance",
          "visit_hours",
          "yearEstablished",
          "entrance_fee",
          "unescoListed",
          "isActive",
        ];
        const tab2Fields = ["description"];
        const tab3Fields = [
          "relatedArtifactIds",
          "related_history_ids",
          "timeline",
        ];

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
      shortDescription: values.shortDescription, // Sync for compatibility
      // Convert region label back to enum value
      region:
        Object.keys(HeritageRegionLabels).find(
          (key) =>
            HeritageRegionLabels[key as HeritageRegion] === values.region,
        ) || values.region,
      image: (() => {
        const raw = Array.isArray(values.image) ? values.image[0] : values.image;
        if (typeof raw === "object") return raw?.url || raw?.response?.url || "";
        return raw || "";
      })(),
      gallery: values.gallery?.map((item: any) => 
        typeof item === "object" ? (item.url || item.response?.url || "") : item
      ) || [],
      timeline: values.timeline || [],
      relatedArtifactIds: values.relatedArtifactIds?.map((item: any) =>
        typeof item === "object" ? item.value : item,
      ) || [],
      related_history_ids: values.related_history_ids?.map((item: any) =>
        typeof item === "object" ? item.value : item,
      ) || [],
    };
    const success = await onSubmit(submitData);
    if (success) {
      form.resetFields();
    }
  };

  // Fetch function for Artifact Search
  const fetchArtifactList = async (search: string) => {
    try {
      const response = await artifactService.getAll({ q: search, limit: 10 });
      if (response.success && response.data) {
        return response.data.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
      }
      return [];
    } catch (error) {
      console.error("Fetch artifacts failed", error);
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
      title={isEdit ? "Cập nhật Di sản" : "Thêm mới Di sản"}
      width={1000}
      form={form}
      loading={loading}
      preserve={false}
      initialValues={{
        isActive: true,
        unescoListed: false,
        ...initialValues,
      }}
      footer={
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <StyledButton
            variant="outline"
            onClick={() => {
              form.resetFields();
              onCancel();
            }}
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
            label: "Thông tin chung",
            children: (
              <>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Hình ảnh đại diện" name="image">
                      <ImageUpload maxCount={1} />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      label="Thư viện ảnh (Tối đa 10 ảnh)"
                      name="gallery"
                    >
                      <ImageUpload maxCount={10} folder="gallery" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="shortDescription"
                      label="Mô tả ngắn"
                      rules={[
                        { required: true, message: "Vui lòng nhập mô tả ngắn" },
                      ]}
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="Mô tả ngắn gọn về di sản (hiện trên thẻ tin và đầu trang chi tiết)..."
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Tên Di Sản"
                      rules={[
                        { required: true, message: "Vui lòng nhập tên di sản" },
                      ]}
                    >
                      <Input placeholder="Nhập tên di sản (VD: Hoàng thành Thăng Long)" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="type"
                      label="Loại hình"
                      rules={[
                        { required: true, message: "Vui lòng chọn loại hình" },
                      ]}
                    >
                      <Select placeholder="Chọn loại hình">
                        {Object.values(HeritageType).map((type) => (
                          <Select.Option key={type} value={type}>
                            {HeritageTypeLabels[type]}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="address"
                      label="Địa chỉ"
                      rules={[
                        { required: true, message: "Vui lòng nhập địa chỉ" },
                      ]}
                    >
                      <Input placeholder="Nhập địa chỉ cụ thể" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="region"
                      label="Khu vực"
                      rules={[{ required: true }]}
                    >
                      <Select
                        placeholder="Chọn khu vực"
                        onChange={(value) => setSelectedRegion(value)}
                      >
                        {Object.values(HeritageRegion).map((region) => (
                          <Select.Option
                            key={region}
                            value={HeritageRegionLabels[region]}
                          >
                            {HeritageRegionLabels[region]}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="province" label="Tỉnh/Thành phố">
                      <Select
                        placeholder="Chọn tỉnh/thành phố"
                        disabled={!availableProvinces.length}
                      >
                        {availableProvinces.map((province) => (
                          <Select.Option key={province} value={province}>
                            {HeritageProvinceLabels[province]}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="culturalPeriod" label="Thời kỳ văn hóa">
                      <Input placeholder="VD: Triều Nguyễn, Thời Lý..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="significance" label="Tầm quan trọng">
                      <Select placeholder="Chọn quy mô">
                        {Object.values(SignificanceLevel).map((level) => (
                          <Select.Option key={level} value={level}>
                            {SignificanceLevelLabels[level]}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="visitHours" label="Giờ mở cửa">
                      <Input placeholder="VD: 08:30 - 17:00 hàng ngày" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="yearEstablished" label="Năm thành lập">
                      <InputNumber style={{ width: "100%" }} controls={false} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="entranceFee" label="Giá vé">
                      <InputNumber
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="unescoListed"
                          label="UNESCO"
                          valuePropName="checked"
                        >
                          <Switch
                            checkedChildren="CÓ"
                            unCheckedChildren="KHÔNG"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="isActive"
                          label="Trạng thái"
                          valuePropName="checked"
                        >
                          <Switch
                            checkedChildren="Hiện"
                            unCheckedChildren="Ẩn"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: "2",
            label: "Mô tả chi tiết",
            children: (
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              >
                <TinyEditor
                  key={isEdit ? `desc-edit-${initialValues?.id}` : "desc-create"}
                  height={400}
                  placeholder="Nhập mô tả chi tiết về di sản..."
                  enableImageUpload={true}
                  enableVideoEmbed={true}
                />
              </Form.Item>
            ),
          },
          {
            key: "3",
            label: "Dòng thời gian & Hiện vật",
            children: (
              <>
                <Form.Item
                  label="Hiện vật liên quan"
                  name="relatedArtifactIds"
                >
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm và chọn hiện vật..."
                    fetchOptions={fetchArtifactList}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item label="Lịch sử liên quan" name="related_history_ids">
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm và chọn bài viết lịch sử..."
                    fetchOptions={fetchHistoryList}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item label="Dòng thời gian" style={{ marginTop: 16 }}>
                  <Form.List name="timeline">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <div
                            key={key}
                            style={{
                              display: "flex",
                              marginBottom: 8,
                              alignItems: "baseline",
                              gap: "8px",
                            }}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, "year"]}
                              rules={[{ required: true, message: "Nhập năm" }]}
                              style={{ margin: 0 }}
                            >
                              <InputNumber
                                placeholder="Năm"
                                style={{ width: 80 }}
                                controls={false}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "title"]}
                              rules={[
                                { required: true, message: "Nhập tiêu đề" },
                              ]}
                              style={{ margin: 0 }}
                            >
                              <Input
                                placeholder="Tiêu đề sự kiện"
                                style={{ width: 200 }}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "category"]}
                              rules={[{ required: true, message: "Chọn loại" }]}
                              style={{ margin: 0 }}
                            >
                              <Select placeholder="Loại" style={{ width: 150 }}>
                                {Object.values(TimelineCategory).map((cat) => (
                                  <Select.Option key={cat} value={cat}>
                                    {TimelineCategoryLabels[cat]}
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "description"]}
                              style={{ flex: 1, margin: 0 }}
                            >
                              <Input
                                placeholder="Mô tả sự kiện"
                                style={{ width: "100%" }}
                              />
                            </Form.Item>
                            <MinusCircleOutlined
                              onClick={() => remove(name)}
                              style={{ color: "red" }}
                            />
                          </div>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Thêm sự kiện
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Form.Item>
              </>
            ),
          },
        ]}
      />
    </FormModal>
  );
};

export default HeritageForm;
