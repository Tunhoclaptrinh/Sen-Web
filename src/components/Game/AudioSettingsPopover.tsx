import React, { useState } from "react";
import {
  Popover, Slider, Switch, Typography, Button, Select, Input,
  Divider, Tooltip, message, Alert,
} from "antd";
import {
  SoundOutlined, MutedOutlined, PlusOutlined, DeleteOutlined,
  CheckOutlined, CloseOutlined, InfoCircleOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setBgmVolume, setSfxVolume, toggleMute, setSelectedBgmKey,
  addCustomBgmTrack, removeCustomBgmTrack, CustomBgmTrack,
} from "@/store/slices/audioSlice";
import { parseAudioInput, PLATFORM_META } from "@/utils/audioUrlUtils";
import { useGameSounds } from "@/hooks/useSound";

const { Text } = Typography;
const MAX_CUSTOM_TRACKS = 10;

// ─── Platform badge ───────────────────────────────────────────────────────────
const PlatformBadge: React.FC<{ track: CustomBgmTrack }> = ({ track }) => {
  const meta = PLATFORM_META[track.type] ?? PLATFORM_META.direct;
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, color: meta.color,
      background: `${meta.color}18`, borderRadius: 3,
      padding: "1px 5px", marginRight: 5, letterSpacing: "0.3px",
    }}>
      {meta.icon} {track.type.toUpperCase()}
    </span>
  );
};

// ─── Compact label row ─────────────────────────────────────────────────────────
const RowLabel: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
    <Text style={{ fontSize: 12, color: "#5d4037", fontWeight: 500 }}>{children}</Text>
    {right && <Text style={{ fontSize: 12, color: "#a8071a", fontWeight: 600 }}>{right}</Text>}
  </div>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.78rem", fontWeight: 700, color: "#a8071a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
    {children}
  </Text>
);

// ─── Main component ───────────────────────────────────────────────────────────
interface AudioSettingsProps { children?: React.ReactNode; }

