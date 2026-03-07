import React from "react";
import { Slider, Row, Col, Switch, Select, Typography } from "antd";
import { DragOutlined, SkinOutlined, SmileOutlined, RobotOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateSenSettings, toggleSenAccessory, SenSettings } from "@/store/slices/aiSlice";
import { useGlobalCharacter } from "@/contexts/GlobalCharacterContext";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      <SectionTitle icon={<RobotOutlined />} label={t('common.senSettings.mode')} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <div>
          <Label>{t('common.senSettings.chibiMode')}</Label>
          <Text type="secondary" style={{ display: "block", fontSize: 11, lineHeight: "1.3" }}>
            {t('common.senSettings.chibiHint')}
          </Text>
        </div>
        <Switch checked={isChibi} onChange={(v) => handleUpdate({ isChibi: v })} style={{ backgroundColor: isChibi ? "#a8071a" : undefined }} />
      </div>

      <SectionDivider />

      {/* --- Kích thước --- */}
      <SectionTitle icon={<DragOutlined />} label={t('common.senSettings.size')} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <Label>{t('common.senSettings.scale')}</Label>
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
      <SectionTitle icon={<SkinOutlined />} label={t('common.senSettings.outfit')} />
      <Row gutter={[24, 4]}>
        <Col span={12}><AccessoryRow label={t('common.senSettings.accessories.hat')} checked={accessories.hat} onChange={() => handleToggle("hat")} /></Col>
        <Col span={12}><AccessoryRow label={t('common.senSettings.accessories.glasses')} checked={accessories.glasses} onChange={() => handleToggle("glasses")} /></Col>
        <Col span={12}><AccessoryRow label={t('common.senSettings.accessories.coat')} checked={accessories.coat} onChange={() => handleToggle("coat")} /></Col>
        {!isChibi && (
          <Col span={12}><AccessoryRow label={t('common.senSettings.accessories.bag')} checked={accessories.bag} onChange={() => handleToggle("bag")} /></Col>
        )}
      </Row>

      <SectionDivider />

      {/* --- Biểu cảm --- */}
      <SectionTitle icon={<SmileOutlined />} label={t('common.senSettings.expression')} />
      <Row gutter={[12, 8]}>

        {/* Mắt + Auto blink */}
        <Col span={24}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <Label>{t('common.senSettings.eyes')}</Label>
              <Select value={eyeState} onChange={(v) => handleUpdate({ eyeState: v })} style={{ width: "100%", marginTop: 4 }} size="small">
                <Option value="normal">{t('common.senSettings.eyeOptions.normal')}</Option>
                <Option value="blink">{t('common.senSettings.eyeOptions.blink')}</Option>
                <Option value="close">{t('common.senSettings.eyeOptions.close')}</Option>
                <Option value="like">{t('common.senSettings.eyeOptions.like')}</Option>
                <Option value="half">{t('common.senSettings.eyeOptions.half')}</Option>
                <Option value="sleep">{t('common.senSettings.eyeOptions.sleep')}</Option>
              </Select>
            </div>
            <div style={{ textAlign: "center", paddingTop: 20, minWidth: 60 }}>
              <Text style={{ fontSize: 11, display: "block", color: "#888" }}>{t('common.senSettings.autoBlink')}</Text>
              <Switch size="small" checked={isBlinking} onChange={(v) => handleUpdate({ isBlinking: v })}
                style={{ backgroundColor: isBlinking ? "#a8071a" : undefined }} />
            </div>
          </div>
        </Col>

        {/* Cử chỉ + Miệng side by side */}
        {isChibi && (
          <Col span={12}>
            <Label>{t('common.senSettings.gesture')}</Label>
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
              <Option value="normal">{t('common.senSettings.gestureOptions.normal')}</Option>
              <Option value="hello">{t('common.senSettings.gestureOptions.hello')}</Option>
              <Option value="point">{t('common.senSettings.gestureOptions.point')}</Option>
              <Option value="like">{t('common.senSettings.gestureOptions.like')}</Option>
              <Option value="flag">{t('common.senSettings.gestureOptions.flag')}</Option>
            </Select>
          </Col>
        )}

        <Col span={isChibi ? 12 : 24}>
          <Label>{t('common.senSettings.mouth')}</Label>
          <Select value={mouthState} onChange={(v) => handleUpdate({ mouthState: v })}
            style={{ width: "100%", marginTop: 4 }} size="small" disabled={isTalking}>
            <Option value="smile">{t('common.senSettings.mouthOptions.smile')}</Option>
            <Option value="smile_2">{t('common.senSettings.mouthOptions.smile_2')}</Option>
            {isChibi && <Option value="half">{t('common.senSettings.mouthOptions.half')}</Option>}
            <Option value="open">{t('common.senSettings.mouthOptions.open')}</Option>
            <Option value="close">{t('common.senSettings.mouthOptions.close')}</Option>
            <Option value="sad">{t('common.senSettings.mouthOptions.sad')}</Option>
            {!isChibi && <Option value="angry">{t('common.senSettings.mouthOptions.angry')}</Option>}
            <Option value="tongue">{t('common.senSettings.mouthOptions.tongue')}</Option>
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default SenCustomizationSettings;
