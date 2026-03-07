import React, { useState, useEffect } from "react";
import { Stage } from "@pixi/react";
import {
  Modal,
  Switch,
  Divider,
} from "antd";
import { StarFilled } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import SenCharacter from "@/components/SenCharacter";
import SenChibi from "@/components/SenChibi"; // New Chibi
import { useGlobalCharacter } from "@/contexts/GlobalCharacterContext";
import QuickActionButtons from "./QuickActionButtons";
import { SenCustomizationSettings } from "@/components/common";
import AIChat from "@/components/AIChat";
import { setOverlayOpen } from "@/store/slices/aiSlice";
import { useTranslation } from "react-i18next";

import "./styles.less";
import "./SenToggle.less"; // Import new toggle styles

// Typography constants if needed

const GlobalCharacterOverlay = () => {
  const { t } = useTranslation();
  const globalChar = useGlobalCharacter();
  const dispatch = useAppDispatch();
  const { isOverlayOpen, layoutMode, senSettings } = useAppSelector((state) => state.ai);

  const {
    isChibi,
    scale,
    accessories,
    mouthState,
    eyeState,
    gesture,
    isBlinking
  } = senSettings;

  // Safe access to context
  const position = globalChar?.position || { x: 0, y: 0 };
  const updatePosition = globalChar?.updatePosition || (() => { });

  const isFeatureEnabled = globalChar?.isVisible || false;
  const isTalking = globalChar?.isTalking || false;

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isMinimized, setIsMinimized] = useState(false); // New: Minimized state
  const [showModal, setShowModal] = useState(false);

  const CHAR_WIDTH = isChibi ? 580 * (scale * 2.5) : 260 * (scale * 4);
  const CHAR_HEIGHT = isChibi ? 940 * (scale * 2.5) : 646 * (scale * 4);

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

  return (
    <>
      {/* Global AI Chat Overlay (Fixed Position) */}
      {isOverlayOpen && layoutMode === 'fixed' && (
        <AIChat
          open={true}
          onClose={() => dispatch(setOverlayOpen(false))}
          position="fixed"
        />
      )}

      {/* The rest of the floating character features are only rendered if enabled and overlay is closed */}
      {isFeatureEnabled && !isOverlayOpen && (
        <>
          {/* 1. The Character (Only visible if NOT minimized) */}
          {!isMinimized && (
            <div
              className={`global-char-overlay ${isDragging ? "dragging" : ""}`}
              style={{
                left: position.x - CHAR_WIDTH / 2,
                top: position.y - CHAR_HEIGHT / 2,
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
                    y={CHAR_HEIGHT / 2}
                    scale={scale}
                    origin="torso"
                    showHat={accessories.hat}
                    showGlasses={accessories.glasses}
                    showCoat={accessories.coat}
                    mouthState={mouthState as any}
                    eyeState={eyeState as any}
                    gesture={gesture as any}
                    isTalking={isTalking}
                    isBlinking={isBlinking}
                  />
                ) : (
                  <SenCharacter
                    x={CHAR_WIDTH / 2}
                    y={CHAR_HEIGHT / 2}
                    scale={scale}
                    origin="torso"
                    showHat={accessories.hat}
                    showGlasses={accessories.glasses}
                    showCoat={accessories.coat}
                    showBag={accessories.bag}
                    mouthState={mouthState as any}
                    eyeState={eyeState as any}
                    isTalking={isTalking}
                    isBlinking={isBlinking}
                    draggable={false}
                    onPositionChange={() => { }}
                    onClick={() => { }}
                  />
                )}
              </Stage>
            </div>
          )}

          {/* 2. Quick Action Buttons (includes Sen toggle) */}
          <QuickActionButtons
            isMinimized={isMinimized}
            onToggleMinimize={() => setIsMinimized(!isMinimized)}
          />

          {/* 3. Settings Modal */}
          <Modal
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={null}
            width={560}
            closable
            destroyOnClose
            title={
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.1rem",
                color: "var(--seal-red, #a8071a)",
              }}>
                <StarFilled style={{ color: "#faad14", fontSize: 14, marginRight: 8 }} />
                {t('common.senSettings.title')}
                <StarFilled style={{ color: "#faad14", fontSize: 14, marginLeft: 8 }} />
              </span>
            }
            styles={{
              content: {
                border: "2px solid #c5a065",
                borderRadius: 12,
                overflow: "hidden",
                padding: 0,
                background: "var(--paper-bg, #fdf8ef)",
              },
              header: {
                background: "transparent",
                padding: "20px 28px 14px",
                borderBottom: "1px dashed rgba(197,160,101,0.4)",
                marginBottom: 0,
              },
              body: {
                padding: "20px 28px 24px",
              },
            }}
          >
            <SenCustomizationSettings />

            <Divider style={{ borderColor: "rgba(197,160,101,0.3)", margin: "12px 0" }} />
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontWeight: 600, color: "var(--text-color-primary, #3d1a02)" }}>{t('common.senSettings.toggleVisibility')}</span>
              <Switch
                checked={isMinimized}
                onChange={setIsMinimized}
              />
            </div>
          </Modal>
        </>
      )}
    </>
  );
};

export default GlobalCharacterOverlay;
