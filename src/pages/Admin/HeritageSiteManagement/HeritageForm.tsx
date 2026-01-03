import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select, Switch, Row, Col } from "antd";
import { FormModal, toast } from "@/components/common";
import heritageService from "@/services/heritage.service";
import { HeritageType, SignificanceLevel } from "@/types/heritage.types";

interface HeritageFormProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    initialValues?: any;
    title?: string;
}

const HeritageForm: React.FC<HeritageFormProps> = ({
    open,
    onCancel,
    onSuccess,
    initialValues,
    title = "Thêm mới Di sản",
}) => {
    const [form] = Form.useForm();
    const isEdit = !!initialValues;

    useEffect(() => {
        if (open && initialValues) {
            form.setFieldsValue(initialValues);
        } else {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    const handleSubmit = async (values: any) => {
        try {
            if (isEdit && initialValues?.id) {
                await heritageService.update(initialValues.id, values);
                toast.success("Cập nhật di sản thành công");
            } else {
                await heritageService.create(values);
                toast.success("Thêm mới di sản thành công");
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra");
        }
    };

    return (
        <FormModal
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            title={title}
            width={800}
            form={form}
            initialValues={{ is_active: true, unesco_listed: false, ...initialValues }}
        >
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
                                <Select.Option key={type} value={type}>{type}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
                <Input.TextArea rows={4} placeholder="Mô tả chi tiết về di sản..." />
            </Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="region" label="Khu vực" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="Bắc">Miền Bắc</Select.Option>
                            <Select.Option value="Trung">Miền Trung</Select.Option>
                            <Select.Option value="Nam">Miền Nam</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="significance" label="Tầm quan trọng">
                        <Select placeholder="Chọn quy mô">
                            {Object.values(SignificanceLevel).map((level) => (
                                <Select.Option key={level} value={level}>{level}</Select.Option>
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
                        <InputNumber style={{ width: "100%" }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value!.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="latitude" label="Vĩ độ">
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="longitude" label="Kinh độ">
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row>

            <Row>
                <Col span={6}>
                    <Form.Item name="unesco_listed" label="UNESCO công nhận" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="is_active" label="Kích hoạt" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Col>
            </Row>
        </FormModal>
    );
};

export default HeritageForm;
