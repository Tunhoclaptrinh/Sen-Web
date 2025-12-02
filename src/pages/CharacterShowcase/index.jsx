import React, { useState } from "react";
import { Stage } from "@pixi/react";
import {
  Slider,
  Card,
  Row,
  Col,
  Typography,
  Switch,
  Select,
  Divider,
} from "antd";
import {
  DragOutlined,
  ZoomInOutlined,
  SkinOutlined,
  SmileOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import SenCharacter from "@/components/SenCharacter";
// Giả sử Background nằm ở đây, nếu đường dẫn khác bạn hãy sửa lại
import Background from "@/components/Background";

const { Title, Text } = Typography;
const { Option } = Select;

const CharacterShowcase = () => {
  // --- STATE VỊ TRÍ & SCALE ---
  const [position, setPosition] = useState({ x: 400, y: 400 });
  const [scale, setScale] = useState(0.8);
  const [showBg, setShowBg] = useState(true);

  // --- STATE NGOẠI HÌNH (ACCESSORIES) ---
  const [accessories, setAccessories] = useState({
    hat: true,
    glasses: true,
    bag: true,
    coat: true,
  });

  // --- STATE BIỂU CẢM & HÀNH ĐỘNG ---
  const [mouthState, setMouthState] = useState("smile");
  const [isTalking, setIsTalking] = useState(false);

  // Cấu hình Stage
  const stageWidth = 1000;
  const stageHeight = 1000;

  // Hàm toggle phụ kiện nhanh gọn
  const toggleAccessory = (key) => {
    setAccessories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCharacterDrag = (newPos) => {
    setPosition(newPos);
    // State 'position' ở đây thay đổi -> Slider sẽ tự động cập nhật theo
  };

  // Render nhân vật với đầy đủ props (để tái sử dụng trong logic hiển thị nền)
  const renderCharacter = () => (
    <SenCharacter
      x={position.x}
      y={position.y}
      scale={scale}
      // Props ngoại hình
      showHat={accessories.hat}
      showGlasses={accessories.glasses}
      showBag={accessories.bag}
      showCoat={accessories.coat}
      // Props biểu cảm & hành động
      mouthState={mouthState}
      isTalking={isTalking}
      draggable={true}
      onPositionChange={handleCharacterDrag}
    />
  );

  return (
    <div
      style={{
        padding: 16,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f0f2f5",
      }}
    >
      <Title level={2} style={{ textAlign: "center", marginBottom: 20 }}>
        Studio Tạo Hình Nhân Vật SEN
      </Title>

      <Row gutter={24} style={{ flex: 1, height: "calc(100% - 80px)" }}>
        {/* --- KHUNG CANVAS PIXIJS (Bên Trái) --- */}
        <Col xs={24} lg={16} xl={17} style={{ height: "100%" }}>
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              border: "4px solid #fff",
              height: "100%",
              position: "relative",
              background: "#e6f7ff", // Màu nền dự phòng khi tắt Background component
            }}
          >
            {/* LỚP 1: BACKGROUND (Nằm dưới) */}
            {showBg && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 0, // Z-index thấp hơn Stage
                  pointerEvents: "none", // Để không chặn click chuột (nếu cần tương tác)
                }}
              >
                <Background
                  showLotus={true}
                  showBird={true}
                  showSmoke={true}
                  useFullBackground={true}
                />
              </div>
            )}

            {/* LỚP 2: CHARACTER STAGE (Nằm trên) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 10, // Đảm bảo luôn nằm trên Background
              }}
            >
              <Stage
                width={stageWidth || "100%"}
                height={stageHeight || "100%"}
                options={{ backgroundAlpha: 0 }} // Nền trong suốt để nhìn xuyên xuống Background
                style={{ width: "100%", height: "100%" }}
              >
                {renderCharacter()}
              </Stage>
            </div>
          </div>
        </Col>

        {/* --- BẢNG ĐIỀU KHIỂN (Bên Phải) --- */}
        <Col
          xs={24}
          lg={8}
          xl={7}
          style={{ height: "100%", overflowY: "auto" }}
        >
          <Card
            title={
              <>
                <SkinOutlined /> Tùy Chỉnh Nhân Vật
              </>
            }
            hoverable
            style={{ borderRadius: 12 }}
            bodyStyle={{ padding: "20px 24px" }}
          >
            {/* 1. ĐIỀU CHỈNH VỊ TRÍ */}
            <Title level={5}>
              <DragOutlined /> Vị Trí & Kích Thước
            </Title>
            <div style={{ marginBottom: 10 }}>
              <Text type="secondary">Độ lớn (Scale)</Text>
              <Slider
                min={0.3}
                max={1.5}
                step={0.05}
                value={scale}
                onChange={setScale}
                trackStyle={{ backgroundColor: "#1890ff" }}
              />
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">X: {position.x}</Text>
                <Slider
                  min={-200}
                  max={stageWidth + 200}
                  value={position.x}
                  onChange={(val) => setPosition({ ...position, x: val })}
                />
              </Col>
              <Col span={12}>
                <Text type="secondary">Y: {position.y}</Text>
                <Slider
                  min={-200}
                  max={stageHeight + 200}
                  value={position.y}
                  onChange={(val) => setPosition({ ...position, y: val })}
                />
              </Col>
            </Row>

            <Divider />

            {/* 2. PHỤ KIỆN (ACCESSORIES) */}
            <Title level={5}>
              <SkinOutlined /> Trang Phục & Phụ Kiện
            </Title>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Mũ:</span>
                  <Switch
                    checked={accessories.hat}
                    onChange={() => toggleAccessory("hat")}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Kính:</span>
                  <Switch
                    checked={accessories.glasses}
                    onChange={() => toggleAccessory("glasses")}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Túi xách:</span>
                  <Switch
                    checked={accessories.bag}
                    onChange={() => toggleAccessory("bag")}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Áo khoác:</span>
                  <Switch
                    checked={accessories.coat}
                    onChange={() => toggleAccessory("coat")}
                  />
                </div>
              </Col>
            </Row>

            <Divider />

            {/* 3. BIỂU CẢM & HÀNH ĐỘNG */}
            <Title level={5}>
              <SmileOutlined /> Biểu Cảm
            </Title>

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: isTalking ? "#1890ff" : "inherit",
                  }}
                >
                  <SoundOutlined /> Chế độ nói chuyện:
                </span>
                <Switch checked={isTalking} onChange={setIsTalking} />
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                (Nhân vật sẽ tự động mấp máy môi khi bật)
              </Text>
            </div>

            <div
              style={{
                opacity: isTalking ? 0.5 : 1,
                transition: "opacity 0.3s",
              }}
            >
              <Text style={{ display: "block", marginBottom: 6 }}>
                Trạng thái miệng (khi im lặng):
              </Text>
              <Select
                value={mouthState}
                onChange={setMouthState}
                style={{ width: "100%" }}
                disabled={isTalking} // Disable khi đang nói để tránh xung đột
              >
                <Option value="smile">Cười nhẹ (Smile)</Option>
                <Option value="open">Mở to (Open)</Option>
                <Option value="close">Đóng (Close)</Option>
                <Option value="sad">Buồn (Sad)</Option>
                <Option value="angry">Giận (Angry)</Option>
                <Option value="half">Hé mở (Half)</Option>
              </Select>
            </div>

            <Divider />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: "bold" }}>Hiển thị Background:</span>
              <Switch checked={showBg} onChange={setShowBg} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CharacterShowcase;