const AudioSettingsPopover: React.FC<AudioSettingsProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isMuted, bgmVolume, sfxVolume, selectedBgmKey, customBgmTracks } = useAppSelector((s) => s.audio);
  const { playClick } = useGameSounds();

  const [urlInput, setUrlInput] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Live preview of detected platform
  const parsed = urlInput.trim() ? parseAudioInput(urlInput.trim()) : null;

  const handleAddTrack = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { message.warning("Vui lòng nhập URL hoặc mã nhúng."); return; }
    const result = parseAudioInput(trimmed);
    if (!result) { message.error("URL không hợp lệ. Thử lại với link hoặc mã <iframe>."); return; }

    if ((result.platform === 'zingmp3' || result.platform === 'nhaccuatoi') && !result.isIframe) {
      message.warning(`${result.label}: Nền tảng này không hỗ trợ phát trực tiếp qua link. Hãy dùng mã nhúng <iframe> từ trang đó.`);
      return;
    }

    const track: CustomBgmTrack = {
      id: Date.now().toString(),
      label: labelInput.trim() || result.label,
      url: result.embedUrl,
      type: result.platform,
      isIframe: result.isIframe,
    };

    dispatch(addCustomBgmTrack(track));
    dispatch(setSelectedBgmKey(`CUSTOM_${track.id}`));
    message.success(`Đã thêm và đang phát: ${track.label}`);
    setUrlInput(""); setLabelInput(""); setShowAddForm(false);
  };

  // Build select options
  const builtInOptions = [
    { label: "Medieval Library — Tabletop Audio", value: "BGM_HISTORICAL" },
    { label: "Village Festival — Tabletop Audio", value: "BGM_VILLAGE" },
    { label: "Rise of the Ancients — Tabletop Audio", value: "BGM_ANCIENT" },
    { label: "Stone Barrow — Tabletop Audio", value: "BGM_STONE" },
  ];

  const customOptions = customBgmTracks.map((t) => {
    const meta = PLATFORM_META[t.type] ?? PLATFORM_META.direct;
    return { label: `${meta.icon} ${t.label}`, value: `CUSTOM_${t.id}` };
  });

  const content = (
    <div style={{ width: 290, padding: "4px 2px" }}>

      {/* ── Master toggle ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <SectionHeader>Âm thanh</SectionHeader>
        <Switch
          checked={!isMuted}
          onChange={() => { playClick(); dispatch(toggleMute()); }}
          checkedChildren={<SoundOutlined />}
          unCheckedChildren={<MutedOutlined />}
          style={{ backgroundColor: !isMuted ? "#a8071a" : undefined }}
        />
      </div>

      {/* ── Volumes ── */}
      <RowLabel right={`${Math.round(bgmVolume * 100)}%`}>🎼 Nhạc nền (BGM)</RowLabel>
      <Slider min={0} max={1} step={0.05} value={bgmVolume}
        onChange={(v) => dispatch(setBgmVolume(v))} disabled={isMuted}
        trackStyle={{ backgroundColor: "#a8071a" }} handleStyle={{ borderColor: "#a8071a" }}
        style={{ marginBottom: 10 }}
      />

      <RowLabel right={`${Math.round(sfxVolume * 100)}%`}>🔊 Hiệu ứng (SFX)</RowLabel>
      <Slider min={0} max={1} step={0.05} value={sfxVolume}
        onChange={(v) => dispatch(setSfxVolume(v))} disabled={isMuted}
        trackStyle={{ backgroundColor: "#a8071a" }} handleStyle={{ borderColor: "#a8071a" }}
        style={{ marginBottom: 10 }}
      />

      <Divider style={{ borderColor: "rgba(197,160,101,0.35)", margin: "8px 0" }} />

      {/* ── Track selector ── */}
      <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionHeader>Chọn bản nhạc</SectionHeader>
        <Text style={{ fontSize: 10, color: "#999" }}>{customBgmTracks.length}/{MAX_CUSTOM_TRACKS}</Text>
      </div>

      <Select
        style={{ width: "100%" }} size="small"
        placeholder="Chọn nhạc nền..."
        value={selectedBgmKey || "BGM_HISTORICAL"}
        onChange={(v) => { playClick(); dispatch(setSelectedBgmKey(v)); }}
        disabled={isMuted}
        options={[
          { label: "— Nhạc có sẵn —", options: builtInOptions },
          ...(customOptions.length > 0
            ? [{ label: "— Nhạc của tôi —", options: customOptions }]
            : []),
        ]}
      />

      {/* ── Custom tracks list ── */}
      {customBgmTracks.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {customBgmTracks.map((track) => (
            <div key={track.id} style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 0", borderBottom: "1px dashed rgba(197,160,101,0.2)",
            }}>
              <PlatformBadge track={track} />
              <Text ellipsis style={{ flex: 1, fontSize: 11, color: "#5d4037" }}>
                {track.label}
              </Text>
              <Tooltip title="Xóa">
                <Button type="text" size="small" danger
                  icon={<DeleteOutlined style={{ fontSize: 10 }} />}
                  onClick={() => { dispatch(removeCustomBgmTrack(track.id)); message.success("Đã xóa"); }}
                  style={{ padding: "0 4px", height: 20 }}
                />
              </Tooltip>
            </div>
          ))}
        </div>
      )}

      {/* ── Add custom track ── */}
      {!showAddForm ? (
        <Button type="dashed" size="small" block icon={<PlusOutlined />}
          style={{ marginTop: 8, borderColor: "#c5a065", color: "#a8071a", fontSize: 12 }}
          onClick={() => setShowAddForm(true)} disabled={isMuted}>
          Thêm nhạc của tôi
        </Button>
      ) : (
        <div style={{ marginTop: 8, borderRadius: 8, padding: "10px", border: "1px dashed rgba(197,160,101,0.5)", background: "rgba(253,248,239,0.8)" }}>
          <Text style={{ fontSize: 11, color: "#777", display: "block", marginBottom: 6 }}>
            Hỗ trợ: YouTube • Spotify • SoundCloud • Link nhạc mp3 • Mã nhúng &lt;iframe&gt;
          </Text>

          <Input.TextArea
            autoSize={{ minRows: 2, maxRows: 4 }}
            placeholder={`Dán URL hoặc mã nhúng (<iframe ...>)\nVí dụ: https://youtu.be/... hoặc mã embed từ SoundCloud, ZingMP3...`}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{ fontSize: 12, marginBottom: 6 }}
          />

          {/* Live platform detection preview */}
          {parsed && (
            <div style={{ marginBottom: 6 }}>
              {(parsed.platform === 'zingmp3' || parsed.platform === 'nhaccuatoi') ? (
                <Alert
                  type="warning" showIcon
                  style={{ fontSize: 11, padding: "3px 8px" }}
                  message={`${parsed.label}: Dùng mã <iframe> từ trang này thay vì link thường.`}
                />
              ) : (
                <Text style={{ fontSize: 11, color: PLATFORM_META[parsed.platform]?.color ?? '#888' }}>
                  ✓ Nhận diện: <strong>{parsed.label}</strong>{parsed.isIframe ? " (embed)" : " (link nhạc)"}
                </Text>
              )}
            </div>
          )}

          <Input
            size="small"
            placeholder="Tên bản nhạc (tuỳ chọn)"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onPressEnter={handleAddTrack}
            style={{ marginBottom: 6 }}
          />

          <div style={{ display: "flex", gap: 6 }}>
            <Button size="small" type="primary" icon={<CheckOutlined />}
              onClick={handleAddTrack}
              style={{ flex: 1, background: "#a8071a", borderColor: "#a8071a", fontSize: 11 }}>
              Lưu
            </Button>
            <Button size="small" icon={<CloseOutlined />}
              onClick={() => { setShowAddForm(false); setUrlInput(""); setLabelInput(""); }}
              style={{ flex: 1, fontSize: 11 }}>
              Hủy
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content} trigger="click" placement="topRight"
      overlayInnerStyle={{
        background: "var(--paper-bg, #fdf8ef)",
        border: "1.5px solid #c5a065",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(168, 7, 26, 0.12)",
        padding: "14px 16px",
      }}
      overlayStyle={{ padding: 0 }}
    >
      {children || (
        <Button
          icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
          size="large" className="sound-button"
          style={{ position: "absolute", bottom: 20, right: 80, zIndex: 100 }}
        />
      )}
    </Popover>
  );
};

export default AudioSettingsPopover;
