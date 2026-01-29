import React, { useState, useEffect } from "react";
import { Stage } from "@pixi/react";
import {
  Modal,
  Switch,
  Divider,
} from "antd";
import { useAppSelector } from "@/store/hooks";
import SenCharacter from "@/components/SenCharacter";
import SenChibi from "@/components/SenChibi"; // New Chibi
import { useGlobalCharacter } from "@/contexts/GlobalCharacterContext";
import QuickActionButtons from "./QuickActionButtons";
import { SenCustomizationSettings } from "@/components/common";

import "./styles.less";
import "./SenToggle.less"; // Import new toggle styles

// Typography constants if needed

const GlobalCharacterOverlay = () => {
  const globalChar = useGlobalCharacter();
  const { isOverlayOpen, senSettings } = useAppSelector((state) => state.ai);

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

  if (!isFeatureEnabled || isOverlayOpen) return null;

  return (
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
                eyeState={eyeState as any} // Pass eyeState
                gesture={gesture as any}
                isTalking={isTalking}
                isBlinking={isBlinking} // Pass isBlinking
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
                eyeState={eyeState as any} // Pass eyeState
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

      {/* 2. Quick Action Buttons (includes Sen toggle) */}
      <QuickActionButtons
        isMinimized={isMinimized}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
      />

      {/* 3. Settings Modal */}
      <Modal
        title="Tùy chỉnh SEN"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={600}
      >
        <SenCustomizationSettings />
        
        <Divider />
        <div className="visibility-control" style={{ marginTop: 16 }}>
          <span>Thu nhỏ Sen</span>
          <Switch checked={isMinimized} onChange={setIsMinimized} />
        </div>
      </Modal>
    </>
  );
};

export default GlobalCharacterOverlay;
