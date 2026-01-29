import { Input, InputNumber, Select, Row, Col, Form, Typography, Divider, Radio, Space } from "antd";
import { 
    SettingOutlined, 
    CustomerServiceOutlined, 
    GiftOutlined,
    LinkOutlined,
    CloudUploadOutlined
} from "@ant-design/icons";
import { FormModal } from "@/components/common";
import { useEffect, useState } from "react";
import adminChapterService from "@/services/admin-chapter.service";
import adminLevelService from "@/services/admin-level.service";
import ImageUpload from "@/components/common/Upload/ImageUpload";
import FileUpload from "@/components/common/Upload/FileUpload";

const { Text, Title } = Typography;

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
    const [chapters, setChapters] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    
    // Watch for chapter changes to fetch levels
    const selectedChapterId = Form.useWatch("chapter_id", form);
    
    // UI Local State for Source Toggle
    const [thumbnailMode, setThumbnailMode] = useState<"upload" | "link">("upload");
    const [musicMode, setMusicMode] = useState<"upload" | "link">("link");

    useEffect(() => {
        if (open) {
            if (initialValues?.id) {
                form.setFieldsValue(initialValues);
                // Smart detect mode from initial value
                if (initialValues.thumbnail && (initialValues.thumbnail.startsWith("http") || initialValues.thumbnail.startsWith("/"))) {
                    // If it's a URL, we default to upload if it's internal, link if it's external?
                    // Usually internal uploads start with /upload/ or similar. 
                    // To keep it simple, if it's present, let's just stick to what was set or default to upload.
                    setThumbnailMode("upload");
                }
                if (initialValues.background_music) {
                    setMusicMode(initialValues.background_music.startsWith("http") ? "link" : "upload");
                }
            } else {
                form.resetFields();
                if (initialValues) {
                    form.setFieldsValue(initialValues);
                }
                form.setFieldsValue({
                    difficulty: "easy",
                    passing_score: 70
                });
                setThumbnailMode("upload");
                setMusicMode("link");
            }
        }
    }, [open, initialValues, form]);

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const response = await adminChapterService.getAll({ limit: 100 });
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
                    chapter_id: selectedChapterId,
                    limit: 100 
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
        await onSubmit(values);
    };

    return (
        <FormModal
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            title={title}
            width={850}
            form={form}
            loading={loading}
        >
            <div style={{ padding: '8px' }}>
                {/* --- Phần 1: Thông tin cơ bản & Asset --- */}
                <Row gutter={24}>
                    <Col span={7}>
                        <Form.Item label="Ảnh đại diện" required>
                           <Space direction="vertical" style={{ width: '100%' }} size={4}>
                             <Radio.Group 
                                size="small" 
                                value={thumbnailMode} 
                                onChange={(e) => setThumbnailMode(e.target.value)}
                                optionType="button"
                                buttonStyle="solid"
                             >
                                <Radio.Button value="upload"><CloudUploadOutlined /> Tải lên</Radio.Button>
                                <Radio.Button value="link"><LinkOutlined /> Link</Radio.Button>
                             </Radio.Group>
                             <Form.Item name="thumbnail" noStyle>
                                {thumbnailMode === "upload" ? (
                                    <ImageUpload maxCount={1} />
                                ) : (
                                    <Input placeholder="Dán link ảnh (https://...)" style={{ marginTop: 8 }} />
                                )}
                             </Form.Item>
                           </Space>
                        </Form.Item>
                    </Col>
                    <Col span={17}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="Tên Màn chơi"
                                    rules={[{ required: true, message: "Nhập tên màn chơi" }]}
                                >
                                    <Input placeholder="Tên hiển thị..." />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="chapter_id"
                                    label="Thuộc Chương"
                                    rules={[{ required: true, message: "Chọn chương" }]}
                                >
                                    <Select placeholder="Chọn chương...">
                                        {chapters.map((chap) => (
                                            <Select.Option key={chap.id} value={chap.id}>{chap.name}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name="description"
                                    label="Mô tả tóm tắt"
                                    rules={[{ required: true, message: "Nhập mô tả" }]}
                                >
                                    <Input.TextArea rows={2} placeholder="Mô tả ngắn gọn về màn chơi này..." showCount maxLength={200} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Divider style={{ margin: '16px 0' }} />

                {/* --- Phần 2: Cài đặt & Vận hành --- */}
                <Title level={5} style={{ marginBottom: 16 }}>
                    <SettingOutlined /> Cài đặt & Vận hành
                </Title>
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item name="difficulty" label="Độ khó">
                            <Select>
                                <Select.Option value="easy"><Text type="success">Dễ</Text></Select.Option>
                                <Select.Option value="medium"><Text type="warning">Trung bình</Text></Select.Option>
                                <Select.Option value="hard"><Text type="danger">Khó</Text></Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="order" label="Thứ tự">
                            <InputNumber style={{ width: "100%" }} min={1} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="passing_score" label="Điểm vượt qua (%)">
                            <InputNumber style={{ width: "100%" }} min={0} max={100} addonAfter="%" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item 
                            name="required_level" 
                            label="Màn chơi yêu cầu để mở khóa"
                            tooltip="Người chơi phải hoàn thành màn này mới có thể chơi màn đang tạo/chỉnh sửa."
                        >
                            <Select 
                                placeholder="Chọn màn chơi (Để trống nếu không yêu cầu)..." 
                                allowClear
                            >
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
                           <Space direction="vertical" style={{ width: '100%' }} size={4}>
                                <Radio.Group 
                                    size="small" 
                                    value={musicMode} 
                                    onChange={(e) => setMusicMode(e.target.value)}
                                    optionType="button"
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value="upload"><CloudUploadOutlined /> Tải file</Radio.Button>
                                    <Radio.Button value="link"><LinkOutlined /> Link URL</Radio.Button>
                                </Radio.Group>
                                <Form.Item name="background_music" noStyle>
                                    {musicMode === "upload" ? (
                                        <div style={{ marginTop: 8 }}>
                                            <FileUpload accept="audio/*" placeholder="Chọn file nhạc (.mp3, .wav...)" />
                                        </div>
                                    ) : (
                                        <Input prefix={<CustomerServiceOutlined />} placeholder="https://..." style={{ marginTop: 8 }} />
                                    )}
                                </Form.Item>
                           </Space>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider style={{ margin: '16px 0' }} />

                {/* --- Phần 3: Phần thưởng --- */}
                <Title level={5} style={{ marginBottom: 16 }}>
                    <GiftOutlined /> Phần thưởng chiến thắng (Lần đầu)
                </Title>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name={["rewards", "petals"]} label="Số Cánh hoa">
                            <InputNumber 
                                style={{ width: "100%" }} 
                                min={0} 
                                placeholder="0"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                addonBefore="🌸"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name={["rewards", "coins"]} label="Số Xu (Coins)">
                            <InputNumber 
                                style={{ width: "100%" }} 
                                min={0} 
                                placeholder="0"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                addonBefore="🪙"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider style={{ margin: '16px 0' }} />

                {/* --- Phần 4: Kiến thức bổ trợ (AI) --- */}
                <Title level={5} style={{ marginBottom: 16 }}>
                    <CustomerServiceOutlined /> Kiến thức bổ trợ (AI)
                </Title>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item 
                            name="knowledge_base" 
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
            </div>
        </FormModal>
    );
};

export default LevelForm;
