import React, { useState } from 'react';
import { Modal, Form, Spin, Button } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined, CloseOutlined } from '@ant-design/icons';
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
  preserve = true,
  fullscreen: initialFullscreen = false,

  // Footer
  footer,

  ...modalProps
}) => {
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);

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
    setIsFullscreen(initialFullscreen); // Reset fullscreen state on close
    if (onCancel) {
      onCancel();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Custom title with fullscreen toggle button
  const modalTitle = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <Button
          type="text"
          size="small"
          icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
        />
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={handleCancel}
          title="Đóng"
        />
      </div>
    </div>
  );

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      width={isFullscreen ? '100vw' : width}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={loading}
      centered={!isFullscreen && centered}
      destroyOnClose={destroyOnClose}
      maskClosable={maskClosable}
      footer={footer}
      closable={false}
      style={isFullscreen ? { top: 0, paddingBottom: 0, maxWidth: '100vw' } : {}}
      bodyStyle={isFullscreen ? { height: 'calc(100vh - 110px)', overflowY: 'auto' } : {}}
      {...modalProps}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout={layout}
          initialValues={initialValues}
          preserve={preserve}
        >
          {children}
        </Form>
      </Spin>
    </Modal>
  );
};

export default FormModal;
