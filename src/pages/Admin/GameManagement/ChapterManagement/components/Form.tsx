import {Input, InputNumber, Row, Col, Form, Switch, Radio, ColorPicker, DatePicker, Divider, Space} from "antd";
import {LinkOutlined} from "@ant-design/icons";
import {FormModal, DebounceSelect} from "@/components/common";
import {useEffect, useState, useMemo} from "react";
import ImageUpload from "@/components/common/Upload/ImageUpload";
import {useAuth} from "@/hooks/useAuth";
import dayjs from "dayjs";
import heritageService from "@/services/heritage.service";
import artifactService from "@/services/artifact.service";
import historyService from "@/services/history.service";
import {HeritageSite, Artifact, HistoryArticle} from "@/types";

interface ChapterFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<boolean>;
  initialValues?: any;
  loading?: boolean;
  title?: string;
}

const MediaPicker = ({value, onChange}: {value?: string; onChange?: (val: string) => void}) => {
  const [mode, setMode] = useState<"upload" | "url">("upload");

  // Auto-switch to URL mode if value is present and we want to show it?
  // But ImageUpload handles showing existing URLs too.
  // We'll stick to manual toggle or default to upload.

  return (
    <div>
      <div style={{marginBottom: 8}}>
        <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)} size="small" buttonStyle="solid">
          <Radio.Button value="upload">Tải ảnh</Radio.Button>
          <Radio.Button value="url">Link URL</Radio.Button>
        </Radio.Group>
      </div>
      {mode === "upload" ? (
        <ImageUpload 
          value={value} 
          onChange={(val) => {
            onChange?.(Array.isArray(val) ? val[0] : val);
          }} 
          maxCount={1} 
        />
      ) : (
        <Input value={value} onChange={(e) => onChange?.(e.target.value)} placeholder="https://example.com/image.png" />
      )}
    </div>
  );
};

