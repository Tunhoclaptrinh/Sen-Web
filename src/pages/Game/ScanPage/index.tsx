import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Card, Button, Typography, Result, Spin, message} from "antd";
import {
  QrcodeOutlined,
  EnvironmentOutlined,
  GiftOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  EnvironmentFilled,
} from "@ant-design/icons";
import QRScanner from "@/components/Game/QRScanner";
import {gameService} from "@/services";
import "./styles.less";

const {Text, Title} = Typography;

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
      console.log("Scanned:", decodedText);

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
          type: "artifact",
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
        <Result
          status="success"
          icon={<EnvironmentFilled style={{color: "#8b1d1d", fontSize: 64}} />}
          title="Ghi danh thành công!"
          subTitle={
            <span>
              Tại hạ đã ghi danh bạn tại <strong>{locationName}</strong>
            </span>
          }
          extra={[
            <div key="stats" className="result-stats">
              <Text strong style={{fontSize: 22, color: "#faad14", display: "block", marginBottom: 8}}>
                +{pointsEarned} Công đức
              </Text>
              <Text type="secondary">
                Đã ghé thăm: <strong>{totalCheckins}</strong> lần
              </Text>
            </div>,
            <Button type="primary" key="map" onClick={() => navigate("/game/map")}>
              Xem bản đồ di tích
            </Button>,
            <Button key="continue" onClick={handleReset}>
              Tiếp tục tầm bảo
            </Button>,
          ]}
        />
      );
    }

    if (result.type === "artifact") {
      const {artifact, rewards, isNewDiscovery} = result.data;
      return (
        <Result
          status="success"
          icon={<GiftOutlined style={{color: "#c5a065", fontSize: 64}} />}
          title={isNewDiscovery ? "Phát hiện Kỳ vật!" : "Thu thập Kỳ vật"}
          subTitle={artifact.name}
          extra={[
            <div key="artifact-img" className="artifact-preview">
              <img src={artifact.image} alt={artifact.name} />
            </div>,
            <div key="stats" className="result-stats">
              <Text type="secondary" style={{display: "block", marginBottom: 12, fontStyle: "italic"}}>
                {artifact.description}
              </Text>
              <Text strong style={{fontSize: 20, color: "#faad14"}}>
                +{rewards.coins} Xu | +{rewards.petals} Cánh Sen
              </Text>
            </div>,
            <Button type="primary" key="collection" onClick={() => navigate("/profile/library")}>
              Vào tàng kinh các
            </Button>,
            <Button key="continue" onClick={handleReset}>
              Tiếp tục tìm kiếm
            </Button>,
          ]}
        />
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
        {processing ? (
          <div className="processing-container">
            <Spin size="large" tip="Đang giải mã mật văn..." />
          </div>
        ) : result ? (
          renderResult()
        ) : (
          <div className="scanner-container">
            <QRScanner onScanSuccess={handleScan} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ScanPage;
