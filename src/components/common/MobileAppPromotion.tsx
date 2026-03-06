import React, { useEffect, useState } from "react";
import { Modal, Button, Typography } from "antd";
import { MobileOutlined, DownloadOutlined } from "@ant-design/icons";
import { isMobile } from "@/utils/helpers";
import { motion, AnimatePresence } from "framer-motion";

const { Title, Paragraph, Text } = Typography;

const APP_LINK = "https://drive.google.com/drive/folders/1zWg8dKGNLPvaB-_EK-dfb5wFvWIzQUc7?usp=sharing";

const MobileAppPromotion: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isMobile()) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDownload = () => {
    window.open(APP_LINK, "_blank");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <Modal
          open={isVisible}
          footer={null}
          closable={false}
          maskClosable={false}
          keyboard={false}
          centered
          width={340}
          zIndex={20000}
          className="premium-heritage-modal"
          bodyStyle={{ padding: 0, overflow: "hidden", borderRadius: 12 }}
          maskStyle={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.8)" }}
        >
          <div style={{
            background: "var(--paper-bg, #fdf8ef)",
            border: "2px solid #c5a065",
            borderRadius: 12,
            padding: "32px 24px",
            textAlign: "center",
            position: "relative",
            backgroundImage: "radial-gradient(circle at top right, rgba(197, 160, 101, 0.1), transparent)",
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{
                width: 72, height: 72,
                background: "linear-gradient(135deg, #fff7e6, #fff1d0)",
                border: "2px solid #c5a065",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 4px 15px rgba(168,7,26,0.15)"
              }}>
                <MobileOutlined style={{ fontSize: 36, color: "#a8071a" }} />
              </div>

              <Title level={4} style={{ color: "#5d4037", marginBottom: 12, fontFamily: "var(--font-serif)", fontSize: 20 }}>
                Thông Báo Quan Trọng
              </Title>

              <Paragraph style={{ color: "#8c7355", fontSize: 15, marginBottom: 24, lineHeight: "1.6" }}>
                Hệ thống nhận diện bạn đang truy cập từ thiết bị di động. Để tiếp tục, vui lòng tải và sử dụng ứng dụng thử nghiệm dành riêng cho di động.
              </Paragraph>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
                block
                onClick={handleDownload}
                style={{
                  background: "linear-gradient(180deg, #d4af37 0%, #c5a065 100%)",
                  borderColor: "#b8860b",
                  fontWeight: 700,
                  height: 52,
                  borderRadius: 10,
                  fontSize: 16,
                  boxShadow: "0 6px 15px rgba(184,134,11,0.4)"
                }}
              >
                Tải App Để Tiếp Tục
              </Button>

              <div style={{ marginTop: 24 }}>
                <Text type="secondary" style={{ fontSize: 12, opacity: 0.8, fontStyle: "italic" }}>
                  * Phiên bản Web hiện tại chỉ hỗ trợ tối ưu trên máy tính.
                </Text>
              </div>
            </motion.div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default MobileAppPromotion;
