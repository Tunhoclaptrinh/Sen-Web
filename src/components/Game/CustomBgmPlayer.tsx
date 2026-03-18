/**
 * CustomBgmPlayer.tsx
 *
 * Shows a floating mini-player bar when a custom BGM track is selected.
 * - Draggable (like Sen character)
 * - Minimizable to a small bubble
 * - iframe-based for stream sources, native <audio> for direct files
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button, Tooltip } from "antd";
import { CloseOutlined, MinusOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setSelectedBgmKey } from "@/store/slices/audioSlice";
import { PLATFORM_META } from "@/utils/audioUrlUtils";

const DEFAULT_POS = { x: 24, y: window.innerHeight - 24 - 180 };
const MIN_SIZE = { width: 200, height: 100 };
const MAX_SIZE = { width: 800, height: 600 };

const CustomBgmPlayer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedBgmKey, customBgmTracks, isMuted, bgmVolume, userInteracted, isBgmAutoMuted, isEmbeddedZoneActive } = useAppSelector((s) => s.audio);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [minimized, setMinimized] = useState(false);

  // Auto-minimize when level music starts
  useEffect(() => {
    if (isBgmAutoMuted) {
      setMinimized(true);
    }
  }, [isBgmAutoMuted]);

  // Layout state
  const [pos, setPos] = useState(DEFAULT_POS);
  const [size, setSize] = useState({ width: 240, height: 135 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
  }, [size]);

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const onMove = (e: MouseEvent) => {
      if (isDragging) {
        const PLAYER_W = minimized ? 40 : size.width;
        const PLAYER_H = minimized ? 40 : size.height + 40; // + header
        const newX = Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - PLAYER_W);
        const newY = Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - PLAYER_H);
        setPos({ x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;

        setSize({
          width: Math.min(Math.max(MIN_SIZE.width, resizeStart.current.w + deltaX), MAX_SIZE.width),
          height: Math.min(Math.max(MIN_SIZE.height, resizeStart.current.h + deltaY), MAX_SIZE.height)
        });
      }
    };
    const onUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, isResizing, minimized, size]);

  // Derive active custom track
  const activeTrack = React.useMemo(() => {
    if (!selectedBgmKey?.startsWith("CUSTOM_")) return null;
    const id = selectedBgmKey.replace("CUSTOM_", "");
    return customBgmTracks.find((t) => t.id === id) ?? null;
  }, [selectedBgmKey, customBgmTracks]);

  // Sync audio element volume/mute for direct audio tracks
  useEffect(() => {
    if (!audioRef.current || !activeTrack || activeTrack.isIframe) return;
    const isGamePlayPath = window.location.pathname.startsWith('/game/play/') || window.location.pathname.startsWith('/admin');
    const shouldPlay = isGamePlayPath || isEmbeddedZoneActive;
    const effectiveMuted = isMuted || isBgmAutoMuted || !shouldPlay;
    audioRef.current.volume = effectiveMuted ? 0 : bgmVolume;

    if (effectiveMuted) audioRef.current.pause();
    else if (userInteracted) {
      audioRef.current.play().catch(() => { });
    }
  }, [isMuted, bgmVolume, activeTrack, userInteracted, isBgmAutoMuted]);

  // Derive final embed URL with mute state if possible
  const finalEmbedUrl = React.useMemo(() => {
    if (!activeTrack?.url) return "";
    let url = activeTrack.url;
    const isGamePlayPath = window.location.pathname.startsWith('/game/play/') || window.location.pathname.startsWith('/admin');
    const shouldPlay = isGamePlayPath || isEmbeddedZoneActive;
    
    if (isBgmAutoMuted || isMuted || !shouldPlay) {
      // Try to force mute via URL params for common platforms
      if (url.includes("youtube.com")) {
        url += (url.includes("?") ? "&" : "?") + "mute=1";
      } else if (url.includes("soundcloud.com")) {
        // soundcloud doesn't reliably support mute via URL, but we've minimized it
      }
    }
    return url;
  }, [activeTrack?.url, isBgmAutoMuted, isMuted, isEmbeddedZoneActive]);


  if (!activeTrack) return null;

  const meta = PLATFORM_META[activeTrack.type] ?? PLATFORM_META.direct;

  const handleClose = () => dispatch(setSelectedBgmKey("BGM_HISTORICAL"));

  const sharedStyle: React.CSSProperties = {
    position: "fixed",
    left: minimized ? 24 : pos.x,
    top: minimized ? window.innerHeight - 24 - 40 : pos.y,
    zIndex: 9998,
    background: "var(--paper-bg, #fdf8ef)",
    border: "1.5px solid #c5a065",
    borderRadius: "50%",
    width: 40, height: 40,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(168,7,26,0.2)",
    cursor: minimized ? "pointer" : (isDragging ? "grabbing" : "grab"),
    userSelect: "none",
    transition: (isDragging || isResizing) ? "none" : "all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
  };

  // ── Minimized bubble ──────────────────────────────────────────────────────
  if (minimized) {
    return (
      <div
        style={sharedStyle}
        onClick={() => setMinimized(false)}
        title="Mở player nhạc"
      >
        <span style={{ color: meta.color, fontSize: 16, pointerEvents: "none" }}>{meta.icon}</span>
      </div>
    );
  }

  // ── Full player ───────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "fixed",
      left: pos.x,
      top: pos.y,
      zIndex: 9998,
      background: "var(--paper-bg, #fdf8ef)",
      border: "1.5px solid #c5a065",
      borderRadius: 12,
      boxShadow: (isDragging || isResizing)
        ? "0 12px 32px rgba(168,7,26,0.28)"
        : "0 8px 24px rgba(168,7,26,0.18)",
      overflow: "hidden",
      width: size.width,
      userSelect: "none",
      cursor: isDragging ? "grabbing" : "default",
      transition: (isDragging || isResizing) ? "none" : "all 0.2s ease",
    }}>
      {/* Drag handle / Header bar */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 10px",
          background: "linear-gradient(135deg, #fff7e6, #fff1d0)",
          borderBottom: "1px dashed rgba(197,160,101,0.4)",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <span style={{ color: meta.color, fontSize: 13 }}>{meta.icon}</span>
        <span style={{
          flex: 1, fontSize: 12, fontWeight: 600,
          color: "#5d4037", maxWidth: size.width - 80,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontFamily: "var(--font-sans)",
        }} title={activeTrack.label}>
          {activeTrack.label}
        </span>
        <Tooltip title="Thu nhỏ">
          <Button type="text" size="small"
            icon={<MinusOutlined style={{ fontSize: 10 }} />}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setMinimized(true); }}
            style={{ padding: "0 4px", height: 20, cursor: "pointer" }}
          />
        </Tooltip>
        <Tooltip title="Dừng / Quay lại nhạc mặc định">
          <Button type="text" size="small" danger
            icon={<CloseOutlined style={{ fontSize: 10 }} />}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            style={{ padding: "0 4px", height: 20, cursor: "pointer" }}
          />
        </Tooltip>
      </div>

      {/* Player area — not draggable so user can interact with it */}
      {activeTrack.isIframe ? (
        <div style={{ width: size.width, background: "#000", position: "relative" }}>
          <div style={{ height: size.height, width: size.width, opacity: isBgmAutoMuted ? 0.3 : 1 }}>
            <iframe
              key={activeTrack.id}
              src={finalEmbedUrl}
              title={activeTrack.label}
              width={size.width} height={size.height}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ border: "none", display: "block", pointerEvents: isBgmAutoMuted ? "none" : "auto" }}
            />
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={handleResizeStart}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 16,
              height: 16,
              cursor: "nwse-resize",
              background: "linear-gradient(135deg, transparent 50%, #c5a065 50%)",
              zIndex: 10,
              opacity: 0.6
            }}
          />

          {/* Subtle hint for autoplay issues / priority */}
          <div style={{
            background: isBgmAutoMuted ? "#a8071a" : "#1a1a1a",
            padding: "4px 8px",
            fontSize: "10px",
            color: isBgmAutoMuted ? "#fff" : "#aaa",
            textAlign: "center",
            borderTop: "1px solid #333",
            fontWeight: isBgmAutoMuted ? 600 : 400
          }}>
            {isBgmAutoMuted
              ? "Đã tạm dừng để ưu tiên âm thanh màn chơi"
              : "Bấm \"Play\" trên trình phát nếu nhạc chưa chạy"}
          </div>
        </div>
      ) : (
        <div style={{ padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: meta.color }}>{meta.icon}</span>
          <audio
            ref={audioRef}
            key={activeTrack.id}
            src={activeTrack.url}
            controls loop autoPlay={!isMuted && !isBgmAutoMuted && userInteracted}
            style={{ height: 28, flex: 1, minWidth: 0, opacity: isBgmAutoMuted ? 0.5 : 1 }}
          />
        </div>
      )}
    </div>
  );
};

export default CustomBgmPlayer;
