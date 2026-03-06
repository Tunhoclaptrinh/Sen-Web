import React from "react";
import { Slider, Row, Col, Switch, Select, Typography } from "antd";
import { DragOutlined, SkinOutlined, SmileOutlined, RobotOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSenSettings, toggleSenAccessory, SenSettings } from "@/store/slices/aiSlice";
import { useGlobalCharacter } from "@/contexts/GlobalCharacterContext";

const { Text } = Typography;
const { Option } = Select;

// Compact label for settings rows
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ fontSize: 13, color: "#5d4037", fontWeight: 500 }}>{children}</Text>
);

// Section title
const SectionTitle: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
    fontFamily: "'Playfair Display', serif", fontSize: "0.88rem",
    fontWeight: 700, color: "#a8071a",
  }}>
    <span style={{ color: "#faad14" }}>{icon}</span>
    {label}
  </div>
);

// Thin divider line between sections
const SectionDivider = () => (
  <div style={{ borderBottom: "1px dashed rgba(197,160,101,0.35)", margin: "10px 0" }} />
);

// Accessory toggle: compact label + switch in one row
const AccessoryRow: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
    <Label>{label}</Label>
    <Switch size="small" checked={checked} onChange={onChange} style={{ backgroundColor: checked ? "#a8071a" : undefined }} />
  </div>
);

const SenCustomizationSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { senSettings } = useAppSelector((state) => state.ai);
  const globalChar = useGlobalCharacter();
  const isTalking = globalChar?.isTalking || false;

  const { isChibi, scale, accessories, mouthState, eyeState, gesture, isBlinking } = senSettings;

  const handleUpdate = (updates: Partial<SenSettings>) => dispatch(updateSenSettings(updates));
  const handleToggle = (key: keyof SenSettings["accessories"]) => dispatch(toggleSenAccessory(key));

  return (
    <div style={{ fontSize: 13 }}>

      {/* --- Chế độ nhân vật --- */}
      <SectionTitle icon={<RobotOutlined />} label="Chế độ nhân vật" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <div>
          <Label>Chibi (Phiên bản mới)</Label>
          <Text type="secondary" style={{ display: "block", fontSize: 11, lineHeight: "1.3" }}>
            Bật để dùng chibi đáng yêu hơn
          </Text>
        </div>
        <Switch checked={isChibi} onChange={(v) => handleUpdate({ isChibi: v })} style={{ backgroundColor: isChibi ? "#a8071a" : undefined }} />
      </div>

      <SectionDivider />

      {/* --- Kích thước --- */}
      <SectionTitle icon={<DragOutlined />} label="Kích thước" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <Label>Tỉ lệ (Scale)</Label>
        <Text strong style={{ color: "#a8071a", fontSize: 13 }}>{Math.round(scale * 100)}%</Text>
      </div>
      <Slider
        min={0.1} max={1.0} step={0.05} value={scale}
        onChange={(v) => handleUpdate({ scale: v })}
        trackStyle={{ backgroundColor: "#a8071a" }}
        handleStyle={{ borderColor: "#a8071a" }}
        style={{ marginBottom: 0 }}
      />

      <SectionDivider />

      {/* --- Trang phục & Phụ kiện --- */}
      <SectionTitle icon={<SkinOutlined />} label="Trang phục & Phụ kiện" />
      <Row gutter={[24, 4]}>
        <Col span={12}><AccessoryRow label="🎩 Mũ" checked={accessories.hat} onChange={() => handleToggle("hat")} /></Col>
        <Col span={12}><AccessoryRow label="👓 Kính" checked={accessories.glasses} onChange={() => handleToggle("glasses")} /></Col>
        <Col span={12}><AccessoryRow label="🧥 Áo khoác" checked={accessories.coat} onChange={() => handleToggle("coat")} /></Col>
        {!isChibi && (
          <Col span={12}><AccessoryRow label="👜 Túi xách" checked={accessories.bag} onChange={() => handleToggle("bag")} /></Col>
        )}
      </Row>

      <SectionDivider />

      {/* --- Biểu cảm --- */}
      <SectionTitle icon={<SmileOutlined />} label="Biểu cảm" />
      <Row gutter={[12, 8]}>

        {/* Mắt + Auto blink */}
        <Col span={24}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <Label>👀 Mắt:</Label>
              <Select value={eyeState} onChange={(v) => handleUpdate({ eyeState: v })} style={{ width: "100%", marginTop: 4 }} size="small">
                <Option value="normal">Bình thường</Option>
                <Option value="blink">Nháy mắt</Option>
                <Option value="close">Cười tít</Option>
                <Option value="like">( &gt; &lt; )</Option>
                <Option value="half">Lờ đờ</Option>
                <Option value="sleep">Ngủ</Option>
              </Select>
            </div>
            <div style={{ textAlign: "center", paddingTop: 20, minWidth: 60 }}>
              <Text style={{ fontSize: 11, display: "block", color: "#888" }}>Tự nháy</Text>
              <Switch size="small" checked={isBlinking} onChange={(v) => handleUpdate({ isBlinking: v })}
                style={{ backgroundColor: isBlinking ? "#a8071a" : undefined }} />
            </div>
          </div>
        </Col>

        {/* Cử chỉ + Miệng side by side */}
        {isChibi && (
          <Col span={12}>
            <Label>🤚 Cử chỉ:</Label>
            <Select
              value={gesture}
              onChange={(v) => {
                const u: Partial<SenSettings> = { gesture: v };
                if (v === "like") u.eyeState = "like";
                else if (eyeState === ("like" as any)) u.eyeState = "normal";
                handleUpdate(u);
              }}
              style={{ width: "100%", marginTop: 4 }} size="small"
            >
              <Option value="normal">Bình thường</Option>
              <Option value="hello">Xin chào 👋</Option>
              <Option value="point">Chỉ tay 👉</Option>
              <Option value="like">Thích 👍</Option>
              <Option value="flag">Cầm cờ 🚩</Option>
            </Select>
          </Col>
        )}

        <Col span={isChibi ? 12 : 24}>
          <Label>😊 Miệng:</Label>
          <Select value={mouthState} onChange={(v) => handleUpdate({ mouthState: v })}
            style={{ width: "100%", marginTop: 4 }} size="small" disabled={isTalking}>
            <Option value="smile">Cười nhẹ 🙂</Option>
            <Option value="smile_2">Cười tươi 😊</Option>
            {isChibi && <Option value="half">Mở hé</Option>}
            <Option value="open">Mở to 😮</Option>
            <Option value="close">Khép miệng 😐</Option>
            <Option value="sad">Buồn 😢</Option>
            {!isChibi && <Option value="angry">Giận 😤</Option>}
            <Option value="tongue">Lè lưỡi 😛</Option>
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default SenCustomizationSettings;