const ChapterForm: React.FC<ChapterFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  title = "Thông tin Chương",
}) => {
  const [form] = Form.useForm();
  const {user} = useAuth();

  const memoizedInitialValues = useMemo(() => {
    if (!initialValues) {
      return {
        requiredPetals: 0,
        color: "#1890ff",
        isActive: true,
        author: user?.name,
        publishDate: dayjs(),
      };
    }

    return {
      ...initialValues,
      publishDate: initialValues.publishDate ? dayjs(initialValues.publishDate) : undefined,
    };
  }, [initialValues, user]);

  useEffect(() => {
    const initData = async () => {
      if (open) {
        if (initialValues) {
          try {
            // Fetch labels for related IDs
            const [relHeritageRes, relArtifactsRes, relHistoryRes] = await Promise.all([
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
            ]);

            const formattedValues = {
              ...memoizedInitialValues,
              relatedHeritageIds: (initialValues.relatedHeritageIds || []).map((id: number) => {
                const item = relHeritageRes.data?.find((h: HeritageSite) => h.id === id);
                return item ? {label: item.name, value: item.id} : {label: `ID: ${id}`, value: id};
              }),
              relatedArtifactIds: (initialValues.relatedArtifactIds || []).map((id: number) => {
                const item = relArtifactsRes.data?.find((a: Artifact) => a.id === id);
                return item ? {label: item.name, value: item.id} : {label: `ID: ${id}`, value: id};
              }),
              relatedHistoryIds: (initialValues.relatedHistoryIds || []).map((id: number) => {
                const item = relHistoryRes.data?.find((h: HistoryArticle) => h.id === id);
                return item ? {label: item.title, value: item.id} : {label: `ID: ${id}`, value: id};
              }),
            };
            form.setFieldsValue(formattedValues);
          } catch (error) {
            console.error("Failed to init chapter related data", error);
            form.setFieldsValue(memoizedInitialValues);
          }
        } else {
          form.resetFields();
          form.setFieldsValue(memoizedInitialValues);
        }
      }
    };

    initData();
  }, [open, memoizedInitialValues, form, initialValues]);

  const handleOk = async (values: any) => {
    // Transform related IDs back to numbers
    const submitData = {
      ...values,
      relatedHeritageIds:
        values.relatedHeritageIds?.map((item: any) => (typeof item === "object" ? item.value : item)) || [],
      relatedArtifactIds:
        values.relatedArtifactIds?.map((item: any) => (typeof item === "object" ? item.value : item)) || [],
      relatedHistoryIds:
        values.relatedHistoryIds?.map((item: any) => (typeof item === "object" ? item.value : item)) || [],
    };
    await onSubmit(submitData);
  };

  // Fetch functions for DebounceSelect
  const fetchHeritageList = async (search: string) => {
    const res = await heritageService.getAll({q: search, limit: 10});
    return res.success && res.data ? res.data.map((h: HeritageSite) => ({label: h.name, value: h.id})) : [];
  };

  const fetchArtifactList = async (search: string) => {
    const res = await artifactService.getAll({q: search, limit: 10});
    return res.success && res.data ? res.data.map((a: Artifact) => ({label: a.name, value: a.id})) : [];
  };

  const fetchHistoryList = async (search: string) => {
    const res = await historyService.getAll({q: search, limit: 10});
    return res.success && res.data ? res.data.map((h: HistoryArticle) => ({label: h.title, value: h.id})) : [];
  };

  const isEditMode = !!initialValues;

  return (
    <FormModal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      title={title}
      width={800}
      form={form}
      loading={loading}
      initialValues={memoizedInitialValues}
    >
      <Row gutter={24}>
        {/* Left Column: General Info */}
        <Col span={15}>
          <Form.Item
            name="name"
            label="Tên Chương"
            rules={[
              {required: true, message: "Vui lòng nhập tên chương"},
              {min: 3, message: "Tên chương phải có ít nhất 3 ký tự"},
            ]}
          >
            <Input placeholder="VD: Sen Hồng - Ký Ức Đầu Tiên" />
          </Form.Item>

          <Form.Item name="theme" label="Chủ đề" rules={[{required: true, message: "Vui lòng nhập chủ đề"}]}>
            <Input placeholder="VD: Văn hóa Đại Việt" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={isEditMode ? 12 : 24}>
              <Form.Item name="requiredPetals" label="Số cánh hoa yêu cầu">
                <InputNumber style={{width: "100%"}} min={0} />
              </Form.Item>
            </Col>
            {isEditMode && (
              <Col span={12}>
                <Form.Item name="order" label="Thứ tự" rules={[{required: true, message: "Vui lòng nhập thứ tự"}]}>
                  <InputNumber style={{width: "100%"}} min={1} />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              {required: true, message: "Vui lòng nhập mô tả"},
              {min: 20, message: "Mô tả phải có ít nhất 20 ký tự"},
            ]}
          >
            <Input.TextArea rows={6} placeholder="Mô tả chi tiết về nội dung và ý nghĩa của chương..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="author" label="Tác giả">
                <Input placeholder="Tên người tạo..." readOnly />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="publishDate" label="Ngày đăng">
                <DatePicker style={{width: "100%"}} disabled placeholder="Tự động khi duyệt" />
              </Form.Item>
            </Col>
          </Row>
        </Col>

        {/* Right Column: Visuals & Status */}
        <Col span={9}>
          <div style={{backgroundColor: "#f9f9f9", padding: "16px", borderRadius: "8px", height: "100%"}}>
            <Form.Item
              name="isActive"
              label="Trạng thái"
              valuePropName="checked"
              initialValue={true}
              style={{marginBottom: 24}}
            >
              <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Tạm ẩn" />
            </Form.Item>

            <Form.Item
              name="color"
              label="Màu chủ đạo"
              rules={[{required: true, message: "Vui lòng chọn màu chủ đạo"}]}
              getValueFromEvent={(color) => (typeof color === "string" ? color : color.toHexString())}
            >
              <ColorPicker showText format="hex" />
            </Form.Item>

            <Form.Item name="image" label="Hình ảnh (Thumbnail)">
              <MediaPicker />
            </Form.Item>

            <div style={{marginTop: 16, fontSize: "12px", color: "#888"}}>
              <p>
                ℹ️ <strong>Lưu ý:</strong>
              </p>
              <ul style={{paddingLeft: 16, margin: 0}}>
                <li>Khuyên dùng ảnh tỷ lệ 16:9 hoặc 4:3.</li>
                <li>Dung lượng tối đa 5MB.</li>
              </ul>
            </div>
          </div>
        </Col>
      </Row>

      <Divider orientation="left" style={{margin: "24px 0 16px"}}>
        <Space>
          <LinkOutlined /> Nội dung liên quan (Ngon Logic)
        </Space>
      </Divider>

      <Row gutter={24}>
        <Col span={8}>
          <Form.Item label="Di sản liên quan" name="relatedHeritageIds">
            <DebounceSelect
              mode="multiple"
              placeholder="Tìm di sản..."
              fetchOptions={fetchHeritageList}
              style={{width: "100%"}}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Hiện vật liên quan" name="relatedArtifactIds">
            <DebounceSelect
              mode="multiple"
              placeholder="Tìm hiện vật..."
              fetchOptions={fetchArtifactList}
              style={{width: "100%"}}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Bài viết lịch sử liên quan" name="relatedHistoryIds">
            <DebounceSelect
              mode="multiple"
              placeholder="Tìm bài viết..."
              fetchOptions={fetchHistoryList}
              style={{width: "100%"}}
            />
          </Form.Item>
        </Col>
      </Row>
    </FormModal>
  );
};

export default ChapterForm;
