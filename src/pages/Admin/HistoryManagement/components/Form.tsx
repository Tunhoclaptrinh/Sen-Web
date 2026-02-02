import { Input, Switch, Row, Col, Form, Tabs, message } from "antd";
import { FormModal, TinyEditor, Button as StyledButton, DebounceSelect } from "@/components/common";
import ImageUpload from "@/components/common/Upload/ImageUpload";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import heritageService from "@/services/heritage.service";
import artifactService from "@/services/artifact.service";


interface HistoryFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<boolean>;
  initialValues?: any;
  loading?: boolean;
  title?: string;
  isEdit?: boolean;
}

const HistoryForm: React.FC<HistoryFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  isEdit = false,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");
  const isEditMode = isEdit || (initialValues && initialValues.id);

  useEffect(() => {
    if (open) setActiveTab("1");
  }, [open]);

  useEffect(() => {
    const initData = async () => {
        // 1. Edit Mode
        if (open && isEditMode) {
            try {
                // Fetch labels for related IDs
                const [relHeritageRes, relArtifactRes] = await Promise.all([
                    initialValues.related_heritage_ids?.length > 0 
                      ? heritageService.getAll({ ids: initialValues.related_heritage_ids.join(',') })
                      : Promise.resolve({ success: true, data: [] }),
                    initialValues.related_artifact_ids?.length > 0
                      ? artifactService.getAll({ ids: initialValues.related_artifact_ids.join(',') })
                      : Promise.resolve({ success: true, data: [] })
                ]);

                // Map related heritage to {label, value}
                const relatedHeri = (initialValues.related_heritage_ids || []).map((id: any) => {
                    const heri = relHeritageRes.success && relHeritageRes.data 
                      ? relHeritageRes.data.find((h: any) => h.id === (typeof id === 'object' ? id.value : id)) 
                      : null;
                    return heri ? { label: heri.name, value: heri.id } : (typeof id === 'object' ? id : { label: `ID: ${id}`, value: id });
                });

                // Map related artifacts to {label, value}
                const relatedArtifacts = (initialValues.related_artifact_ids || []).map((id: any) => {
                    const art = relArtifactRes.success && relArtifactRes.data 
                      ? relArtifactRes.data.find((a: any) => a.id === (typeof id === 'object' ? id.value : id)) 
                      : null;
                    return art ? { label: art.name, value: art.id } : (typeof id === 'object' ? id : { label: `ID: ${id}`, value: id });
                });

                const formattedValues = {
                    ...initialValues,
                    shortDescription: initialValues.short_description || initialValues.shortDescription,
                    publishDate: initialValues.publishDate ? dayjs(initialValues.publishDate) : dayjs(),
                    related_heritage_ids: relatedHeri,
                    related_artifact_ids: relatedArtifacts
                };
                form.setFieldsValue(formattedValues);
            } catch (error) {
                console.error("Failed to init history data", error);
                form.setFieldsValue({
                    ...initialValues,
                    publishDate: initialValues.publishDate ? dayjs(initialValues.publishDate) : dayjs()
                });
            }
        } 
        // 2. Create Mode -> Aggressive Reset
        else if (open) {
            const currentFields = form.getFieldsValue(true);
            const resetValues = Object.keys(currentFields).reduce((acc: any, key) => {
                acc[key] = undefined;
                return acc;
            }, {});
            form.setFieldsValue(resetValues);
            form.resetFields();
            
            form.setFieldsValue({
                isActive: true,
                publishDate: dayjs(),
                views: 0
            });
        }
    };

    initData();
  }, [open, isEditMode, initialValues, form]);

  const handleOk = async (values: any) => {
    // Transform values before submit
    const submitData = {
        ...values,
        shortDescription: values.shortDescription,
        publishDate: values.publishDate?.toISOString(),
        image: (() => {
          const raw = Array.isArray(values.image) ? values.image[0] : values.image;
          if (typeof raw === "object") return raw?.url || raw?.response?.url || "";
          return raw || "";
        })(),
        gallery: values.gallery?.map((item: any) => 
          typeof item === "object" ? (item.url || item.response?.url || "") : item
        ) || [],
        related_heritage_ids: values.related_heritage_ids?.map((item: any) => 
          typeof item === 'object' ? item.value : item
        ) || [],
        related_artifact_ids: values.related_artifact_ids?.map((item: any) => 
          typeof item === 'object' ? item.value : item
        ) || []
    };
    const success = await onSubmit(submitData);
    if (success) {
      form.resetFields();
    }
  };

  const handleSubmitClick = async () => {
    try {
      const values = await form.validateFields();
      await handleOk(values);
    } catch (error: any) {
      console.error("Validation failed:", error);
      
      if (error.errorFields && error.errorFields.length > 0) {
        const firstErrorField = error.errorFields[0].name[0];
        
        // Map fields to tabs
        const tab1Fields = ['image', 'gallery', 'title', 'shortDescription', 'author', 'publishDate', 'isActive'];
        const tab2Fields = ['content'];
        const tab3Fields = ['related_heritage_ids', 'related_artifact_ids', 'related_level_ids'];

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

  // Fetch functions for Search
  const fetchHeritageList = async (search: string) => {
    try {
        const response = await heritageService.getAll({ q: search, _limit: 10 });
        return response.success && response.data ? response.data.map((item: any) => ({
            label: item.name,
            value: item.id
        })) : [];
    } catch (error) {
        return [];
    }
  }

  const fetchArtifactList = async (search: string) => {
    try {
        const response = await artifactService.getAll({ q: search, _limit: 10 });
        return response.success && response.data ? response.data.map((item: any) => ({
            label: item.name,
            value: item.id
        })) : [];
    } catch (error) {
        return [];
    }
  }

  return (
    <FormModal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      title={isEdit ? "Cập nhật Bài viết" : "Thêm mới Bài viết"}
      width={1000}
      form={form}
      loading={loading}
      preserve={false}
      footer={
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <StyledButton variant="outline" onClick={onCancel} style={{ minWidth: '120px' }}>
                Hủy
            </StyledButton>
            <StyledButton variant="primary" loading={loading} onClick={handleSubmitClick} style={{ minWidth: '120px' }}>
                Lưu lại
            </StyledButton>
        </div>
      }
    >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
            {
                key: '1',
                label: 'Thông tin cơ bản',
                children: (
                    <>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item label="Hình ảnh đại diện" name="image">
                                    <ImageUpload maxCount={1} folder="history/main" />
                                </Form.Item>
                            </Col>
                            <Col span={16}>
                                <Form.Item label="Thư viện ảnh" name="gallery">
                                    <ImageUpload maxCount={10} folder="history/gallery" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="title"
                                    label="Tiêu đề bài viết"
                                    rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                                >
                                    <Input placeholder="Nhập tiêu đề bài viết lịch sử..." />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="shortDescription"
                                    label="Mô tả ngắn"
                                    rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn" }]}
                                >
                                    <Input.TextArea rows={3} placeholder="Mô tả tóm tắt nội dung..." />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="author" label="Tác giả">
                                    <Input placeholder="Tên tác giả..." />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="isActive" label="Hiển thị" valuePropName="checked">
                                    <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                )
            },
            {
                key: '2',
                label: 'Nội dung chi tiết',
                children: (
                    <Form.Item
                        name="content"
                        label="Nội dung bài viết"
                        rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                    >
                        <TinyEditor
                            height={500}
                            placeholder="Viết nội dung bài viết tại đây..."
                            enableImageUpload={true}
                            enableVideoEmbed={true}
                        />
                    </Form.Item>
                )
            },
            {
                key: '3',
                label: 'Liên kết liên quan',
                children: (
                    <>
                        <Form.Item label="Di sản liên quan" name="related_heritage_ids">
                            <DebounceSelect
                                mode="multiple"
                                placeholder="Tìm kiếm di sản..."
                                fetchOptions={fetchHeritageList}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        
                        <Form.Item label="Hiện vật liên quan" name="related_artifact_ids">
                            <DebounceSelect
                                mode="multiple"
                                placeholder="Tìm kiếm hiện vật..."
                                fetchOptions={fetchArtifactList}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </>
                )
            }
        ]} />
    </FormModal>
  );
};

export default HistoryForm;
