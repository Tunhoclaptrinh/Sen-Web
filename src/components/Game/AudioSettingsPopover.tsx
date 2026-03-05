import React from "react";
import { Popover, Slider, Switch, Space, Typography, Button, Select } from "antd";
import { SoundOutlined, MutedOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBgmVolume, setSfxVolume, toggleMute, setSelectedBgmKey } from "@/store/slices/audioSlice";
import { useGameSounds } from "@/hooks/useSound";

const { Text } = Typography;

interface AudioSettingsProps {
  children?: React.ReactNode;
}

const AudioSettingsPopover: React.FC<AudioSettingsProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isMuted, bgmVolume, sfxVolume, selectedBgmKey } = useAppSelector((state) => state.audio);
  const { playClick } = useGameSounds();

  const content = (
    <div style={{ width: 250, padding: 8 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text strong>Âm thanh</Text>
          <Switch
            checked={!isMuted}
            onChange={() => { playClick(); dispatch(toggleMute()); }}
            checkedChildren={<SoundOutlined />}
            unCheckedChildren={<MutedOutlined />}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }}>Nhạc nền (BGM)</Text>
            <Text style={{ fontSize: 12, color: "var(--text-color-secondary)" }}>{Math.round(bgmVolume * 100)}%</Text>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={bgmVolume}
            onChange={(val) => dispatch(setBgmVolume(val))}
            disabled={isMuted}
            trackStyle={{ backgroundColor: "var(--primary-color)" }}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }}>Nhạc nền chung</Text>
          </div>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn nhạc nền"
            value={selectedBgmKey || "BGM_HISTORICAL"}
            onChange={(val) => { playClick(); dispatch(setSelectedBgmKey(val)); }}
            disabled={isMuted}
            options={[
              { label: "Thư viện Cổ (Focus)", value: "BGM_HISTORICAL" },
              { label: "Lễ hội Làng", value: "BGM_VILLAGE" },
              { label: "Cổ đại Trỗi dậy", value: "BGM_ANCIENT" },
              { label: "Hầm mộ Đá", value: "BGM_STONE" },
            ]}
          />
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 12 }}>Hiệu ứng (SFX)</Text>
            <Text style={{ fontSize: 12, color: "var(--text-color-secondary)" }}>{Math.round(sfxVolume * 100)}%</Text>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={sfxVolume}
            onChange={(val) => dispatch(setSfxVolume(val))}
            disabled={isMuted}
            trackStyle={{ backgroundColor: "var(--primary-color)" }}
          />
        </div>
      </Space>
    </div>
  );

  return (
    <Popover content={content} trigger="click" placement="topRight" overlayClassName="game-settings-popover">
      {children || (
        <Button
          icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
          size="large"
          className="sound-button"
          style={{ position: "absolute", bottom: 20, right: 80, zIndex: 100 }}
        />
      )}
    </Popover>
  );
};

export default AudioSettingsPopover;
