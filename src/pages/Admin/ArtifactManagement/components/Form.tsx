import {Input, InputNumber, Select, Switch, Row, Col, Form, Tabs, message, Radio, Space} from "antd";
import {FormModal, TinyEditor, Button as StyledButton, DebounceSelect} from "@/components/common";
import {LinkOutlined} from "@ant-design/icons";
import {useAuth} from "@/hooks/useAuth";
import ImageUpload from "@/components/common/Upload/ImageUpload";
import {ArtifactType, ArtifactCondition, ArtifactTypeLabels, ArtifactConditionLabels} from "@/types";
import {useEffect, useState, useCallback} from "react";
import heritageService from "@/services/heritage.service";
import historyService from "@/services/history.service";
import artifactService from "@/services/artifact.service";
import adminLevelService from "@/services/admin-level.service";
import categoryService from "@/services/category.service";

interface ArtifactFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<boolean>;
  initialValues?: any;
  loading?: boolean;
  title?: string;
  isEdit?: boolean;
}

const ArtifactForm: React.FC<ArtifactFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  isEdit = false,
}) => {
  const {user} = useAuth();
  const [form] = Form.useForm();
  const [heritageSites, setHeritageSites] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("1");
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  const [showCustomType, setShowCustomType] = useState(false);

  const onTypeChange = useCallback((value: string) => {
    const isOther = value === 'other';
    setShowCustomType(isOther);
    if (!isOther) {
      form.setFieldsValue({ artifactType: value });
    }
  }, [form]);

  useEffect(() => {
    if (open) setActiveTab("1");
  }, [open]);

  useEffect(() => {
    const initData = async () => {
      // 1. Chế độ Sửa (isEdit = true)
      if (open && isEdit && initialValues) {
        try {
          // Fetch labels for related IDs
          const [relHeritageRes, relHistoryRes, relArtifactRes, relLevelsRes] = await Promise.all([
            initialValues.relatedHeritageIds?.length > 0
              ? heritageService.getAll({
                  ids: initialValues.relatedHeritageIds.join(","),
                })
              : Promise.resolve({success: true, data: []}),
            initialValues.relatedHistoryIds?.length > 0
              ? historyService.getAll({
                  ids: initialValues.relatedHistoryIds.join(","),
                })
              : Promise.resolve({success: true, data: []}),
            initialValues.relatedArtifactIds?.length > 0
              ? artifactService.getAll({
                  ids: initialValues.relatedArtifactIds.join(","),
                })
              : Promise.resolve({success: true, data: []}),
            initialValues.relatedLevelIds?.length > 0
              ? adminLevelService.getAll({
                  ids: initialValues.relatedLevelIds.join(","),
                })
              : Promise.resolve({success: true, data: []}),
          ]);

          // Map related heritage
          const relatedHeri = (initialValues.relatedHeritageIds || []).map((id: any) => {
            const heri =
              relHeritageRes.success && relHeritageRes.data
                ? relHeritageRes.data.find((h: any) => h.id === (typeof id === "object" ? id.value : id))
                : null;
            return heri
              ? {label: heri.name, value: heri.id}
              : typeof id === "object"
                ? id
                : {label: `ID: ${id}`, value: id};
          });

          // Map related history
          const relatedHistoryArr = (initialValues.relatedHistoryIds || []).map((id: any) => {
            const hist =
              relHistoryRes.success && relHistoryRes.data
                ? relHistoryRes.data.find((h: any) => h.id === (typeof id === "object" ? id.value : id))
                : null;
            return hist
              ? {label: hist.title, value: hist.id}
              : typeof id === "object"
                ? id
                : {label: `ID: ${id}`, value: id};
          });

          // Map related artifacts
          const relatedArts = (initialValues.relatedArtifactIds || []).map((id: any) => {
            const art =
              relArtifactRes.success && relArtifactRes.data
                ? relArtifactRes.data.find((a: any) => a.id === (typeof id === "object" ? id.value : id))
                : null;
            return art
              ? {label: art.name, value: art.id}
              : typeof id === "object"
                ? id
                : {label: `ID: ${id}`, value: id};
          });

          // Map related levels
          const relatedLevels = (initialValues.relatedLevelIds || []).map((id: any) => {
            const lvl =
              relLevelsRes.success && relLevelsRes.data
                ? relLevelsRes.data.find((l: any) => l.id === (typeof id === "object" ? id.value : id))
                : null;
            return lvl
              ? {label: lvl.name, value: lvl.id}
              : typeof id === "object"
                ? id
                : {label: `ID: ${id}`, value: id};
          });

          const formattedValues = {
            ...initialValues,
            relatedHeritageIds: relatedHeri,
            relatedHistoryIds: relatedHistoryArr,
            relatedArtifactIds: relatedArts,
            relatedLevelIds: relatedLevels,
          };
          form.setFieldsValue(formattedValues);
        } catch (error) {
          console.error("Failed to init artifact data", error);
        }

        // Common sync logic for both Edit and Create (if initialValues exists)
        if (initialValues) {
          // Image type sync
          const isUpload = initialValues.image?.startsWith('/uploads/');
          setImageType(isUpload ? 'upload' : 'url');
          form.setFieldsValue({ imageType: isUpload ? 'upload' : 'url' });

          // Type sync
          const isDefaultType = Object.values(ArtifactType).includes(initialValues.artifactType as ArtifactType) && initialValues.artifactType !== ArtifactType.OTHER;
          if (isDefaultType) {
            setShowCustomType(false);
            form.setFieldsValue({ artifactTypeSelect: initialValues.artifactType });
          } else {
            setShowCustomType(true);
            form.setFieldsValue({ 
              artifactTypeSelect: 'other',
              customArtifactType: initialValues.artifactType 
            });
          }
        }
      }
      // 2. Chế độ Thêm mới (isEdit = false) -> Reset form
      else if (open && !isEdit) {
        // Aggressively clear all fields because form instance persists
        const currentFields = form.getFieldsValue(true);
        const resetValues = Object.keys(currentFields).reduce((acc: any, key) => {
          acc[key] = undefined;
          return acc;
        }, {});
        form.setFieldsValue(resetValues);
        form.resetFields(); // Call this as well to reset errors/touched state

        setImageType('url');
        setShowCustomType(false);
        form.setFieldsValue({ imageType: 'url', artifactTypeSelect: ArtifactType.OTHER });

        // Set defaults
        form.setFieldsValue({
          isOnDisplay: true,
          condition: ArtifactCondition.GOOD,
          yearCreated: undefined,
          creator: user?.name,
        });
      }
    };

    initData();
  }, [open, isEdit, initialValues, form]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [heritageRes, categoryRes] = await Promise.all([
          heritageService.getAll({_limit: 100}),
          categoryService.getAll({_limit: 100}),
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
          "shortDescription",
          "name",
          "artifactType",
          "heritageSiteId",
          "categoryId",
          "yearCreated",
          "material",
          "dimensions",
          "condition",
          "creator",
          "locationInSite",
          "isOnDisplay",
        ];
        const tab2Fields = ["description", "historicalContext", "culturalSignificance"];
        const tab3Fields = ["relatedHeritageIds", "relatedHistoryIds", "relatedArtifactIds"];

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
      locationInSite: values.locationInSite,
      historicalContext: values.historicalContext,
      culturalSignificance: values.culturalSignificance,
      image: values.image || "",
      gallery: values.gallery || [],
      shortDescription: values.shortDescription, // Sync for compatibility
      relatedHeritageIds:
        values.relatedHeritageIds?.map((item: any) => (typeof item === "object" ? item.value : item)) || [],
      relatedHistoryIds:
        values.relatedHistoryIds?.map((item: any) => (typeof item === "object" ? item.value : item)) || [],
      relatedArtifactIds:
        values.relatedArtifactIds?.map((item: any) => (typeof item === "object" ? item.value : item)) || [],
      relatedLevelIds:
        values.relatedLevelIds?.map((item: any) => (typeof item === "object" ? item.value : item)) || [],
    };
    const success = await onSubmit(submitData);
    if (success) {
      form.resetFields();
    }
  };

  // Fetch function for Heritage Sites Search
  const fetchHeritageList = async (search: string) => {
    try {
      const response = await heritageService.getAll({q: search, limit: 10});
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
      const response = await historyService.getAll({q: search, limit: 10});
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

  const fetchArtifactList = async (search: string) => {
    try {
      const response = await artifactService.getAll({q: search, limit: 10});
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

  const fetchLevelList = async (search: string) => {
    try {
      const response = await adminLevelService.getAll({q: search, limit: 10});
      if (response.success && response.data) {
        return response.data.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
      }
      return [];
    } catch (error) {
      console.error("Fetch levels failed", error);
      return [];
    }
  };

  return (
    <FormModal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      title={isEdit ? "Cập nhật Hiện vật" : "Thêm mới Hiện vật"}
      width={1000}
      form={form}
      loading={loading}
      preserve={false}
      initialValues={initialValues}
      footer={
        <div style={{display: "flex", justifyContent: "center", gap: "8px"}}>
          <StyledButton
            variant="outline"
            onClick={() => {
              form.resetFields();
              onCancel();
            }}
            style={{minWidth: "120px"}}
          >
            Hủy
          </StyledButton>
          <StyledButton variant="primary" loading={loading} onClick={handleSubmitClick} style={{minWidth: "120px"}}>
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
                    <Form.Item label="Hình ảnh đại diện">
                      <div style={{ marginBottom: 8 }}>
                        <Radio.Group 
                          value={imageType} 
                          onChange={(e) => setImageType(e.target.value)}
                          buttonStyle="solid"
                          size="small"
                        >
                          <Radio.Button value="url">Dán liên kết</Radio.Button>
                          <Radio.Button value="upload">Tải ảnh lên</Radio.Button>
                        </Radio.Group>
                      </div>
                      
                      {imageType === 'upload' ? (
                        <Form.Item name="image" noStyle>
                          <ImageUpload maxCount={1} />
                        </Form.Item>
                      ) : (
                        <Form.Item name="image" noStyle>
                          <Input placeholder="https://..." prefix={<LinkOutlined />} />
                        </Form.Item>
                      )}
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
                      name="shortDescription"
                      label="Mô tả ngắn"
                      rules={[{required: true, message: "Vui lòng nhập mô tả ngắn"}]}
                    >
                      <Input.TextArea rows={2} placeholder="Mô tả ngắn gọn về hiện vật..." />
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
                        {
                          min: 3,
                          message: "Tên hiện vật yêu cầu tối thiểu 3 ký tự",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập tên hiện vật..." />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Loại hình">
                      <Space.Compact style={{ width: '100%' }}>
                        <Form.Item name="artifactTypeSelect" noStyle>
                          <Select placeholder="Chọn loại hình" onChange={onTypeChange} style={{ width: showCustomType ? '40%' : '100%' }}>
                            {Object.values(ArtifactType).map((type) => (
                              <Select.Option key={type} value={type}>
                                {ArtifactTypeLabels[type]}
                              </Select.Option>
                            ))}
                            <Select.Option value="other">Khác...</Select.Option>
                          </Select>
                        </Form.Item>
                        {showCustomType && (
                          <Form.Item 
                            name="customArtifactType" 
                            noStyle 
                            rules={[{ required: true, message: 'Nhập loại' }]}
                          >
                            <Input 
                              placeholder="VD: Cổ vật quý" 
                              onChange={(e) => form.setFieldsValue({ artifactType: e.target.value })}
                            />
                          </Form.Item>
                        )}
                      </Space.Compact>
                      <Form.Item name="artifactType" noStyle hidden>
                        <Input />
                      </Form.Item>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="heritageSiteId" label="Thuộc Di sản" rules={[]}>
                      <Select placeholder="Chọn di sản" allowClear showSearch optionFilterProp="children">
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
                      name="categoryId"
                      label="Phân loại"
                      rules={[{required: true, message: "Vui lòng chọn phân loại"}]}
                    >
                      <Select placeholder="Chọn loại hình văn hóa" allowClear showSearch optionFilterProp="children">
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
                    <Form.Item name="yearCreated" label="Năm sáng tạo">
                      <InputNumber style={{width: "100%"}} controls={false} />
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
                      <Input placeholder="Tên tác giả..." readOnly />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="locationInSite" label="Vị trí trưng bày" rules={[{min: 5, message: "Vị trí trưng bày yêu cầu tối thiểu 5 ký tự"}]}>
                      <Input placeholder="Phòng số X..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="latitude" label="Vĩ độ (Latitude)" tooltip="Tọa độ GPS riêng nếu có">
                      <InputNumber style={{width: "100%"}} placeholder="VD: 21.0123" precision={6} step={0.0001} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="longitude" label="Kinh độ (Longitude)" tooltip="Tọa độ GPS riêng nếu có">
                      <InputNumber style={{width: "100%"}} placeholder="VD: 105.8123" precision={6} step={0.0001} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item name="bookingLink" label="Link đặt vé/tham quan (Affiliate)">
                      <Input placeholder="Nhập link affiliate (VD: https://klook.com/...)" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col span={6}>
                    <Form.Item name="isOnDisplay" label="Đang trưng bày" valuePropName="checked">
                      <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="autoCreateScanObject" label="Tự động tạo đối tượng Tầm bảo" valuePropName="checked" tooltip="Nếu bật, hệ thống sẽ tự động tạo một đối tượng quét QR/Tầm bảo cho hiện vật này với tọa độ GPS tương ứng.">
                      <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
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
                  rules={[
                    {required: true, message: "Vui lòng nhập mô tả"},
                    {min: 20, message: "Mô tả chi tiết yêu cầu tối thiểu 20 ký tự"},
                  ]}
                >
                  <TinyEditor
                    key={isEdit ? `desc-edit-${initialValues?.id}` : "desc-create"}
                    height={350}
                    placeholder="Mô tả chi tiết về hiện vật..."
                    enableImageUpload={true}
                    enableVideoEmbed={true}
                  />
                </Form.Item>

                <Form.Item
                  name="historicalContext"
                  label="Bối cảnh lịch sử"
                  rules={[{min: 20, message: "Bối cảnh lịch sử yêu cầu tối thiểu 20 ký tự"}]}
                >
                  <TinyEditor
                    key={isEdit ? `hist-edit-${initialValues?.id}` : "hist-create"}
                    height={250}
                    placeholder="Mô tả bối cảnh lịch sử..."
                  />
                </Form.Item>

                <Form.Item
                  name="culturalSignificance"
                  label="Ý nghĩa văn hóa"
                  rules={[{min: 20, message: "Ý nghĩa văn hóa yêu cầu tối thiểu 20 ký tự"}]}
                >
                  <TinyEditor
                    key={isEdit ? `cult-edit-${initialValues?.id}` : "cult-create"}
                    height={250}
                    placeholder="Giá trị văn hóa..."
                  />
                </Form.Item>

                <Form.Item name="references" label="Nguồn tham khảo">
                  <TinyEditor
                    key={isEdit ? `ref-edit-${initialValues?.id}` : "ref-create"}
                    height={200}
                    placeholder="Nhập các nguồn tham khảo..."
                  />
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
                  name="relatedHeritageIds"
                  tooltip="Các địa điểm di sản gắn liền với hiện vật này"
                >
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm di sản..."
                    fetchOptions={fetchHeritageList}
                    style={{width: "100%"}}
                  />
                </Form.Item>

                <Form.Item
                  label="Lịch sử liên quan"
                  name="relatedHistoryIds"
                  tooltip="Các bài viết lịch sử bổ trợ thông tin cho hiện vật"
                >
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm bài viết..."
                    fetchOptions={fetchHistoryList}
                    style={{width: "100%"}}
                  />
                </Form.Item>

                <Form.Item
                  label="Hiện vật liên quan"
                  name="relatedArtifactIds"
                  tooltip="Các hiện vật khác có liên quan hoặc cùng bộ sưu tập"
                >
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm hiện vật..."
                    fetchOptions={fetchArtifactList}
                    style={{width: "100%"}}
                  />
                </Form.Item>

                <Form.Item label="Màn chơi liên quan" name="relatedLevelIds" tooltip="Các màn chơi trong game liên quan">
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm màn chơi..."
                    fetchOptions={fetchLevelList}
                    style={{width: "100%"}}
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
