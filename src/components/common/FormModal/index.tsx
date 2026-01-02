import React from 'react';
import { Modal, Form, Spin } from 'antd';
import { FormModalProps } from './types';

/**
 * Universal Form Modal Component
 * Reusable modal with form for create/edit operations
 */
const FormModal: React.FC<FormModalProps> = ({
  // Modal props
  open = false,
  onCancel,
  onOk,
  title = 'Form',
  width = 600,

  // Form props
  form,
  initialValues,
  loading = false,
  layout = 'vertical',

  // Children (form fields)
  children,

  // Customization
  okText = 'Lưu',
  cancelText = 'Hủy',
  centered = true,
  destroyOnClose = true,
  maskClosable = false,

  // Footer
  footer,

  ...modalProps
}) => {
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (onOk) {
        await onOk(values);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      width={width}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={loading}
      centered={centered}
      destroyOnClose={destroyOnClose}
      maskClosable={maskClosable}
      footer={footer}
      {...modalProps}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout={layout}
          initialValues={initialValues}
          preserve={false}
        >
          {children}
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormModal;
