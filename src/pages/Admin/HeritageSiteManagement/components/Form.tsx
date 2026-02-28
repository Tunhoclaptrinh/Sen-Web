import {Input, InputNumber, Select, Switch, Row, Col, Form, Button, Tabs, message, DatePicker, Radio, Space} from "antd";
import {PlusOutlined, MinusCircleOutlined, LinkOutlined} from "@ant-design/icons";
import {FormModal, TinyEditor, Button as StyledButton, DebounceSelect} from "@/components/common";
import ImageUpload from "@/components/common/Upload/ImageUpload";
import {useAuth} from "@/hooks/useAuth";
import dayjs from "dayjs";

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
  HeritageSite,
  Artifact,
  HistoryArticle,
} from "@/types";
import {useEffect, useState, useMemo} from "react";
import artifactService from "@/services/artifact.service";
import heritageService from "@/services/heritage.service";
import historyService from "@/services/history.service";
import adminLevelService from "@/services/admin-level.service";
import categoryService, {Category} from "@/services/category.service";

interface HeritageSiteFormValues extends Partial<HeritageSite> {
  [key: string]: any; // Still need any for flexible form internal structure
}

interface HeritageFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: HeritageSiteFormValues) => Promise<boolean>;
  initialValues?: HeritageSiteFormValues;
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
  const {user} = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await categoryService.getAll({limit: 100});
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    };
    fetchCategories();
  }, []);

  const memoizedInitialValues = useMemo(() => {
    if (!initialValues)
      return {
        isActive: true,
        unescoListed: false,
        yearEstablished: new Date().getFullYear(),
        author: user?.name,
        publishDate: dayjs(),
      };

    return {
      ...initialValues,
      publishDate: initialValues.publishDate ? dayjs(initialValues.publishDate) : undefined,
    };
  }, [initialValues, user]);

  useEffect(() => {
    const initData = async () => {
      // 1. Chế độ Sửa (isEdit = true)
      if (open && initialValues && isEdit) {
        try {
          // Fetch labels for related IDs to show in DebounceSelect
          const heritageId = initialValues.id as number;
          if (!heritageId) return;

          const [timelineRes, artifactsRes, relHeritageRes, relArtifactsRes, relHistoryRes, relLevelsRes] = await Promise.all([
            heritageService.getTimeline(heritageId),
            heritageService.getArtifacts(heritageId),
            (initialValues.relatedHeritageIds?.length ?? 0) > 0
              ? heritageService.getByIds(initialValues.relatedHeritageIds!)
              : Promise.resolve({success: true, data: []}),
            (initialValues.relatedArtifactIds?.length ?? 0) > 0
              ? artifactService.getAll({
                  ids: initialValues.relatedArtifactIds!.join(","),
                })
              : Promise.resolve({success: true, data: []}),
            (initialValues.relatedHistoryIds?.length ?? 0) > 0
              ? historyService.getAll({
                  ids: initialValues.relatedHistoryIds!.join(","),
                })
              : Promise.resolve({success: true, data: []}),
            (initialValues.relatedLevelIds?.length ?? 0) > 0
              ? adminLevelService.getAll({
                  ids: initialValues.relatedLevelIds!.join(","),
                })
              : Promise.resolve({success: true, data: []}),
          ]);

          const timeline = timelineRes.success ? timelineRes.data : initialValues.timeline || [];

          // Map related artifacts to {label, value}
          const artifactMap = new Map();
          if (artifactsRes.success && artifactsRes.data) {
            artifactsRes.data.forEach((art: Artifact) => artifactMap.set(art.id, art));
          }
          if (relArtifactsRes.success && relArtifactsRes.data) {
            relArtifactsRes.data.forEach((art: Artifact) => artifactMap.set(art.id, art));
          }

          const relatedArtifacts = (initialValues.relatedArtifactIds || []).map(
            (id: number | {label: string; value: number}) => {
              const art = artifactMap.get(typeof id === "object" ? id.value : id);
              return art
                ? {label: art.name, value: art.id}
                : typeof id === "object"
                  ? id
                  : {label: `ID: ${id}`, value: id};
            },
          );

          // Map related history to {label, value}
          const relatedHistory = (initialValues.relatedHistoryIds || []).map(
            (id: number | {label: string; value: number}) => {
              const hist = relHistoryRes.success
                ? relHistoryRes.data?.find((h: HistoryArticle) => h.id === (typeof id === "object" ? id.value : id))
                : null;
              return hist
                ? {label: hist.title, value: hist.id}
                : typeof id === "object"
                  ? id
                  : {label: `ID: ${id}`, value: id};
            },
          );

          // Map related heritage to {label, value}
          const relatedHeritage = (initialValues.relatedHeritageIds || []).map(
            (id: number | {label: string; value: number}) => {
              const her = relHeritageRes.success
                ? relHeritageRes.data?.find((h: HeritageSite) => h.id === (typeof id === "object" ? id.value : id))
                : null;
              return her
                ? {label: her.name, value: her.id}
                : typeof id === "object"
                  ? id
                  : {label: `ID: ${id}`, value: id};
            },
          );

          // Map related levels to {label, value}
          const relatedLevels = (initialValues.relatedLevelIds || []).map(
            (id: number | {label: string; value: number}) => {
              const lvl = relLevelsRes.success
                ? relLevelsRes.data?.find((l: any) => l.id === (typeof id === "object" ? id.value : id))
                : null;
              return lvl
                ? {label: lvl.name, value: lvl.id}
                : typeof id === "object"
                  ? id
                  : {label: `ID: ${id}`, value: id};
            },
          );

          const formattedValues: any = {
            ...initialValues,
            publishDate: initialValues.publishDate ? dayjs(initialValues.publishDate) : undefined,
            timeline: timeline,
            relatedArtifactIds: relatedArtifacts,
            relatedHistoryIds: relatedHistory,
            relatedHeritageIds: relatedHeritage,
            relatedLevelIds: relatedLevels,
          };

          // Set available provinces based on region
          if (initialValues.region) {
            let regionLabel = initialValues.region;
            const regionKey = Object.keys(HeritageRegionLabels).find(
              (key) => key === initialValues.region || HeritageRegionLabels[key as HeritageRegion] === initialValues.region,
            ) as HeritageRegion;
            if (regionKey) {
              regionLabel = HeritageRegionLabels[regionKey];
              formattedValues.region = regionLabel;
              setSelectedRegion(regionLabel);
              const provinces = ProvincesByRegion[regionKey] || [];
              setAvailableProvinces(provinces);
              if (formattedValues.province && !provinces.includes(formattedValues.province as HeritageProvince)) {
                formattedValues.province = undefined;
              }
            }
          }

          // Image type sync
          const isUpload = initialValues.image?.startsWith('/uploads/');
          setImageType(isUpload ? 'upload' : 'url');
          form.setFieldsValue({ imageType: isUpload ? 'upload' : 'url' });

          // Type sync
          const isDefaultType = Object.values(HeritageType).includes(initialValues.type as HeritageType) && initialValues.type !== HeritageType.OTHER;
          if (isDefaultType) {
            setShowCustomType(false);
            form.setFieldsValue({ typeSelect: initialValues.type });
          } else {
            setShowCustomType(true);
            form.setFieldsValue({ 
              typeSelect: 'other',
              customType: initialValues.type 
            });
          }

          form.setFieldsValue(formattedValues);
        } catch (error) {
          console.error("Failed to init heritage data", error);
          form.setFieldsValue(initialValues);
        }
      }
      // 2. Chế độ Thêm mới (isEdit = false) -> Reset form
      else if (open && !isEdit) {
        form.resetFields();
        setSelectedRegion("");
        setAvailableProvinces([]);
        setImageType('url');
        setShowCustomType(false);
        form.setFieldsValue({ imageType: 'url', typeSelect: HeritageType.MONUMENT });
        form.setFieldsValue(memoizedInitialValues);
      }
    };

    initData();
  }, [open, isEdit, initialValues, form, memoizedInitialValues]);

  const [activeTab, setActiveTab] = useState("1");
  const [availableProvinces, setAvailableProvinces] = useState<HeritageProvince[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [imageType, setImageType] = useState<'url' | 'upload'>('url');
  const [showCustomType, setShowCustomType] = useState(false);

  const onTypeChange = (value: string) => {
    const isOther = value === 'other';
    setShowCustomType(isOther);
    if (!isOther) {
      form.setFieldsValue({ type: value });
    }
  };

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
          form.setFieldsValue({province: undefined});
        }
      } else {
        setAvailableProvinces([]);
        form.setFieldsValue({province: undefined});
      }
    } else {
      setAvailableProvinces([]);
      form.setFieldsValue({province: undefined});
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

      if (error && typeof error === "object" && "errorFields" in error) {
        const errorFields = error.errorFields as Array<{name: string[]}>;
        if (errorFields.length > 0) {
          const firstErrorField = errorFields[0].name[0];

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
            "region",
            "province",
            "culturalPeriod",
            "significance",
            "visitHours",
            "yearEstablished",
            "entranceFee",
            "unescoListed",
            "isActive",
          ];
          const tab2Fields = ["description"];
          const tab3Fields = ["relatedArtifactIds", "relatedHistoryIds", "relatedHeritageIds", "timeline"];

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
    }
  };

  const handleOk = async (values: HeritageSiteFormValues) => {
    // Transform values before submit
    const submitData = {
      ...values,
      shortDescription: values.shortDescription, // Sync for compatibility
      // Convert region label back to enum value
      region:
        Object.keys(HeritageRegionLabels).find(
          (key) => HeritageRegionLabels[key as HeritageRegion] === values.region,
        ) || values.region,
      image: values.image || "",
      gallery: values.gallery || [],
      timeline: values.timeline || [],
      relatedArtifactIds:
        values.relatedArtifactIds?.map((item: number | {value: number}) =>
          typeof item === "object" ? item.value : item,
        ) || [],
      relatedHistoryIds:
        values.relatedHistoryIds?.map((item: number | {value: number}) =>
          typeof item === "object" ? item.value : item,
        ) || [],
      relatedHeritageIds:
        values.relatedHeritageIds?.map((item: number | {value: number}) =>
          typeof item === "object" ? item.value : item,
        ) || [],
      relatedLevelIds:
        values.relatedLevelIds?.map((item: number | {value: number}) =>
          typeof item === "object" ? item.value : item,
        ) || [],
      culturalPeriod: values.culturalPeriod,
      visitHours: values.visitHours,
      entranceFee: values.entranceFee,
    };
    const success = await onSubmit(submitData);
    if (success) {
      form.resetFields();
    }
  };

  // Fetch function for Artifact Search
  const fetchArtifactList = async (search: string) => {
    try {
      const response = await artifactService.getAll({q: search, limit: 10});
      if (response.success && response.data) {
        return response.data.map((item: Artifact) => ({
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
      const response = await historyService.getAll({q: search, limit: 10});
      if (response.success && response.data) {
        return response.data.map((item: HistoryArticle) => ({
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

  // Fetch function for Heritage Search
  const fetchHeritageList = async (search: string) => {
    try {
      const response = await heritageService.getAll({q: search, limit: 10});
      if (response.success && response.data) {
        return response.data.map((item: HeritageSite) => ({
          label: item.name,
          value: item.id,
        }));
      }
      return [];
    } catch (error) {
      console.error("Fetch heritage failed", error);
      return [];
    }
  };

  // Fetch function for Level Search
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
      title={isEdit ? "Cập nhật Di sản" : "Thêm mới Di sản"}
      width={1000}
      form={form}
      loading={loading}
      initialValues={memoizedInitialValues}
      preserve={false}
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
            label: "Thông tin chung",
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
                    <Form.Item label="Thư viện ảnh (Tối đa 10 ảnh)" name="gallery">
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
                        {required: true, message: "Vui lòng nhập mô tả ngắn"},
                        {min: 20, message: "Mô tả ngắn yêu cầu tối thiểu 20 ký tự"},
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
                      label="Tên Di sản"
                      rules={[
                        {required: true, message: "Vui lòng nhập tên di sản"},
                        {min: 5, message: "Tên di sản yêu cầu tối thiểu 5 ký tự"},
                      ]}
                    >
                      <Input placeholder="Nhập tên di sản (VD: Hoàng thành Thăng Long)" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Loại hình">
                      <Space.Compact style={{ width: '100%' }}>
                        <Form.Item name="typeSelect" noStyle>
                          <Select placeholder="Chọn loại hình" onChange={onTypeChange} style={{ width: showCustomType ? '40%' : '100%' }}>
                            {Object.values(HeritageType).map((type) => (
                              <Select.Option key={type} value={type}>
                                {HeritageTypeLabels[type]}
                              </Select.Option>
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
                              placeholder="VD: Kỳ quan mới" 
                              onChange={(e) => form.setFieldsValue({ type: e.target.value })}
                            />
                          </Form.Item>
                        )}
                      </Space.Compact>
                      <Form.Item name="type" noStyle hidden>
                        <Input />
                      </Form.Item>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="categoryId"
                      label="Danh mục Văn hóa"
                      rules={[{required: true, message: "Vui lòng chọn danh mục"}]}
                    >
                      <Select placeholder="Chọn danh mục" allowClear>
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
                  <Col span={12}>
                    <Form.Item name="author" label="Tác giả">
                      <Input readOnly placeholder="Hệ thống tự động" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="publishDate" label="Ngày xuất bản">
                      <DatePicker
                        style={{width: "100%"}}
                        disabled
                        format="DD/MM/YYYY HH:mm"
                        showTime
                        placeholder="Tự động khi duyệt"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="address"
                      label="Địa chỉ"
                      rules={[
                        {required: true, message: "Vui lòng nhập địa chỉ"},
                        {min: 10, message: "Địa chỉ yêu cầu tối thiểu 10 ký tự"},
                      ]}
                    >
                      <Input placeholder="Nhập địa chỉ cụ thể" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="region" label="Khu vực" rules={[{required: true}]}>
                      <Select placeholder="Chọn khu vực" onChange={(value) => setSelectedRegion(value)}>
                        {Object.values(HeritageRegion).map((region) => (
                          <Select.Option key={region} value={HeritageRegionLabels[region]}>
                            {HeritageRegionLabels[region]}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="province" label="Tỉnh/Thành phố">
                      <Select placeholder="Chọn tỉnh/thành phố" disabled={!availableProvinces.length}>
                        {availableProvinces.map((province: HeritageProvince) => (
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
                    <Form.Item name="latitude" label="Vĩ độ (Latitude)" tooltip="Giá trị từ -90 đến 90">
                      <InputNumber style={{width: "100%"}} placeholder="VD: 21.0123" precision={6} step={0.0001} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="longitude" label="Kinh độ (Longitude)" tooltip="Giá trị từ -180 đến 180">
                      <InputNumber style={{width: "100%"}} placeholder="VD: 105.8123" precision={6} step={0.0001} />
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
                  <Col span={24}>
                    <Form.Item name="bookingLink" label="Link đặt vé (Affiliate)">
                      <Input placeholder="Nhập link affiliate đặt vé (VD: https://klook.com/...)" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="yearEstablished" label="Năm thành lập">
                      <InputNumber style={{width: "100%"}} controls={false} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="entranceFee" label="Giá vé">
                      <InputNumber
                        style={{width: "100%"}}
                        formatter={(value) => `${value || ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value ? value.replace(/\$\s?|(,*)/g, "") : ""}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="unescoListed" label="UNESCO" valuePropName="checked">
                          <Switch checkedChildren="CÓ" unCheckedChildren="KHÔNG" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                          <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item name="autoCreateScanObject" label="Tự động tạo điểm Check-in (Tầm bảo)" valuePropName="checked" tooltip="Nếu bật, hệ thống sẽ tự động tạo một đối tượng quét QR/Checkin cho địa điểm này với tọa độ GPS tương ứng.">
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
                    {min: 10, message: "Mô tả chi tiết yêu cầu tối thiểu 10 ký tự"},
                  ]}
                >
                  <TinyEditor
                    key={isEdit ? `desc-edit-${initialValues?.id}` : "desc-create"}
                    height={400}
                    placeholder="Nhập mô tả chi tiết về di sản..."
                    enableImageUpload={true}
                    enableVideoEmbed={true}
                  />
                </Form.Item>
                <Form.Item name="references" label="Nguồn tham khảo">
                  <TinyEditor
                    key={isEdit ? `ref-edit-${initialValues?.id}` : "ref-create"}
                    height={250}
                    placeholder="Nhập các nguồn tham khảo..."
                  />
                </Form.Item>
              </>
            ),
          },
          {
            key: "3",
            label: "Dòng thời gian & Hiện vật",
            children: (
              <>
                <Form.Item label="Di sản liên quan" name="relatedHeritageIds">
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm và chọn di sản khác..."
                    fetchOptions={fetchHeritageList}
                    style={{width: "100%"}}
                  />
                </Form.Item>

                <Form.Item label="Hiện vật liên quan" name="relatedArtifactIds">
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm và chọn hiện vật..."
                    fetchOptions={fetchArtifactList}
                    style={{width: "100%"}}
                  />
                </Form.Item>

                <Form.Item label="Lịch sử liên quan" name="relatedHistoryIds">
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm và chọn bài viết lịch sử..."
                    fetchOptions={fetchHistoryList}
                    style={{width: "100%"}}
                  />
                </Form.Item>

                <Form.Item label="Màn chơi liên quan" name="relatedLevelIds">
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Tìm kiếm và chọn màn chơi..."
                    fetchOptions={fetchLevelList}
                    style={{width: "100%"}}
                  />
                </Form.Item>

                <Form.Item label="Dòng thời gian" style={{marginTop: 16}}>
                  <Form.List name="timeline">
                    {(fields, {add, remove}) => (
                      <>
                        {fields.map(({key, name, ...restField}) => (
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
                              rules={[{required: true, message: "Nhập năm"}]}
                              style={{margin: 0}}
                            >
                              <InputNumber placeholder="Năm" style={{width: 80}} controls={false} />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "title"]}
                              rules={[
                                {required: true, message: "Nhập tiêu đề"},
                                {min: 5, message: "Tiêu đề yêu cầu tối thiểu 5 ký tự"},
                              ]}
                              style={{margin: 0}}
                            >
                              <Input placeholder="Tiêu đề sự kiện" style={{width: 200}} />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "category"]}
                              rules={[{required: true, message: "Chọn loại"}]}
                              style={{margin: 0}}
                            >
                              <Select placeholder="Loại" style={{width: 150}}>
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
                              rules={[{min: 10, message: "Mô tả yêu cầu tối thiểu 10 ký tự"}]}
                              style={{flex: 1, margin: 0}}
                            >
                              <Input placeholder="Mô tả sự kiện" style={{width: "100%"}} />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => remove(name)} style={{color: "red"}} />
                          </div>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
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
