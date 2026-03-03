import {useEffect, useState, useMemo} from "react";
import {Input, InputNumber, Select, Row, Col, Form, Typography, Divider, Radio, Space, DatePicker} from "antd";
import {
  SettingOutlined,
  CustomerServiceOutlined,
  GiftOutlined,
  LinkOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import {FormModal, DebounceSelect} from "@/components/common";
import adminChapterService from "@/services/admin-chapter.service";
import adminLevelService from "@/services/admin-level.service";
import ImageUpload from "@/components/common/Upload/ImageUpload";
import FileUpload from "@/components/common/Upload/FileUpload";
import {useAuth} from "@/hooks/useAuth";
import dayjs from "dayjs";
import heritageService from "@/services/heritage.service";
import artifactService from "@/services/artifact.service";
import historyService from "@/services/history.service";
import {HeritageSite, Artifact, HistoryArticle} from "@/types";

const {Text, Title} = Typography;

interface LevelFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<boolean>;
  initialValues?: any;
  loading?: boolean;
  title?: string;
}

const LevelForm: React.FC<LevelFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  title = "Thông tin Màn chơi",
}) => {
  const [form] = Form.useForm();
  const {user} = useAuth();
  const [chapters, setChapters] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);

  // Watch for chapter changes to fetch levels
  const selectedChapterId = Form.useWatch("chapterId", form);

  // UI Local State for Source Toggle
  const [thumbnailMode, setThumbnailMode] = useState<"upload" | "link">("upload");
  const [musicMode, setMusicMode] = useState<"upload" | "link">("link");

  const memoizedInitialValues = useMemo(() => {
    if (!initialValues || !initialValues.id) {
      return {
        difficulty: "easy",
        passingScore: 70,
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
        if (initialValues?.id) {
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
            console.error("Failed to init level related data", error);
            form.setFieldsValue(memoizedInitialValues);
          }

          // Smart detect mode from initial value
          if (
            initialValues.backgroundImage &&
            (initialValues.backgroundImage.startsWith("http") || initialValues.backgroundImage.startsWith("/"))
          ) {
            setThumbnailMode("upload");
          }
          if (initialValues.backgroundMusic) {
            setMusicMode(initialValues.backgroundMusic.startsWith("http") ? "link" : "upload");
          }
        } else {
          form.resetFields();
          form.setFieldsValue(memoizedInitialValues);
          setThumbnailMode("upload");
          setMusicMode("link");
        }
      }
    };

    initData();
  }, [open, memoizedInitialValues, form, initialValues]);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await adminChapterService.getAll({limit: 100});
        if (response.success) {
          setChapters(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch chapters", error);
      }
    };
    if (open) fetchChapters();
  }, [open]);

  useEffect(() => {
    const fetchLevels = async () => {
      if (!selectedChapterId) {
        setLevels([]);
        return;
      }
      try {
        const response = await adminLevelService.getAll({
          chapterId: selectedChapterId,
          limit: 100,
        });
        if (response.success) {
          // Filter out current level to avoid self-reference
          const filteredLevels = (response.data || []).filter((l: any) => l.id !== initialValues?.id);
          setLevels(filteredLevels);
        }
      } catch (error) {
        console.error("Failed to fetch levels", error);
      }
    };
    if (open && selectedChapterId) fetchLevels();
  }, [open, selectedChapterId, initialValues?.id]);

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

  return (
    <FormModal open={open} onCancel={onCancel} onOk={handleOk} title={title} width={850} form={form} loading={loading}>
      <div style={{padding: "8px"}}>
        {/* --- Phần 1: Thông tin cơ bản & Asset --- */}
        <Row gutter={24}>
          <Col span={7}>
            <Form.Item label="Ảnh đại diện" required>
              <Space direction="vertical" style={{width: "100%"}} size={4}>
                <Radio.Group
                  size="small"
                  value={thumbnailMode}
                  onChange={(e) => setThumbnailMode(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="upload">
                    <CloudUploadOutlined /> Tải lên
                  </Radio.Button>
                  <Radio.Button value="link">
                    <LinkOutlined /> Link
                  </Radio.Button>
                </Radio.Group>
                {thumbnailMode === "upload" ? (
                  <Form.Item name="backgroundImage" noStyle>
                    <ImageUpload maxCount={1} />
                  </Form.Item>
                ) : (
                  <Form.Item name="backgroundImage" noStyle>
                    <Input placeholder="Dán link ảnh (https://...)" style={{marginTop: 8}} />
                  </Form.Item>
                )}
              </Space>
            </Form.Item>
          </Col>
          <Col span={17}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="Tên Màn chơi" rules={[{required: true, message: "Nhập tên màn chơi"}]}>
                  <Input placeholder="Tên hiển thị..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="chapterId" label="Thuộc Chương" rules={[{required: true, message: "Chọn chương"}]}>
                  <Select placeholder="Chọn chương...">
                    {chapters.map((chap) => (
                      <Select.Option key={chap.id} value={chap.id}>
                        {chap.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="description" label="Mô tả tóm tắt" rules={[{required: true, message: "Nhập mô tả"}]}>
                  <Input.TextArea rows={2} placeholder="Mô tả ngắn gọn về màn chơi này..." showCount maxLength={200} />
                </Form.Item>
              </Col>
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
        </Row>

        <Divider style={{margin: "16px 0"}} />

        {/* --- Phần 2: Cài đặt & Vận hành --- */}
        <Title level={5} style={{marginBottom: 16}}>
          <SettingOutlined /> Cài đặt & Vận hành
        </Title>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="difficulty" label="Độ khó">
              <Select>
                <Select.Option value="easy">
                  <Text type="success">Dễ</Text>
                </Select.Option>
                <Select.Option value="medium">
                  <Text type="warning">Trung bình</Text>
                </Select.Option>
                <Select.Option value="hard">
                  <Text type="danger">Khó</Text>
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="order" label="Thứ tự">
              <InputNumber style={{width: "100%"}} min={1} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="passingScore" label="Điểm vượt qua (%)">
              <InputNumber style={{width: "100%"}} min={0} max={100} addonAfter="%" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="requiredLevel"
              label="Màn chơi yêu cầu để mở khóa"
              tooltip="Người chơi phải hoàn thành màn này mới có thể chơi màn đang tạo/chỉnh sửa."
            >
              <Select placeholder="Chọn màn chơi (Để trống nếu không yêu cầu)..." allowClear>
                {levels.map((lvl) => (
                  <Select.Option key={lvl.id} value={lvl.id}>
                    {lvl.order}. {lvl.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Nhạc nền (BGM)">
              <Space direction="vertical" style={{width: "100%"}} size={4}>
                <Radio.Group
                  size="small"
                  value={musicMode}
                  onChange={(e) => setMusicMode(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value="upload">
                    <CloudUploadOutlined /> Tải file
                  </Radio.Button>
                  <Radio.Button value="link">
                    <LinkOutlined /> Link URL
                  </Radio.Button>
                </Radio.Group>

                {musicMode === "upload" ? (
                  <div style={{marginTop: 8}}>
                    <Form.Item name="backgroundMusic" noStyle>
                      <FileUpload accept="audio/*" placeholder="Chọn file nhạc (.mp3, .wav...)" />
                    </Form.Item>
                  </div>
                ) : (
                  <Form.Item name="backgroundMusic" noStyle>
                    <Input prefix={<CustomerServiceOutlined />} placeholder="https://..." style={{marginTop: 8}} />
                  </Form.Item>
                )}
              </Space>
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{margin: "16px 0"}} />

        {/* --- Phần 3: Phần thưởng --- */}
        <Title level={5} style={{marginBottom: 16}}>
          <GiftOutlined /> Phần thưởng chiến thắng (Lần đầu)
        </Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name={["rewards", "petals"]} label="Số Cánh hoa">
              <InputNumber
                style={{width: "100%"}}
                min={0}
                placeholder="0"
                formatter={(value) => `${value || ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name={["rewards", "coins"]} label="Số Xu (Coins)">
              <InputNumber
                style={{width: "100%"}}
                min={0}
                placeholder="0"
                formatter={(value) => `${value || ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{margin: "16px 0"}} />

        {/* --- Phần 4: Kiến thức bổ trợ (AI) --- */}
        <Title level={5} style={{marginBottom: 16}}>
          <CustomerServiceOutlined /> Kiến thức bổ trợ (AI)
        </Title>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="knowledgeBase"
              label="Dữ liệu kiến thức dạy cho AI"
              tooltip="Văn bản này sẽ được dùng để 'dạy' AI về bối cảnh của màn chơi này, giúp AI trả lời các câu hỏi của người chơi chính xác hơn."
            >
              <Input.TextArea
                rows={6}
                placeholder="Nhập kiến thức lịch sử, văn hóa hoặc bối cảnh cho màn chơi này (Plain text hoặc Markdown)..."
                showCount
                maxLength={2000}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{margin: "16px 0"}} />

        <Title level={5} style={{marginBottom: 16}}>
          <LinkOutlined /> Nội dung liên quan (Ngon Logic)
        </Title>
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
      </div>
    </FormModal>
  );
};

export default LevelForm;
