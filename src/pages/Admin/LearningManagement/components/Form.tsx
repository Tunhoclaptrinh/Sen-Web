import React from 'react';
import { Form, Input, Select, InputNumber, Button, Steps, Row, Col } from 'antd';
import { ReadOutlined, PlusOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import TinyEditor from '@/components/common/TinyEditor';
import ImageUpload from '@/components/common/Upload/ImageUpload';
import { FormModal, Button as StyledButton } from '@/components/common';

interface LearningFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => void;
    initialValues?: any;
    loading?: boolean;
    isEdit?: boolean;
}

// Custom component to handle both URL input and Upload
const ThumbnailInput: React.FC<{ value?: string; onChange?: (val: string) => void }> = ({ value, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ImageUpload 
                value={value} 
                onChange={(val: string | string[]) => {
                    const url = Array.isArray(val) ? val[0] : val;
                    onChange?.(url || '');
                }} 
            />
            <Input 
                placeholder="Hoặc nhập URL hình ảnh tại đây..." 
                value={value} 
                onChange={(e) => onChange?.(e.target.value)}
                prefix={<ReadOutlined />}
            />
        </div>
    );
};

const LearningForm: React.FC<LearningFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    loading,
    isEdit
}) => {
    const [currentStep, setCurrentStep] = React.useState(0);
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (visible) {
            form.resetFields();
            setCurrentStep(0);
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.setFieldsValue({ 
                    difficulty: 'easy', 
                    estimated_duration: 30, 
                    content_type: 'article', 
                    quiz: { passing_score: 50, questions: [] } 
                });
            }
        }
    }, [visible, initialValues, form]);

    const handleFinish = (values: any) => {
        onSubmit(values);
    };

    const next = async () => {
        try {
            // Validate fields for the current step
            if (currentStep === 0) {
                await form.validateFields(['title', 'thumbnail', 'difficulty', 'estimated_duration', 'content_type', 'content_url', 'description']);
            }
            setCurrentStep(currentStep + 1);
        } catch (error) {
            // Validation failed
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmitClick = async () => {
        try {
            const values = await form.validateFields();
            handleFinish(values);
        } catch (error) {
            console.error("Validation failed:", error);
        }
    }

    return (
        <FormModal
            title={isEdit ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
            open={visible}
            onCancel={onCancel}
            width={900}
            form={form} // Pass form instance to FormModal if supported, or just use it for styling
            footer={
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <StyledButton variant="outline" onClick={onCancel}>
                        Hủy bỏ
                    </StyledButton>
                    {currentStep > 0 && (
                        <StyledButton variant="outline" onClick={prev}>
                            Quay lại
                        </StyledButton>
                    )}
                    {currentStep < 1 && (
                        <StyledButton variant="primary" onClick={next}>
                            Tiếp theo
                        </StyledButton>
                    )}
                    {currentStep === 1 && (
                        <StyledButton variant="primary" loading={loading} onClick={handleSubmitClick}>
                            {isEdit ? 'Cập nhật' : 'Hoàn tất'}
                        </StyledButton>
                    )}
                </div>
            }
        >
            <div style={{ marginBottom: 24 }}>
                <Steps current={currentStep}>
                    <Steps.Step title="Thông tin chung" description="Thiết lập nội dung" />
                    <Steps.Step title="Cấu hình Quiz" description="Câu hỏi & Trắc nghiệm" />
                </Steps>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
            >
                <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="title"
                                label="Tiêu đề bài học"
                                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                            >
                                <Input prefix={<ReadOutlined />} placeholder="Ví dụ: Lịch sử nhà Đinh" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item
                                name="thumbnail"
                                label="Hình ảnh (Upload hoặc URL)"
                            >
                                <ThumbnailInput />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="difficulty" label="Độ khó">
                                <Select>
                                    <Select.Option value="easy">Easy (Dễ)</Select.Option>
                                    <Select.Option value="medium">Medium (Trung bình)</Select.Option>
                                    <Select.Option value="hard">Hard (Khó)</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                             <Form.Item name="estimated_duration" label="Thời gian (phút)">
                                <InputNumber style={{ width: '100%' }} min={1} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                             <Form.Item name="content_type" label="Loại nội dung">
                                <Select>
                                    <Select.Option value="article">Article (Bài đọc)</Select.Option>
                                    <Select.Option value="video">Video</Select.Option>
                                    <Select.Option value="interactive">Interactive (Tương tác)</Select.Option>
                                    <Select.Option value="quiz">Quiz</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prev, current) => prev.content_type !== current.content_type}
                    >
                        {({ getFieldValue }) => {
                            const type = getFieldValue('content_type');
                            return type === 'video' ? (
                                <Form.Item name="content_url" label="Video URL (Embed Link)" rules={[{ required: true }]}>
                                    <Input placeholder="https://www.youtube.com/embed/..." />
                                </Form.Item>
                            ) : type === 'article' ? (
                                <Form.Item name="content_url" label="Nội dung bài học (HTML)" trigger="onChange" validateTrigger={['onChange', 'onBlur']}>
                                    <TinyEditor height={400} placeholder="Soạn thảo nội dung bài học..." />
                                </Form.Item>
                            ) : type === 'interactive' ? (
                                <Form.Item name="content_url" label="Đường dẫn Game/App" rules={[{ required: true }]}>
                                    <Input placeholder="/game/..." />
                                </Form.Item>
                            ) : null;
                        }}
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả ngắn">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </div>

                {/* Quiz Builder (Step 2) */}
                <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                    <div style={{ background: '#f9f9f9', padding: 24, borderRadius: 12, border: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#1f1f1f' }}>Cấu hình Quiz</h3>
                                <p style={{ margin: '4px 0 0', color: '#8c8c8c', fontSize: 13 }}>Thiết lập các câu hỏi kiểm tra kiến thức</p>
                            </div>
                            <Form.Item name={['quiz', 'passing_score']} label="Điểm đạt (Passing Score)" style={{ margin: 0, width: 180 }}>
                                <InputNumber min={0} max={100} addonAfter="điểm" />
                            </Form.Item>
                        </div>
                        
                        <Form.List name={['quiz', 'questions']}>
                            {(fields, { add, remove }) => (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {fields.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#bfbfbf', border: '2px dashed #d9d9d9', borderRadius: 8 }}>
                                            <QuestionCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                            <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi mới!</p>
                                        </div>
                                    )}
                                    {fields.map(({ key, name, ...restField }, index) => (
                                        <div key={key} style={{ 
                                            padding: 24, 
                                            background: '#fff', 
                                            borderRadius: 12, 
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                            border: '1px solid #e6e6e6',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ 
                                                position: 'absolute', top: 0, left: 0, width: 4, height: '100%', 
                                                background: '#1890ff' 
                                            }} />
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                                <h4 style={{ margin: 0, color: '#1890ff' }}>Câu hỏi #{index + 1}</h4>
                                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)}>Xóa câu hỏi</Button>
                                            </div>
                                            
                                            <div style={{ display: 'flex', gap: 16 }}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'question']}
                                                    label="Nội dung câu hỏi"
                                                    rules={[{ required: true, message: 'Nhập câu hỏi' }]}
                                                    style={{ flex: 1 }}
                                                >
                                                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="Nhập nội dung câu hỏi..." />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'point']}
                                                    label="Điểm số"
                                                    initialValue={10}
                                                    rules={[{ required: true, message: 'Nhập điểm' }]}
                                                    style={{ width: 120 }}
                                                >
                                                    <InputNumber min={1} style={{ width: '100%' }} />
                                                </Form.Item>
                                            </div>
                                            
                                            <div style={{ background: '#fcfcfc', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                                                <Form.List name={[name, 'options']}>
                                                    {(optFields, { add: addOpt, remove: removeOpt }) => (
                                                        <>
                                                            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontWeight: 600, fontSize: 13, color: '#595959' }}>CÁC LỰA CHỌN TRẢ LỜI</span>
                                                                <Button type="dashed" size="small" onClick={() => addOpt()} icon={<PlusOutlined />}>Thêm lựa chọn</Button>
                                                            </div>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                                {optFields.map((opt, optIdx) => (
                                                                    <div key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                        <div style={{ 
                                                                            width: 24, height: 24, borderRadius: '50%', background: '#e6f7ff', 
                                                                            color: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                            fontSize: 12, fontWeight: 700 
                                                                        }}>
                                                                            {optIdx}
                                                                        </div>
                                                                        <Form.Item
                                                                            {...opt}
                                                                            name={[opt.name]}
                                                                            noStyle
                                                                            rules={[{ required: true, message: 'Nhập lựa chọn' }]}
                                                                        >
                                                                            <Input placeholder={`Lựa chọn ${optIdx}`} />
                                                                        </Form.Item>
                                                                        <Button size="small" type="text" danger onClick={() => removeOpt(opt.name)}><DeleteOutlined /></Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </Form.List>
                                            </div>

                                            <div style={{ marginTop: 16 }}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'correct_answer']}
                                                    label="Đáp án đúng (Index)"
                                                    help="Nhập số thứ tự của đáp án đúng (bắt đầu từ 0)"
                                                    rules={[{ required: true }]}
                                                    style={{ marginBottom: 0, width: 200 }}
                                                >
                                                    <InputNumber min={0} placeholder="VD: 0" style={{ width: '100%' }} />
                                                </Form.Item>
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} size="large" style={{ height: 48 }}>
                                        Thêm câu hỏi mới
                                    </Button>
                                </div>
                            )}
                        </Form.List>
                    </div>
                </div>
            </Form>
        </FormModal>
    );
};

export default LearningForm;
