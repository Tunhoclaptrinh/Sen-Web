import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import { FullscreenOutlined, FullscreenExitOutlined, CloseOutlined } from '@ant-design/icons';
import { ViewModalProps } from './types';

/**
 * Universal View Modal Component
 * Reusable modal for preview/view operations with fullscreen toggle
 */
const ViewModal: React.FC<ViewModalProps> = ({
  open = false,
  onClose,
  title = 'View',
  width = 1200,
  children,
  fullscreen: initialFullscreen = false,
  footer = null,
  titleExtra,
  ...modalProps
}) => {
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);

  const handleClose = () => {
    setIsFullscreen(initialFullscreen); // Reset fullscreen state on close
    if (onClose) {
      onClose();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Custom title with fullscreen toggle button
  const modalTitle = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{title}</span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        {titleExtra}
        <div style={{ display: 'flex', gap: '4px' }}>
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
            onClick={handleClose}
            title="Đóng"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={handleClose}
      width={isFullscreen ? '100vw' : width}
      footer={footer}
      centered={!isFullscreen}
      destroyOnClose
      closable={false}
      style={isFullscreen ? { top: 0, paddingBottom: 0, maxWidth: '100vw' } : {}}
      bodyStyle={isFullscreen ? { height: 'calc(100vh - 110px)', overflowY: 'auto' } : {}}
      {...modalProps}
    >
      {children}
    </Modal>
  );
};

export default ViewModal;
