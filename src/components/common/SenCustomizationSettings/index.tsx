import React from "react";
import {
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
    updateSenSettings, 
    toggleSenAccessory,
    SenSettings 
} from "@/store/slices/aiSlice";
import { useGlobalCharacter } from "@/contexts/GlobalCharacterContext";

const { Title, Text } = Typography;
const { Option } = Select;

interface SenCustomizationSettingsProps {
    compact?: boolean;
}

const SenCustomizationSettings: React.FC<SenCustomizationSettingsProps> = ({ 
    compact = false 
}) => {
  const dispatch = useAppDispatch();
  const { senSettings } = useAppSelector((state) => state.ai);
  const globalChar = useGlobalCharacter();

  const isTalking = globalChar?.isTalking || false;
  const setIsTalking = (val: boolean) => globalChar?.setIsTalking(val);

  const {
      isChibi,
      scale,
      accessories,
      mouthState,
      eyeState,
      gesture,
      isBlinking
  } = senSettings;

  const handleUpdate = (updates: Partial<SenSettings>) => {
      dispatch(updateSenSettings(updates));
  };

  const handleToggleAccessory = (key: keyof SenSettings['accessories']) => {
      dispatch(toggleSenAccessory(key));
  };

  return (
    <div className="sen-customization-settings">
        {!compact && <Title level={5}>Chế độ nhân vật</Title>}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <span style={{ marginRight: 10 }}>Dạng Chibi (Mới)</span>
          <Switch 
            checked={isChibi} 
            onChange={(checked) => handleUpdate({ isChibi: checked })} 
          />
        </div>
        {!compact && <Divider />}

        <Title level={compact ? 5 : 5}>
          <DragOutlined /> Kích Thước
        </Title>
        <Text>Độ lớn (Scale)</Text>
        <Slider
          min={0.1}
          max={1.0}
          step={0.05}
          value={scale}
          onChange={(val) => handleUpdate({ scale: val })}
          style={{ marginBottom: 16 }}
        />

        {!compact && <Divider />}
        <Title level={5}>
          <SkinOutlined /> Trang Phục & Phụ Kiện
        </Title>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ minWidth: '60px' }}>Hat:</span>
              <Switch
                checked={accessories.hat}
                onChange={() => handleToggleAccessory('hat')}
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ minWidth: '60px' }}>Glasses:</span>
              <Switch
                checked={accessories.glasses}
                onChange={() => handleToggleAccessory('glasses')}
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ minWidth: '60px' }}>Coat:</span>
              <Switch
                checked={accessories.coat}
                onChange={() => handleToggleAccessory('coat')}
              />
            </div>
          </Col>
          {!isChibi && (
            <Col span={12} key="bag">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ minWidth: '60px' }}>Bag:</span>
                <Switch
                  checked={accessories.bag}
                  onChange={() => handleToggleAccessory('bag')}
                />
              </div>
            </Col>
          )}
        </Row>

        {!compact && <Divider />}
        <Title level={5}>
          <SoundOutlined /> Hội thoại (Speaking)
        </Title>
        <div className="expression-control">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span
              style={{ 
                  color: isTalking ? '#1890ff' : 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
              }}
            >
              <SoundOutlined /> Chế độ nói chuyện:
            </span>
            <Switch checked={isTalking} onChange={setIsTalking} />
          </div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
            (Nhân vật sẽ tự động mấp máy môi khi bật)
          </Text>
        </div>

        {!compact && <Divider />}
        <Title level={5}>
          <SmileOutlined /> Biểu Cảm (Expressions)
        </Title>

        {/* Eye Control */}
        <Text style={{ display: 'block', marginBottom: 8 }}>Mắt (Eyes):</Text>
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Select 
            value={eyeState} 
            onChange={(val) => handleUpdate({ eyeState: val })} 
            style={{ flex: 1 }}
          >
            <Option value="normal">Bình thường (Normal)</Option>
            <Option value="blink">Nháy mắt (Wink)</Option>
            <Option value="close">Cười tít (Happy)</Option>
            <Option value="like">Mắt Like (&gt; &lt;)</Option>
            <Option value="half">Mắt lờ đờ (Half)</Option>
            <Option value="sleep">Mắt ngủ (Sleep)</Option>
          </Select>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 80,
            }}
          >
            <span style={{ fontSize: 12 }}>Auto Blink</span>
            <Switch
              size="small"
              checked={isBlinking}
              onChange={(val) => handleUpdate({ isBlinking: val })}
            />
          </div>
        </div>

        {isChibi && (
          <div style={{ marginBottom: 16 }}>
            {/* Gesture Control - CHIBI ONLY */}
            <Text style={{ display: "block", marginBottom: 8 }}>
              Cử chỉ tay (Gestures):
            </Text>
            <Select
              value={gesture}
              onChange={(val) => {
                const updates: Partial<SenSettings> = { gesture: val };
                // "Mắt - hành động like": Automatically switch eyes when Like gesture is chosen
                if (val === "like") {
                  updates.eyeState = "like";
                } else if (eyeState === ("like" as any)) {
                  updates.eyeState = "normal";
                }
                handleUpdate(updates);
              }}
              style={{ width: "100%" }}
            >
              <Option value="normal">Bình thường</Option>
              <Option value="hello">Xin chào (Hello)</Option>
              <Option value="point">Chỉ tay (Point)</Option>
              <Option value="like">Thích (Like)</Option>
              <Option value="flag">Cầm cờ (Flag)</Option>
            </Select>
          </div>
        )}

        <Text style={{ display: 'block', marginBottom: 8 }}>
          Trạng thái miệng (khi im lặng):
        </Text>
        <Select
          value={mouthState}
          onChange={(val) => handleUpdate({ mouthState: val })}
          style={{ width: "100%" }}
          disabled={isTalking}
        >
          <Option value="smile">Cười nhẹ (Smile)</Option>
          <Option value="smile_2">
            Cười tươi (Smile 2) {isChibi ? "" : "(Chibi)"}
          </Option>
          {isChibi && <Option value="half">Mở hé (Half)</Option>}
          <Option value="open">Mở to (Open)</Option>
          <Option value="close">Đóng (Close)</Option>
          <Option value="sad">Buồn (Sad)</Option>
          {!isChibi && <Option value="angry">Giận (Angry)</Option>}
          <Option value="tongue">
            Lè lưỡi (Tongue) {isChibi ? "" : "(Chibi)"}
          </Option>
        </Select>
    </div>
  );
};

export default SenCustomizationSettings;
