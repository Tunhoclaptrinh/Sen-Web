import { Form, Input, InputNumber, ColorPicker, Descriptions, Space, Row, Col, message, Select, Switch, Divider } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import { Button, DebounceSelect } from "@/components/common";
import { Chapter, HeritageSite, Artifact, HistoryArticle } from "@/types";
import { useState, useEffect } from "react";
import adminChapterService from "@/services/admin-chapter.service";
import ImageUpload from "@/components/common/Upload/ImageUpload";
import heritageService from "@/services/heritage.service";
import artifactService from "@/services/artifact.service";
import historyService from "@/services/history.service";
import { getImageUrl } from "@/utils/image.helper";

interface ChapterInfoTabProps {
  data: Chapter | null;
  mode: "view" | "edit" | "create";
  onUpdate: (chapter: Chapter) => void;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit?: (values: any) => Promise<boolean>;
}

const ChapterInfoTab: React.FC<ChapterInfoTabProps> = ({ data, mode, onUpdate, onSuccess, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    const initData = async () => {
      try {
        const response = await adminChapterService.getAll({ limit: 100 });
        if (response.success && response.data) {
          setChapters(response.data);
        }

        if (data && mode !== "view") {
          // Fetch labels for related IDs if editing
          const [relHeritageRes, relArtifactsRes, relHistoryRes] = await Promise.all([
            (data.relatedHeritageIds?.length ?? 0) > 0
              ? heritageService.getByIds(data.relatedHeritageIds!)
              : Promise.resolve({ success: true, data: [] }),
            (data.relatedArtifactIds?.length ?? 0) > 0
              ? artifactService.getAll({
                ids: data.relatedArtifactIds!.join(","),
              })
              : Promise.resolve({ success: true, data: [] }),
            (data.relatedHistoryIds?.length ?? 0) > 0
              ? historyService.getAll({
                ids: data.relatedHistoryIds!.join(","),
              })
              : Promise.resolve({ success: true, data: [] }),
          ]);

          form.setFieldsValue({
            ...data,
            relatedHeritageIds: (data.relatedHeritageIds || []).map((id: number) => {
              const item = relHeritageRes.data?.find((h: HeritageSite) => h.id === id);
              return item ? { label: item.name, value: item.id } : { label: `ID: ${id}`, value: id };
            }),
            relatedArtifactIds: (data.relatedArtifactIds || []).map((id: number) => {
              const item = relArtifactsRes.data?.find((a: Artifact) => a.id === id);
              return item ? { label: item.name, value: item.id } : { label: `ID: ${id}`, value: id };
            }),
            relatedHistoryIds: (data.relatedHistoryIds || []).map((id: number) => {
              const item = relHistoryRes.data?.find((h: HistoryArticle) => h.id === id);
              return item ? { label: item.title, value: item.id } : { label: `ID: ${id}`, value: id };
            }),
          });
        } else if (mode === "create") {
          form.resetFields();
          form.setFieldsValue({
            requiredPetals: 0,
            isActive: true,
            color: "#1890ff",
          });
        }
      } catch (error) {
        console.error("Init chapter data error:", error);
      }
    };
    initData();
  }, [data, mode, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (onSubmit) {
        // Transform related fields back to array of IDs
        const submitData = {
          ...values,
          relatedHeritageIds: values.relatedHeritageIds?.map((item: any) => typeof item === 'object' ? item.value : item) || [],
          relatedArtifactIds: values.relatedArtifactIds?.map((item: any) => typeof item === 'object' ? item.value : item) || [],
          relatedHistoryIds: values.relatedHistoryIds?.map((item: any) => typeof item === 'object' ? item.value : item) || [],
        };
        const success = await onSubmit(submitData);
        if (success) {
          onSuccess();
        }
        return;
      }

      let response;
      if (mode === "create") {
        // Remove order when creating (backend auto-sets)
        const { order, ...createValues } = values;
        response = await adminChapterService.create(createValues);
      } else if (mode === "edit" && data?.id) {
        response = await adminChapterService.update(data.id, values);
      }

      if (response?.success) {
        message.success(mode === "create" ? "Tạo chương thành công!" : "Cập nhật thành công!");
        if (response.data) {
          onUpdate(response.data);
        }
        onSuccess();
      } else {
        message.error(response?.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      message.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // View mode: Display as Descriptions
  if (mode === "view" && data) {
    return (
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Tên Chương">{data.name}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{data.description}</Descriptions.Item>
        <Descriptions.Item label="Chủ đề">{data.theme}</Descriptions.Item>
        <Descriptions.Item label="Màu sắc">
          <Space>
            <div
              style={{
                width: 30,
                height: 30,
                backgroundColor: data.color,
                border: "1px solid #ddd",
                borderRadius: 4,
              }}
            />
            {data.color}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Thứ tự">{data.order}</Descriptions.Item>
        <Descriptions.Item label="Số cánh hoa yêu cầu">{data.requiredPetals}</Descriptions.Item>
        <Descriptions.Item label="Chương yêu cầu">
          {data.requiredChapterId
            ? chapters.find((c) => c.id === data.requiredChapterId)?.name || `Mã chương: ${data.requiredChapterId}`
            : "Không có"}
        </Descriptions.Item>
        <Descriptions.Item label="Hình ảnh">
          {data.image ? (
            <img src={getImageUrl(data.image)} alt={data.name} style={{ maxWidth: 200, borderRadius: 8 }} />
          ) : (
            "Chưa có ảnh"
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Switch checked={data.isActive} disabled />
        </Descriptions.Item>
      </Descriptions>
    );
  }

  // Related content fetchers
  const fetchHeritageList = async (search: string) => {
    const res = await heritageService.getAll({ q: search, limit: 10 });
    return res.success && res.data ? res.data.map((h: HeritageSite) => ({ label: h.name, value: h.id })) : [];
  };

  const fetchArtifactList = async (search: string) => {
    const res = await artifactService.getAll({ q: search, limit: 10 });
    return res.success && res.data ? res.data.map((a: Artifact) => ({ label: a.name, value: a.id })) : [];
  };

  const fetchHistoryList = async (search: string) => {
    const res = await historyService.getAll({ q: search, limit: 10 });
    return res.success && res.data ? res.data.map((h: HistoryArticle) => ({ label: h.title, value: h.id })) : [];
  };

  // Edit/Create mode: Display as Form
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="name"
        label="Tên Chương"
        rules={[
          { required: true, message: "Vui lòng nhập tên chương" },
          { min: 3, message: "Tên chương phải có ít nhất 3 ký tự" },
        ]}
      >
        <Input placeholder="Nhập tên chương (VD: Sen Hồng - Ký Ức Đầu Tiên)" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[
          { required: true, message: "Vui lòng nhập mô tả" },
          { min: 20, message: "Mô tả phải có ít nhất 20 ký tự" },
        ]}
      >
        <Input.TextArea rows={4} placeholder="Mô tả về nội dung chương..." />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="theme" label="Chủ đề" rules={[{ required: true, message: "Vui lòng nhập chủ đề" }]}>
            <Input placeholder="Chủ đề (VD: Văn hóa Đại Việt)" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="color"
            label="Màu sắc chủ đạo"
            getValueFromEvent={(color) => (typeof color === "string" ? color : color.toHexString())}
          >
            <ColorPicker showText />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="image" label="Hình ảnh Chapter">
            <ImageUpload 
              value={form.getFieldValue('image')} 
              onChange={(val) => form.setFieldsValue({ image: Array.isArray(val) ? val[0] : val })}
              maxCount={1}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        {mode === "edit" && (
          <Col span={12}>
            <Form.Item name="order" label="Thứ tự" rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}>
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Col>
        )}
        <Col span={mode === "edit" ? 12 : 24}>
          <Form.Item name="requiredPetals" label="Số cánh hoa yêu cầu">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name="requiredChapterId" label="Chương yêu cầu (Prerequisite)">
            <Select
              placeholder="Chọn chương yêu cầu để mở khóa chương này"
              allowClear
              options={chapters
                .filter((c) => c.id !== data?.id) // Cannot be prerequisite of itself
                .map((c) => ({
                  label: c.name,
                  value: c.id,
                }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">
        <Space>
          <LinkOutlined /> Nội dung liên quan
        </Space>
      </Divider>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Di sản liên quan" name="relatedHeritageIds">
            <DebounceSelect mode="multiple" placeholder="Tìm di sản..." fetchOptions={fetchHeritageList} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Hiện vật liên quan" name="relatedArtifactIds">
            <DebounceSelect mode="multiple" placeholder="Tìm hiện vật..." fetchOptions={fetchArtifactList} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Bài viết lịch sử liên quan" name="relatedHistoryIds">
            <DebounceSelect mode="multiple" placeholder="Tìm bài viết..." fetchOptions={fetchHistoryList} />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ marginTop: 24, textAlign: "right" }}>
        <Space>
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            {mode === "create" ? "Tạo mới" : "Lưu lại"}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default ChapterInfoTab;
