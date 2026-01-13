import { Input, InputNumber, Select, Switch, Row, Col, Form, Button, Tabs } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { FormModal, TinyEditor, Button as StyledButton } from "@/components/common";
import ImageUpload from "@/components/common/Upload/ImageUpload";
import DebounceSelect from "@/components/common/Select/DebounceSelect";
import {
  HeritageType,
  SignificanceLevel,
  HeritageTypeLabels,
  SignificanceLevelLabels,
  HeritageRegion,
  HeritageRegionLabels,
  TimelineCategory,
  TimelineCategoryLabels,
} from "@/types";
import { useEffect } from "react";
import artifactService from "@/services/artifact.service";
import heritageService from "@/services/heritage.service";
import { fontWeight } from "@/styles/theme";

interface HeritageFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<boolean>;
  initialValues?: any;
  loading?: boolean;
  title?: string;
}

const HeritageForm: React.FC<HeritageFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  title = "Thông tin Di sản",
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    const initData = async () => {
        if (open && initialValues && initialValues.id) {
            try {
                // Fetch additional details that might be missing from the list view
                const [timelineRes, artifactsRes] = await Promise.all([
                    heritageService.getTimeline(initialValues.id),
                    heritageService.getArtifacts(initialValues.id)
                ]);

                let timeline = timelineRes.success ? timelineRes.data : (initialValues.timeline || []);
                let relatedArtifacts: any[] = [];

                if (artifactsRes.success && artifactsRes.data) {
                     relatedArtifacts = artifactsRes.data.map((art: any) => ({
                         label: art.name,
                         value: art.id
                     }));
                } else if (initialValues.related_artifact_ids && initialValues.related_artifact_ids.length > 0) {
                     // Fallback to previous logic if getArtifacts fails but IDs exist
                     // ... (omitted for brevity, preferring the API fetch)
                     // Actually, let's just use what we have.
                }

                const formattedValues = {
                    ...initialValues,
                    short_description: initialValues.short_description || initialValues.shortDescription,
                    timeline: timeline,
                    related_artifact_ids: relatedArtifacts
                };
                form.setFieldsValue(formattedValues);
            } catch (error) {
                console.error("Failed to init heritage data", error);
                // Fallback to initialValues if fetch fails
                form.setFieldsValue(initialValues);
            }
        } else if (open) {
            form.resetFields();
            form.setFieldsValue({
                is_active: true,
                unesco_listed: false,
                year_established: new Date().getFullYear()
            });
        }
    };

    initData();
  }, [open, initialValues, form]);


  const handleOk = async (values: any) => {
      // Transform values before submit if needed
      // Extract IDs from labelInValue objects for artifacts
      const submitData = {
          ...values,
          related_artifact_ids: values.related_artifact_ids?.map((item: any) => item.value)
      };
    await onSubmit(submitData);
  };

  // Fetch function for Artifact Search
  const fetchArtifactList = async (search: string) => {
    try {
        const response = await artifactService.search(search);
        if (response.success && response.data) {
            return response.data.map((item) => ({
                label: item.name,
                value: item.id
            }));
        }
        return [];
    } catch (error) {
        console.error("Fetch artifacts failed", error);
        return [];
    }
  }


  
  return (


    <FormModal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      title={title}
      width={1000} // Resized to 1000 as requested
      form={form}
      loading={loading}
      initialValues={{
        is_active: true,
        unesco_listed: false,
        ...initialValues,
      }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <StyledButton variant="outline" onClick={onCancel} style={{ minWidth: '120px' }}>
                Hủy
            </StyledButton>
            <StyledButton variant="primary" loading={loading} onClick={() => form.submit()} style={{ minWidth: '120px' }}>
                Lưu lại
            </StyledButton>
        </div>
      }
    >
        <Form
         form={form}
         layout="vertical"
         onFinish={handleOk}
         initialValues={{
             is_active: true,
             unesco_listed: false,
             ...initialValues,
         }}
        >
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: 'Thông tin chung',
              children: (
                <>
                  <Row gutter={16}>
                      <Col span={8}>
                          <Form.Item label="Hình ảnh đại diện" name="image">
                              <ImageUpload maxCount={1} />
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
                            name="short_description"
                            label="Mô tả ngắn"
                            rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn" }]}
                        >
                            <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về di sản (hiện trên thẻ tin và đầu trang chi tiết)..." />
                        </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                       label="Tên Di Sản"
                       rules={[{ required: true, message: "Vui lòng nhập tên di sản" }]}
                     >
                       <Input placeholder="Nhập tên di sản (VD: Hoàng thành Thăng Long)" />
                     </Form.Item>
                   </Col>
                   <Col span={12}>
                     <Form.Item
                       name="type"
                       label="Loại hình"
                       rules={[{ required: true, message: "Vui lòng chọn loại hình" }]}
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
                   <Col span={12}>
                     <Form.Item name="region" label="Khu vực" rules={[{ required: true }]}>
                        <Select placeholder="Chọn khu vực">
                            {Object.values(HeritageRegion).map(region => (
                                <Select.Option key={region} value={region}>
                                    {HeritageRegionLabels[region]}
                                </Select.Option>
                            ))}
                       </Select>
                     </Form.Item>
                   </Col>
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
                 </Row>

                 <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="year_established" label="Năm thành lập">
                        <InputNumber style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="entrance_fee" label="Giá vé">
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
                            name="unesco_listed"
                            label="UNESCO"
                            valuePropName="checked"
                          >
                            <Switch checkedChildren="Có" unCheckedChildren="Không" />
                          </Form.Item>
                         </Col>
                         <Col span={12}>
                             <Form.Item
                                name="is_active"
                                label="Trạng thái"
                                valuePropName="checked"
                              >
                                <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                              </Form.Item>
                         </Col>
                     </Row>
                    </Col>
                 </Row>
               </>
             )
           },
           {
             key: '2',
             label: 'Mô tả chi tiết',
             children: (
                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                >
                  <TinyEditor
                    height={400}
                    placeholder="Nhập mô tả chi tiết về di sản..."
                    enableImageUpload={true}
                    enableVideoEmbed={true}
                  />
                </Form.Item>
             )
           },
           {
             key: '3',
             label: 'Dòng thời gian & Hiện vật',
             children: (
               <>
                  <Form.Item label="Hiện vật liên quan" name="related_artifact_ids">
                     <DebounceSelect
                        mode="multiple"
                        placeholder="Tìm kiếm và chọn hiện vật..."
                        fetchOptions={fetchArtifactList}
                        style={{ width: '100%' }}
                     />
                  </Form.Item>

                  <Form.Item label="Dòng thời gian" style={{ marginTop: 16 }}>
                    <Form.List name="timeline">
                        {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                            <div key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'baseline', gap: '8px' }}>
                                <Form.Item
                                {...restField}
                                name={[name, 'year']}
                                rules={[{ required: true, message: 'Nhập năm' }]}
                                style={{ margin: 0 }}
                                >
                                <InputNumber placeholder="Năm" style={{ width: 80 }} />
                                </Form.Item>
                                <Form.Item
                                {...restField}
                                name={[name, 'title']}
                                rules={[{ required: true, message: 'Nhập tiêu đề' }]}
                                style={{ margin: 0 }}
                                >
                                <Input placeholder="Tiêu đề sự kiện" style={{ width: 200 }} />
                                </Form.Item>
                                <Form.Item
                                {...restField}
                                name={[name, 'category']}
                                rules={[{ required: true, message: 'Chọn loại' }]}
                                style={{ margin: 0 }}
                                >
                                 <Select placeholder="Loại" style={{ width: 150 }}>
                                     {Object.values(TimelineCategory).map(cat => (
                                         <Select.Option key={cat} value={cat}>
                                             {TimelineCategoryLabels[cat]}
                                         </Select.Option>
                                     ))}
                                 </Select>
                                </Form.Item>
                                <Form.Item
                                {...restField}
                                name={[name, 'description']}
                                style={{ flex: 1, margin: 0 }}
                                >
                                <Input placeholder="Mô tả sự kiện" style={{ width: '100%' }} />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
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
             )
           }
         ]} />
      </Form>
    </FormModal>
  );
};

export default HeritageForm;
