// src/components/GlobalCharacterOverlay/index.tsx
import React, { useState, useEffect } from "react";
import { Stage } from "@pixi/react";
import {
  Modal,
  Slider,
  Row,
  Col,
  Switch,
  Select,
  Typography,
  Divider,
} from "antd";
import {
  DragOutlined,
  SkinOutlined,
  SmileOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import SenCharacter from "@/components/SenCharacter";
import { useGlobalCharacter } from "@/contexts/GlobalCharacterContext";

const { Title, Text } = Typography;
const { Option } = Select;

const GlobalCharacterOverlay = () => {
  const globalChar = useGlobalCharacter();

  // Safe access to context
  const position = globalChar?.position || { x: 0, y: 0 };
  const updatePosition = globalChar?.updatePosition || (() => { });
  const isVisible = globalChar?.isVisible || false;
  const isTalking = globalChar?.isTalking || false;
  const setIsTalking = globalChar?.setIsTalking || (() => { });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [visibleChar, setVisibleChar] = useState(false);

  // --- STATE MODAL & CHARACTER ---
  const [showModal, setShowModal] = useState(false);
  const [scale, setScale] = useState(0.25);

  const getCostume = () => {
    const costumes: Record<string, boolean> = {
      hat: true,
      glasses: true,
      bag: true,
      coat: true,
    };
    return costumes;
  };

  const [accessories, setAccessories] = useState<Record<string, boolean>>(getCostume());
  const [mouthState, setMouthState] = useState("smile");

  const CHAR_WIDTH = 250 * (scale * 4);
  const CHAR_HEIGHT = 650 * (scale * 4);

  // Drag logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      const maxX = window.innerWidth - 50;
      const maxY = window.innerHeight - 50;

      if (newX < -CHAR_WIDTH / 2) newX = -CHAR_WIDTH / 2;
      if (newY < -CHAR_HEIGHT / 2) newY = -CHAR_HEIGHT / 2;
      if (newX > maxX) newX = maxX;
      if (newY > maxY) newY = maxY;

      updatePosition(newX, newY);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, updatePosition, CHAR_WIDTH, CHAR_HEIGHT]);

  if (!globalChar || !isVisible) return null;

  const toggleAccessory = (key: string) => {
    setAccessories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          width: CHAR_WIDTH,
          height: CHAR_HEIGHT,
          zIndex: 9999,
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setShowModal(true)}
      >
        {!visibleChar ? (
          <Stage
            width={CHAR_WIDTH}
            height={CHAR_HEIGHT}
            options={{ backgroundAlpha: 0, antialias: true }}
          >
            <SenCharacter
              x={CHAR_WIDTH / 2}
              y={CHAR_HEIGHT / 2}
              scale={scale}
              showHat={accessories.hat}
              showGlasses={accessories.glasses}
              showBag={accessories.bag}
              showCoat={accessories.coat}
              mouthState={mouthState}
              isTalking={isTalking}
              onPositionChange={() => { }}
              onClick={() => { }}
            />
          </Stage>
        ) : (
          <Switch onChange={() => setVisibleChar(false)} />
        )}
      </div>

      <Modal
        title="Tùy chỉnh SEN"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={600}
      >
        <Title level={5}>
          <DragOutlined /> Kích Thước
        </Title>
        <Text>Độ lớn (Scale)</Text>
        <Slider
          min={0.1}
          max={1.5}
          step={0.05}
          value={scale}
          onChange={setScale}
          style={{ marginBottom: 16 }}
        />

        <Divider />
        <Title level={5}>
          <SkinOutlined /> Trang Phục & Phụ Kiện
        </Title>
        <Row gutter={[16, 16]}>
          {["hat", "glasses", "bag", "coat"].map((key) => (
            <Col span={12} key={key}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                <Switch
                  checked={accessories[key]}
                  onChange={() => toggleAccessory(key)}
                />
              </div>
            </Col>
          ))}
        </Row>

        <Divider />
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

        <Text style={{ display: "block", marginBottom: 6 }}>
          Trạng thái miệng (khi im lặng):
        </Text>
        <Select
          value={mouthState}
          onChange={setMouthState}
          style={{ width: "100%" }}
          disabled={isTalking}
        >
          <Option value="smile">Cười nhẹ (Smile)</Option>
          <Option value="open">Mở to (Open)</Option>
          <Option value="close">Đóng (Close)</Option>
          <Option value="sad">Buồn (Sad)</Option>
          <Option value="angry">Giận (Angry)</Option>
          <Option value="half">Hé mở (Half)</Option>
        </Select>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Ẩn Sen</span>
          <Switch onChange={() => setVisibleChar(!visibleChar)} />
        </div>
      </Modal>
    </>
  );
};

export default GlobalCharacterOverlay;
