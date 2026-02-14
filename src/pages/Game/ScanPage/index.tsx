import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Card, Button, Typography, Result, Spin, message} from "antd";
import {QrcodeOutlined, EnvironmentOutlined, GiftOutlined} from "@ant-design/icons";
import QRScanner from "@/components/Game/QRScanner";
import {gameService} from "@/services";

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
            <Button type="primary" key="retry" onClick={handleReset}>
              Thử lại
            </Button>,
            <Button key="back" onClick={() => navigate(-1)}>
              Quay lại
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
          icon={<EnvironmentOutlined style={{color: "#52c41a"}} />}
          title="Check-in Thành công!"
          subTitle={`Bạn đã check-in tại ${locationName}`}
          extra={[
            <div key="stats" style={{marginBottom: 24}}>
              <Text strong style={{fontSize: 18, color: "#faad14"}}>
                +{pointsEarned} Điểm
              </Text>
              <br />
              <Text type="secondary">Tổng số lần check-in: {totalCheckins}</Text>
            </div>,
            <Button type="primary" key="map" onClick={() => navigate("/game/map")}>
              Xem bản đồ
            </Button>,
            <Button key="continue" onClick={handleReset}>
              Tiếp tục quét
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
          icon={<GiftOutlined style={{color: "#eb2f96"}} />}
          title={isNewDiscovery ? "Phát hiện Bảo vật mới!" : "Đã thu thập lại"}
          subTitle={artifact.name}
          extra={[
            <div key="artifact-img" style={{marginBottom: 16}}>
              <img
                src={artifact.image}
                alt={artifact.name}
                style={{width: 120, height: 120, objectFit: "cover", borderRadius: 8}}
              />
            </div>,
            <div key="stats" style={{marginBottom: 24}}>
              <Text type="secondary">{artifact.description}</Text>
              <br />
              <Text strong style={{fontSize: 18, color: "#faad14"}}>
                +{rewards.coins} Xu | +{rewards.petals} Cánh Sen
              </Text>
            </div>,
            <Button type="primary" key="collection" onClick={() => navigate("/profile/library")}>
              Xem bộ sưu tập
            </Button>,
            <Button key="continue" onClick={handleReset}>
              Tiếp tục quét
            </Button>,
          ]}
        />
      );
    }
  };

  return (
    <div style={{padding: 24, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh"}}>
      <Card
        title={
          <span>
            <QrcodeOutlined /> Quét QR Code
          </span>
        }
        style={{width: "100%", maxWidth: 600, minHeight: 400}}
      >
        {processing ? (
          <div style={{textAlign: "center", padding: 50}}>
            <Spin size="large" tip="Đang xử lý..." />
          </div>
        ) : result ? (
          renderResult()
        ) : (
          <QRScanner onScanSuccess={handleScan} />
        )}
      </Card>
    </div>
  );
};

export default ScanPage;
