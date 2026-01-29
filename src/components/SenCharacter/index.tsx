// @ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import { Container, Sprite, useTick } from "@pixi/react";

const getCharacterAsset = (name) => {
  return new URL(`../../assets/images/character/${name}`, import.meta.url).href;
};

const getChibiAsset = (name) => {
  return new URL(`../../assets/images/SenChibi/${name}`, import.meta.url).href;
};

const SenCharacter = ({
  x,
  y,
  scale,
  origin = 'torso',
  showHat = true,
  showGlasses = true,
  showBag = true,
  showCoat = true,
  mouthState = "smile", // 'smile', 'sad', 'angry', 'open', 'close', 'half', 'tongue', 'smile_2'
  eyeState = "normal", // 'normal', 'close', 'half', 'like', 'blink', 'sleep'
  isTalking = false,
  isBlinking = true, // Control auto-blink
  draggable = false, // Tính năng kéo thả
  onPositionChange, // Callback khi vị trí thay đổi
  onClick,
}) => {
  // State cho hiệu ứng thở (breathing)
  const [breathingScale, setBreathingScale] = useState(1);
  const [breathingY, setBreathingY] = useState(0);

  // State cho hiệu ứng đung đưa (sway) phụ kiện
  const [swayRotation, setSwayRotation] = useState(0);

  // State cho việc chớp mắt
  const [blinkActive, setBlinkActive] = useState(false);

  // State cho việc nói chuyện
  const [talkFrame, setTalkFrame] = useState(0);

  // State cho việc kéo thả
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x, y });

  // Cập nhật position khi props x, y thay đổi từ bên ngoài
  useEffect(() => {
    if (!isDragging) {
      setPosition({ x, y });
    }
  }, [x, y, isDragging]);

  // useTick chạy mỗi frame (tạo chuyển động mượt mà)
  useTick((delta) => {
    const tick = Date.now() / 1000;

    // 1. Hiệu ứng thở
    const scaleOffset = Math.sin(tick * 2) * 0.005; // Biên độ thở nhẹ
    const yOffset = Math.sin(tick * 2) * 2; // Nhún lên xuống nhẹ
    setBreathingScale(1 + scaleOffset);
    setBreathingY(yOffset);

    // 2. Hiệu ứng đung đưa nhẹ cho túi/tóc (lệch pha với nhịp thở)
    const rot = Math.sin(tick * 3) * 0.05; // Góc xoay nhẹ
    setSwayRotation(rot);

    // 3. Logic nói chuyện (chuyển frame animation)
    if (isTalking) {
      const frame = Math.floor(tick * 8) % 3; // 3 frames: close, half, open
      setTalkFrame(frame);
    }
  });

  useEffect(() => {
    if (!isBlinking) {
      setBlinkActive(false);
      return;
    }
    const blinkLoop = () => {
      setBlinkActive(true);
      setTimeout(() => setBlinkActive(false), 150); // Mắt nhắm trong 150ms

      const nextBlinkTime = Math.random() * 2000 + 2000;
      setTimeout(blinkLoop, nextBlinkTime);
    };

    const timeoutId = setTimeout(blinkLoop, 6000);
    return () => clearTimeout(timeoutId);
  }, [isBlinking]);

  // --- MOUTH ASSET LOGIC ---
  const currentMouthImage = useMemo(() => {
    if (isTalking) {
      const frames = ["mouth_close.png", "mouth_half.png", "mouth_open.png"];
      return {
        text: frames[talkFrame],
        source: "char",
        yOffset: -526,
        xOffset: -48,
        scale: 1,
      };
    }

    // Handle Chibi Fallback for Tongue/Smile_2 if needed
    if (mouthState === "tongue") {
      return {
        text: "mouth_tongue.png",
        source: "chibi",
        yOffset: -516,
        xOffset: -48,
        scale: 0.4,
      };
    }
    if (mouthState === "smile_2") {
      return {
        text: "mouth_smile_2.png",
        source: "chibi",
        yOffset: -510,
        xOffset: -36,
        scale: 0.45,
      };
    }

    return {
      text: `mouth_${mouthState}.png`,
      source: "char",
      yOffset: -526,
      xOffset: -48,
      scale: 1,
    };
  }, [isTalking, talkFrame, mouthState]);

  // --- EYE ASSET LOGIC ---
  const currentEyeImage = useMemo(() => {
    if (blinkActive) {
      // Prefer "eyes_closed" (Happy/Sleep) for blink unless we want Wink
      // Standard Sen doesn't have "sleep" specifically, but "eyes_closed" is happy/closed.
      return {
        text: "eyes_closed.png",
        source: "char",
        yOffset: -598,
        scale: 1,
      };
    }

    switch (eyeState) {
      case "close":
      case "sleep":
        return {
          text: "eyes_closed.png",
          source: "char",
          yOffset: -598,
          scale: 1,
        };
      case "half":
        return {
          text: "eyes_half.png",
          source: "char",
          yOffset: -600,
          scale: 1,
        };
      case "like":
        return {
          text: "eye_Like.png",
          source: "chibi",
          yOffset: -595,
          scale: 0.3,
        }; // Smaller scale for Chibi eyes
      case "blink":
        return {
          text: "eye_blink.png",
          source: "chibi",
          yOffset: -595,
          scale: 0.3,
        }; // Smaller scale for Chibi eyes (Wink)
      case "normal":
      default:
        return {
          text: "eyes_open.png",
          source: "char",
          yOffset: -600,
          scale: 1,
        };
    }
  }, [eyeState, blinkActive]);

  // Xử lý sự kiện kéo thả
  const handlePointerDown = (event) => {
    if (!draggable) return;

    setIsDragging(true);
    const globalPos = event.data.global;
    setDragOffset({
      x: globalPos.x - position.x,
      y: globalPos.y - position.y,
    });
  };

  const handlePointerMove = (event) => {
    if (!draggable || !isDragging) return;

    const globalPos = event.data.global;
    const newX = globalPos.x - dragOffset.x;
    const newY = globalPos.y - dragOffset.y;

    setPosition({ x: newX, y: newY });

    if (onPositionChange) {
      onPositionChange({ x: newX, y: newY });
    }
  };

  const handlePointerUp = () => {
    if (!draggable) return;
    setIsDragging(false);
  };

  // Hàm helper để load ảnh
  const Part = ({
    name, // Image filename
    source = "char", // 'char' or 'chibi'
    yOffset = 0,
    xOffset = 0,
    zIndex = 0,
    visible = true,
    rotation = 0,
    scale = 1, // Add scale support
  }) => {
    if (!visible) return null;

    // Determine path based on source
    const imageUrl =
      source === "chibi" ? getChibiAsset(name) : getCharacterAsset(name);

    return (
      <Sprite
        image={imageUrl}
        anchor={0.5}
        x={xOffset}
        y={yOffset}
        zIndex={zIndex}
        rotation={rotation}
        scale={scale}
      />
    );
  };

  // Calculate pivot based on requested origin
  const pivotY = useMemo(() => {
    switch (origin) {
      case 'head': return -950; // Balanced top (no clipping)
      case 'feet': return 1416;  // Ground level
      case 'torso':
      default: return 380;     // Visual center (stable for dragging)
    }
  }, [origin]);

  return (
    <Container
      x={position.x}
      y={position.y + breathingY} // Áp dụng chuyển động nhún
      scale={{ x: scale, y: scale * breathingScale }} // Áp dụng chuyển động thở
      sortableChildren={true} // Cho phép sắp xếp lớp bằng zIndex
      interactive={draggable}
      pointerdown={handlePointerDown}
      pointermove={handlePointerMove}
      pointerup={handlePointerUp}
      pivot={{ x: 0, y: pivotY }}
      pointerupoutside={handlePointerUp}
      cursor={draggable ? (isDragging ? "grabbing" : "grab") : "default"}
      onclick={() => {
        if (onClick) return onClick;
      }}
    >
      {/* --- CƠ THỂ --- */}
      <Part name="shoes.png" yOffset={1416} xOffset={-6} zIndex={2} />
      <Part name="leg.png" yOffset={926} xOffset={-24} zIndex={3} />
      <Part
        name="ribbon_shoes.png"
        yOffset={1500}
        xOffset={-24}
        zIndex={4}
        rotation={swayRotation}
      />

      <Part name="head_base.png" yOffset={-500} xOffset={-48} zIndex={5} />
      <Part name="inner_shirt.png" yOffset={-110} xOffset={-24} zIndex={7} />

      {/* --- TAY (Cần chỉnh khớp với áo) --- */}
      <Part
        name="hand_left.png"
        xOffset={-320}
        yOffset={166}
        zIndex={6}
        rotation={swayRotation * 0.1}
      />
      <Part
        name="hand_right.png"
        xOffset={294}
        yOffset={166}
        zIndex={6}
        rotation={-swayRotation * 0.1}
      />

      {/* --- QUẦN ÁO --- */}
      {/* Váy cũng nên bay nhẹ */}
      <Part
        name="dress.png"
        xOffset={-30}
        yOffset={396}
        zIndex={6}
        rotation={swayRotation * 0.2}
      />
      {/* Áo khoác có thể bật tắt */}
      <Part
        name="coats.png"
        yOffset={36}
        xOffset={-18}
        zIndex={9}
        visible={showCoat}
      />

      {/* --- KHUÔN MẶT --- */}

      {/* Whites of eyes: Only show if using Standard eyes. Chibi eyes usually cover/replace this. 
          Standard eyes: open, closed, half. 
          Chibi eyes: like, blink.
      */}
      <Part
        name="whites_of_the_eyes.png"
        yOffset={-600}
        xOffset={-48}
        zIndex={10}
        visible={currentEyeImage.source === "char"}
      />

      {/* Eyes */}
      <Part
        name={currentEyeImage.text}
        source={currentEyeImage.source}
        yOffset={currentEyeImage.yOffset}
        xOffset={-48}
        zIndex={11}
        scale={currentEyeImage.scale}
      />

      <Part name="eyebrow_1.png" yOffset={-596} xOffset={-48} zIndex={12} />

      {/* Kính có thể bật tắt */}
      <Part
        name="glasses.png"
        yOffset={-594}
        xOffset={-48}
        zIndex={13}
        visible={showGlasses}
      />

      {/* Miệng thay đổi động */}
      <Part
        name={currentMouthImage.text}
        source={currentMouthImage.source}
        yOffset={currentMouthImage.yOffset}
        xOffset={currentMouthImage.xOffset}
        zIndex={12}
        scale={currentMouthImage.scale}
      />

      <Part
        name="hair_back.png"
        rotation={swayRotation * 0.5}
        yOffset={-620}
        xOffset={-48}
        zIndex={13}
        opacity={0.3}
      />

      {/* --- LỚP TRƯỚC --- */}
      <Part
        name="hair_front.png"
        yOffset={-620}
        xOffset={-48}
        zIndex={14}
        rotation={swayRotation * 0.3}
      />

      {/* Mũ và phụ kiện mũ có thể bật tắt */}
      <Part
        name="hat.png"
        yOffset={-780}
        xOffset={-40}
        zIndex={15}
        visible={showHat}
      />
      <Part
        name="hat_accessories_1.png"
        yOffset={-670}
        xOffset={90}
        zIndex={16}
        visible={showHat}
      />

      {/* Túi lắc lư nhiều hơn và có thể bật tắt */}
      <Part
        name="bag.png"
        xOffset={36}
        yOffset={60}
        zIndex={17}
        // rotation={swayRotation}
        visible={showBag}
      />

      <Part
        name="shirt_accessories.png"
        yOffset={-180}
        zIndex={18}
        xOffset={-44}
      />
      <Part
        name="ribbon_inner_shirt.png"
        yOffset={-312}
        xOffset={-48}
        zIndex={19}
        rotation={swayRotation * 0.5}
      />
    </Container>
  );
};

export default SenCharacter;
