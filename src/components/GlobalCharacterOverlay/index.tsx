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
import SenChibi from "@/components/SenChibi"; // New Chibi
import { useGlobalCharacter } from "@/contexts/GlobalCharacterContext";
import senHead from "@/assets/images/SenChibi/face.png"; // Use face as icon

import "./styles.less";
import "./SenToggle.less"; // Import new toggle styles

const { Title, Text } = Typography;
const { Option } = Select;

const GlobalCharacterOverlay = () => {
  const globalChar = useGlobalCharacter();

  // Safe access to context
  const position = globalChar?.position || { x: 0, y: 0 };
  const updatePosition = globalChar?.updatePosition || (() => { });

  const isFeatureEnabled = globalChar?.isVisible || false;
  const isTalking = globalChar?.isTalking || false;
  const setIsTalking = globalChar?.setIsTalking || (() => { });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isMinimized, setIsMinimized] = useState(false); // New: Minimized state
  const [isChibi, setIsChibi] = useState(false); // Model toggle (Standard vs Chibi)

  // --- STATE MODAL & CHARACTER ---
  const [showModal, setShowModal] = useState(false);
  const [scale, setScale] = useState(0.25); // Scale for Old Sen

  // Adjust scale when switching models
  useEffect(() => {
    if (isChibi) {
      setScale(0.4); // Default scale for Chibi
    } else {
      setScale(0.25); // Default scale for Standard
    }
  }, [isChibi]);

  const getCostume = () => {
    const costumes: Record<string, boolean> = {
      hat: true,
      glasses: true,
      coat: true,
      bag: true, // Restore Bag
    };
    return costumes;
  };

  const [accessories, setAccessories] =
    useState<Record<string, boolean>>(getCostume());
  const [mouthState, setMouthState] = useState<any>("smile");
  const [eyeState, setEyeState] = useState<any>("normal"); // New Eye State
  const [gesture, setGesture] = useState<any>("normal");
  const [isBlinking, setIsBlinking] = useState(true); // New Blink Toggle

  const CHAR_WIDTH = isChibi ? 600 * (scale * 2.5) : 250 * (scale * 4);
  const CHAR_HEIGHT = isChibi ? 1100 * (scale * 2.5) : 650 * (scale * 4);

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

  if (!isFeatureEnabled) return null;

  const toggleAccessory = (key: string) => {
    setAccessories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* 1. The Character (Only visible if NOT minimized) */}
      {!isMinimized && (
        <div
          className={`global-char-overlay ${isDragging ? "dragging" : ""}`}
          style={{
            left: position.x,
            top: position.y,
            width: CHAR_WIDTH,
            height: CHAR_HEIGHT,
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setShowModal(true)}
        >
          <Stage
            width={CHAR_WIDTH}
            height={CHAR_HEIGHT}
            options={{ backgroundAlpha: 0, antialias: true }}
          >
            {isChibi ? (
              <SenChibi
                x={CHAR_WIDTH / 2}
                y={CHAR_HEIGHT / 2 + 50}
                scale={scale}
                showHat={accessories.hat}
                showGlasses={accessories.glasses}
                showCoat={accessories.coat}
                mouthState={mouthState}
                eyeState={eyeState} // Pass eyeState
                gesture={gesture}
                isTalking={isTalking}
                isBlinking={isBlinking} // Pass isBlinking
              />
            ) : (
              <SenCharacter
                x={CHAR_WIDTH / 2}
                y={CHAR_HEIGHT / 2}
                scale={scale}
                showHat={accessories.hat}
                showGlasses={accessories.glasses}
                showCoat={accessories.coat}
                showBag={accessories.bag}
                mouthState={mouthState}
                eyeState={eyeState} // Pass eyeState
                isTalking={isTalking}
                isBlinking={isBlinking} // Pass isBlinking
                draggable={false} // Handled by div wrapper for better DOM events
                onPositionChange={() => { }}
                onClick={() => { }}
              />
            )}
          </Stage>
        </div>
      )}

      {/* 2. The Toggle Button (Always Visible in Corner) */}
      <div
        className={`sen-toggle-btn ${!isMinimized ? "sen-toggle-btn--active" : ""}`}
        onClick={() => setIsMinimized(!isMinimized)}
        title={isMinimized ? "Gọi Sen" : "Ẩn Sen"}
      >
        <img src={senHead} alt="Sen Toggle" className="sen-toggle-btn__icon" />
      </div>

      {/* 3. Settings Modal */}
      <Modal
        title="Tùy chỉnh SEN"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={600}
      >
        <Title level={5}>Chế độ nhân vật</Title>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 20 }}
        >
          <span style={{ marginRight: 10 }}>Dạng Chibi (Mới)</span>
          <Switch checked={isChibi} onChange={setIsChibi} />
        </div>
        <Divider />

        <Title level={5}>
          <DragOutlined /> Kích Thước
        </Title>
        <Text>Độ lớn (Scale)</Text>
        <Slider
          min={0.1}
          max={1.0}
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
          {["hat", "glasses", "coat"].map((key) => (
            <Col span={12} key={key}>
              <div className="accessory-item">
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                <Switch
                  checked={accessories[key]}
                  onChange={() => toggleAccessory(key)}
                />
              </div>
            </Col>
          ))}
          {!isChibi && (
            <Col span={12} key="bag">
              <div className="accessory-item">
                <span>Bag:</span>
                <Switch
                  checked={accessories["bag"]}
                  onChange={() => toggleAccessory("bag")}
                />
              </div>
            </Col>
          )}
        </Row>

        <Divider />
        <Title level={5}>
          <SoundOutlined /> Hội thoại (Speaking)
        </Title>
        <div className="expression-control">
          <div className="expression-control__header">
            <span
              className={`expression-control__label ${isTalking ? "expression-control__label--active" : ""}`}
            >
              <SoundOutlined /> Chế độ nói chuyện:
            </span>
            <Switch checked={isTalking} onChange={setIsTalking} />
          </div>
          <Text type="secondary" className="expression-control__hint">
            (Nhân vật sẽ tự động mấp máy môi khi bật)
          </Text>
        </div>

        <Divider />
        <Title level={5}>
          <SmileOutlined /> Biểu Cảm (Expressions)
        </Title>

        {/* Eye Control */}
        <Text className="mouth-select-label">Mắt (Eyes):</Text>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: 10 }}>
          <Select
            value={eyeState}
            onChange={setEyeState}
            style={{ flex: 1 }}
          >
            <Option value="normal">Bình thường (Normal)</Option>
            <Option value="blink">Nháy mắt (Wink)</Option>
            <Option value="close">Cười tít (Happy)</Option>
            <Option value="like">Mắt Like (&gt; &lt;)</Option>
            <Option value="half">Mắt lờ đờ (Half)</Option>
            <Option value="sleep">Mắt ngủ (Sleep)</Option>
          </Select>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
            <span style={{ fontSize: 12 }}>Auto Blink</span>
            <Switch size="small" checked={isBlinking} onChange={setIsBlinking} />
          </div>
        </div>

        {isChibi && (
          <>
            {/* Gesture Control - CHIBI ONLY */}
            <Text
              className="mouth-select-label"
              style={{ display: "block" }}
            >
              Cử chỉ tay (Gestures):
            </Text>
            <Select
              value={gesture}
              onChange={(val) => {
                setGesture(val);
                // "Mắt - hành động like": Automatically switch eyes when Like gesture is chosen
                if (val === 'like') {
                  setEyeState('like');
                } else if (eyeState === 'like') {
                  // Smart Reset: If switching away from "Like" gesture and eyes are still "Like",
                  // reset eyes to "Normal".
                  setEyeState('normal');
                }
              }}
              style={{ width: "100%", marginBottom: 16 }}
            >
              <Option value="normal">Bình thường</Option>
              <Option value="hello">Xin chào (Hello)</Option>
              <Option value="point">Chỉ tay (Point)</Option>
              <Option value="like">Thích (Like)</Option>
              <Option value="flag">Cầm cờ (Flag)</Option>
            </Select>
          </>
        )}

        <Text className="mouth-select-label">
          Trạng thái miệng (khi im lặng):
        </Text>
        <Select
          value={mouthState}
          onChange={setMouthState}
          style={{ width: "100%" }}
          disabled={isTalking}
        >
          <Option value="smile">Cười nhẹ (Smile)</Option>
          <Option value="smile_2">Cười tươi (Smile 2) {isChibi ? "" : "(Chibi)"}</Option>
          <Option value="tongue">Lè lưỡi (Tongue) {isChibi ? "" : "(Chibi)"}</Option>
          {isChibi && <Option value="half">Mở hé (Half)</Option>}
          <Option value="open">Mở to (Open)</Option>
          <Option value="close">Đóng (Close)</Option>
          <Option value="sad">Buồn (Sad)</Option>
          <Option value="tongue">Lè lưỡi (Tongue)</Option>
        </Select>

        <div className="visibility-control" style={{ marginTop: 16 }}>
          <span>Thu nhỏ Sen</span>
          <Switch checked={isMinimized} onChange={setIsMinimized} />
        </div>
      </Modal>
    </>
  );
};

export default GlobalCharacterOverlay;
