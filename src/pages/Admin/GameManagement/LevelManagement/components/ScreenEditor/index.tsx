import { Form, Select, Button, Input, Space, message, Divider, Alert, Row, Col, Radio } from "antd";
import { useEffect, useState } from "react";
import { Screen, SCREEN_TYPES, ScreenType } from "@/types/game.types";
import adminScreenService from "@/services/admin-screen.service";
import GameSimulator from "../GameSimulator";
import { FormModal } from "@/components/common";
import { 
    EyeOutlined, 
    CloudUploadOutlined, 
    LinkOutlined, 
    PictureOutlined,
    DoubleRightOutlined
} from "@ant-design/icons";
import { Switch } from "antd";
import ImageUpload from "@/components/common/Upload/ImageUpload";

// Sub-editors
import {
  DialogueEditor,
  QuizEditor,
  HiddenObjectEditor,
  TimelineEditor,
  MediaEditor
} from "./components";

interface ScreenEditorProps {
  levelId: number;
  levelMetadata?: {
    chapterId: number;
    chapterName?: string;
    levelName?: string;
    order: number;
    backgroundMusic?: string;
  };
  screensCount?: number;
  screen?: Screen | null;
  onSuccess: () => void;
  onCancel: () => void;
  open?: boolean; // New prop for modal control
}

const getInitials = (str?: string): string => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "D")) // Fix for đ character
        .split(/[\s_-]+/)
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, ""); // Final cleanup
};

