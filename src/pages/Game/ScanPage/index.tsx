import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Card, Button, Typography, Result, Spin, message, Tag, Space} from "antd";
import {QrcodeOutlined, GiftOutlined, ArrowLeftOutlined, ReloadOutlined, EnvironmentFilled, StarFilled} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import QRScanner from "@/components/Game/QRScanner";
import {gameService} from "@/services";
import {ITEM_TYPES} from "@/config/constants";
import "./styles.less";

const {Text} = Typography;

const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null); // Scan result data

  const handleScan = async (decodedText: string) => {
    if (processing || !scanning) return;
    setScanning(false);
    setProcessing(true);

    try {

      // Check if it's a Check-in code
      if (decodedText.startsWith("CHECKIN_")) {
        const locationId = parseInt(decodedText.replace("CHECKIN_", ""));
        if (!isNaN(locationId)) {
          const res = await gameService.checkIn(locationId);
          setResult({
            success: true,
            type: "checkin",
            data: res,
          });
        } else {
          message.error("Mã Check-in không hợp lệ!");
          setScanning(true);
        }
      }
      // Assume it's a game object/artifact code
      else {
        const res = await gameService.scanObject(decodedText);
        setResult({
          success: true,
          type: ITEM_TYPES.ARTIFACT,
          data: res,
        });
      }
    } catch (error: any) {
      console.error("Scan error:", error);
      // If error is 404/400, show failure result
      setResult({
        success: false,
        message: error.response?.data?.message || "Không tìm thấy vật phẩm hoặc địa điểm này.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setScanning(true);
  };

  const renderResult = () => {
    if (!result) return null;

    if (!result.success) {
      return (
        <Result
          status="error"
          title="Quét thất bại"
          subTitle={result.message}
          extra={[
            <Button type="primary" key="retry" icon={<ReloadOutlined />} onClick={handleReset}>
              Thử lại ngay
            </Button>,
            <Button key="back" onClick={() => navigate(-1)}>
              Quay lại trang chủ
            </Button>,
          ]}
        />
      );
    }

    if (result.type === "checkin") {
      const {pointsEarned, locationName, totalCheckins} = result.data;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Result
            status="success"
            icon={
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <EnvironmentFilled style={{color: "#8b1d1d", fontSize: 64}} />
              </motion.div>
            }
            title="Ghi danh thành công!"
            subTitle={
              <span>
                Tại hạ đã ghi danh bạn tại <strong>{locationName}</strong>
              </span>
            }
            extra={[
              <div key="stats" className="result-stats">
                <motion.div
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.4 }}
                >
                  <Text strong style={{fontSize: 22, color: "#faad14", display: "block", marginBottom: 8}}>
                    +{pointsEarned} Công đức
                  </Text>
                </motion.div>
                <Text type="secondary">
                  Đã ghé thăm: <strong>{totalCheckins}</strong> lần
                </Text>
              </div>,
              <Button type="primary" key="map" onClick={() => navigate("/map")}>
                Xem bản đồ di tích
              </Button>,
              <Button key="continue" onClick={handleReset}>
                Tiếp tục tầm bảo
              </Button>,
            ]}
          />
        </motion.div>
      );
    }

    if (result.type === ITEM_TYPES.ARTIFACT) {
      const {artifact, rewards, isNewDiscovery, newBadges} = result.data;
      return (
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, type: "spring" }}
        >
          <Result
            status="success"
            icon={
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              >
                <GiftOutlined style={{color: "#c5a065", fontSize: 64}} />
              </motion.div>
            }
            title={isNewDiscovery ? "Phát hiện Kỳ vật!" : "Thu thập Kỳ vật"}
            subTitle={artifact.name}
            extra={[
              <motion.div 
                key="artifact-img" 
                className="artifact-preview"
                whileHover={{ scale: 1.05 }}
              >
                <img src={artifact.image} alt={artifact.name} />
                {isNewDiscovery && <div className="new-badge-tag">MỚI</div>}
              </motion.div>,
              
              <div key="stats" className="result-stats">
                <Text type="secondary" style={{display: "block", marginBottom: 12, fontStyle: "italic"}}>
                  {artifact.description}
                </Text>
                
                <Space size="large">
                   <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="reward-item"
                   >
                     <StarFilled style={{ color: '#faad14' }} />
                     <Text strong style={{fontSize: 20, color: "#faad14"}}> +{rewards.coins} Xu</Text>
                   </motion.div>
                   
                   <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="reward-item"
                   >
                     <div className="petal-icon-mini" />
                     <Text strong style={{fontSize: 20, color: "#eb2f96"}}> +{rewards.petals} Cánh Sen</Text>
                   </motion.div>
                </Space>

                {newBadges && newBadges.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">Danh hiệu đạt được:</Text>
                    <div style={{ marginTop: 8 }}>
                      {newBadges.map((b: any) => (
                        <Tag key={b.id} color="purple">{b.name}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>,
              
              <Button type="primary" key="collection" onClick={() => navigate("/profile/library")}>
                Vào tàng kinh các
              </Button>,
              <Button key="continue" onClick={handleReset}>
                Tiếp tục tìm kiếm
              </Button>,
            ]}
          />
        </motion.div>
      );
    }
  };

  return (
    <div className="scan-page-wrapper">
      <div className="nav-back-wrapper" onClick={() => navigate(-1)}>
        <button className="nav-back-btn">
          <ArrowLeftOutlined />
        </button>
      </div>

      <Card
        className="scan-card"
        title={
          <span>
            <QrcodeOutlined style={{marginRight: 10}} />
            Tầm Bảo & Ghi Danh
          </span>
        }
      >
        <AnimatePresence mode="wait">
          {processing ? (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="processing-container"
            >
              <Spin size="large" tip="Đang giải mã mật văn..." />
            </motion.div>
          ) : result ? (
            <div key="result">{renderResult()}</div>
          ) : (
            <motion.div 
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="scanner-container"
            >
              <QRScanner onScanSuccess={handleScan} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default ScanPage;