const ScreenEditor: React.FC<ScreenEditorProps> = ({ 
    levelId, 
    levelMetadata,
    screensCount = 0,
    screen, 
    onSuccess, 
    onCancel,
    open = false
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<ScreenType>(SCREEN_TYPES.DIALOGUE);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [bgMode, setBgMode] = useState<'upload' | 'link'>('upload');

  // Initialize form
  useEffect(() => {
    if (open) {
        if (screen) {
            form.setFieldsValue(screen);
            setType(screen.type);
            if (screen.backgroundImage) {
                setBgMode(screen.backgroundImage.startsWith('http') ? 'link' : 'upload');
            }
        } else {
            form.resetFields();
            setType(SCREEN_TYPES.DIALOGUE);
            setBgMode('upload');
            
            // Auto-generate ID if metadata is available
            let generatedId = "";
            if (levelMetadata) {
                const chapterPrefix = getInitials(levelMetadata.chapterName) || `C${levelMetadata.chapterId}`;
                const levelPrefix = getInitials(levelMetadata.levelName) || `L${levelMetadata.order}`;
                const nextIndex = screensCount + 1;
                generatedId = `${chapterPrefix}_${levelPrefix}_S${nextIndex}`;
            }

            form.setFieldsValue({ 
                type: SCREEN_TYPES.DIALOGUE,
                id: generatedId,
                isFirst: screensCount === 0,
                isLast: true, // Default to true for new screens, user can change
                skipAllowed: true
            });
        }
    }
  }, [screen, form, open, levelMetadata, screensCount]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Type-specific validation
      if (type === SCREEN_TYPES.QUIZ) {
        if (!values.question || values.question.trim() === '') {
          message.error("Câu hỏi không được để trống!");
          setLoading(false);
          return;
        }
        if (!values.options || values.options.length < 2) {
          message.error("Quiz cần ít nhất 2 đáp án!");
          setLoading(false);
          return;
        }
        if (!values.options.some((o: any) => o.is_correct)) {
          message.error("Quiz cần ít nhất 1 đáp án đúng!");
          setLoading(false);
          return;
        }
      }

      if (type === SCREEN_TYPES.DIALOGUE) {
        if (!values.content || values.content.length === 0) {
          message.error("Dialogue cần ít nhất 1 đoạn hội thoại!");
          setLoading(false);
          return;
        }
      }

      if (type === SCREEN_TYPES.HIDDEN_OBJECT) {
        if (!values.items || values.items.length === 0) {
          message.error("Hidden Object cần ít nhất 1 vật phẩm!");
          setLoading(false);
          return;
        }
      }
      const submitValues = { ...values };
      if (screen) {
        // Update
        const res = await adminScreenService.updateScreen(levelId, screen.id, submitValues);
        if (res.success) {
          message.success("Cập nhật màn chơi thành công");
          onSuccess();
        } else {
          message.error(res.message || "Cập nhật thất bại");
        }
      } else {
        // Create
        const res = await adminScreenService.addScreen(levelId, submitValues);
        if (res.success) {
           message.success("Thêm màn chơi thành công");
           onSuccess();
        } else {
          message.error(res.message || "Thêm mới thất bại");
        }
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Có lỗi xảy ra khi lưu màn chơi");
    } finally {
      setLoading(false);
    }
  };

  const renderSpecificEditor = () => {
      switch (type) {
          case SCREEN_TYPES.DIALOGUE:
              return <DialogueEditor form={form} />;
          case SCREEN_TYPES.QUIZ:
              return <QuizEditor form={form} />;
          case SCREEN_TYPES.HIDDEN_OBJECT:
              return <HiddenObjectEditor form={form} />;
          case SCREEN_TYPES.TIMELINE:
              return <TimelineEditor form={form} />;
          case SCREEN_TYPES.IMAGE_VIEWER:
          case SCREEN_TYPES.VIDEO:
              return <MediaEditor form={form} type={type} />;
          default:
              return <div style={{padding: 20, color: '#999'}}>Chưa hỗ trợ loại màn hình này</div>;
      }
  }

  return (
    <>
        <FormModal
            title={screen ? `Chỉnh sửa Màn chơi` : "Thêm Màn chơi mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            width={1000}
            form={form}
            loading={loading}
            footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', padding: '16px 24px', background: '#fafafa', borderTop: '1px solid #f0f0f0', borderRadius: '0 0 16px 16px' }}>
                    <div style={{ marginRight: 'auto' }}>
                        <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => setPreviewVisible(true)}
                            disabled={loading}
                            style={{ borderRadius: 8 }}
                        >
                            Xem trước
                        </Button>
                    </div>
                    <Space size={12}>
                        <Button 
                            onClick={onCancel} 
                            disabled={loading}
                            style={{ borderRadius: 8, minWidth: 100 }}
                        >
                            Hủy
                        </Button>
                        <Button 
                            type="primary" 
                            onClick={() => {
                                form.validateFields()
                                    .then(values => {
                                        handleSubmit(values);
                                    })
                                    .catch(() => {
                                    });
                            }}
                            loading={loading}
                            style={{ borderRadius: 8, minWidth: 120, boxShadow: '0 4px 10px rgba(var(--primary-color-rgb), 0.2)' }}
                        >
                            {screen ? 'Cập nhật' : 'Tạo màn chơi'}
                        </Button>
                    </Space>
                </div>
            }
        >
            <div style={{ padding: '0 4px' }}>
                {screen && (
                <Alert
                    message={
                        <span>
                            Đang chỉnh sửa màn chơi ID: <code style={{ color: '#eb2f96' }}>{screen.id}</code>
                        </span>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 20, borderRadius: 8 }}
                />
                )}
                
                <Row gutter={16}>
                    <Col span={10}>
                        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 12, border: '1px solid #f0f0f0', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <Space direction="vertical" style={{ width: '100%' }} size={16}>
                                {!screen && (
                                    <Form.Item 
                                        name="id" 
                                        label={<span style={{ fontWeight: 600, color: '#555' }}>Mã ID Màn chơi</span>}
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Input placeholder="Tự động tạo (C_L_S1...)" size="large" style={{ borderRadius: 8 }} />
                                    </Form.Item>
                                )}
                                
                                <Form.Item 
                                    name="type" 
                                    label={<span style={{ fontWeight: 600, color: '#555' }}>Loại màn hình</span>}
                                    rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Select 
                                        size="large"
                                        onChange={(val) => setType(val)} 
                                        disabled={!!screen}
                                        placeholder="Chọn loại kịch bản..."
                                        style={{ width: '100%' }}
                                        dropdownStyle={{ borderRadius: 8 }}
                                    >
                                        {Object.keys(SCREEN_TYPES).map((key) => (
                                            <Select.Option key={key} value={key}>
                                                <Space>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-color)' }} />
                                                    {key}
                                                </Space>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
                                    <Space size={8}>
                                        <DoubleRightOutlined style={{ color: 'var(--primary-color)' }} />
                                        <span style={{ fontWeight: 600, color: '#555' }}>Cho phép Bỏ qua (Skip)</span>
                                    </Space>
                                    <Form.Item name="skipAllowed" valuePropName="checked" noStyle>
                                        <Switch />
                                    </Form.Item>
                                </div>
                            </Space>
                        </div>
                    </Col>
                    
                    <Col span={14}>
                        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 12, border: '1px solid #f0f0f0', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <Form.Item label={<span style={{ fontWeight: 600, color: '#555' }}>Hình nền riêng (Ghi đè Level)</span>} style={{ marginBottom: 0 }}>
                                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                    <Radio.Group 
                                        size="middle" 
                                        value={bgMode} 
                                        onChange={(e) => setBgMode(e.target.value)}
                                        optionType="button"
                                        buttonStyle="solid"
                                    >
                                        <Radio.Button value="upload" style={{ borderRadius: '6px 0 0 6px' }}><CloudUploadOutlined /> Tải lên</Radio.Button>
                                        <Radio.Button value="link" style={{ borderRadius: '0 6px 6px 0' }}><LinkOutlined /> Link</Radio.Button>
                                    </Radio.Group>
                                    
                                    {bgMode === "upload" ? (
                                        <Form.Item name="backgroundImage" noStyle>
                                            <ImageUpload maxCount={1} />
                                        </Form.Item>
                                    ) : (
                                        <Form.Item name="backgroundImage" noStyle>
                                            <Input 
                                                prefix={<PictureOutlined style={{color: '#bfbfbf'}} />} 
                                                placeholder="Dán đường dẫn ảnh (https://...)" 
                                                size="large"
                                                style={{ borderRadius: 8 }} 
                                            />
                                        </Form.Item>
                                    )}
                                </Space>
                            </Form.Item>
                        </div>
                    </Col>
                </Row>

                <Divider orientation="left" plain style={{ margin: '8px 0 24px' }}>
                    <span style={{ color: '#8c8c8c', fontSize: 13, fontWeight: 500 }}>NỘI DUNG CHI TIẾT</span>
                </Divider>

                {/* Dynamic Editor Content */}
                <div style={{ 
                    background: '#fafafa', 
                    padding: '24px', 
                    borderRadius: 12, 
                    border: '1px solid #f0f0f0',
                    marginBottom: 8,
                    minHeight: 250 
                }}>
                    {renderSpecificEditor()}
                </div>
            </div>
        </FormModal>

        {/* Local Preview */}
        <GameSimulator 
            visible={previewVisible}
            onClose={() => setPreviewVisible(false)}
            screens={[{...form.getFieldsValue(), type, id: screen?.id || 'preview'} as any]} 
            title="Xem trước màn hình kịch bản"
            bgmUrl={levelMetadata?.backgroundMusic}
        />
    </>
  );
};

export default ScreenEditor;
