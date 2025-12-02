import React, { useState, useEffect, useMemo } from "react";
import { Container, Sprite, useTick } from "@pixi/react";
const getCharacterAsset = (name) => {
  // Đường dẫn tương đối từ file component (index.jsx) đến thư mục ảnh
  // Component đang ở: src/components/SenCharacter/
  // Ảnh ở: src/assets/images/character/
  // => Cần lùi ra 2 cấp (../../) để về src, rồi vào assets
  return new URL(`../../assets/images/character/${name}`, import.meta.url).href;
};

const SenCharacter = ({
  x,
  y,
  scale,
  showHat = true,
  showGlasses = true,
  showBag = true,
  showCoat = true,
  mouthState = "smile", // 'smile', 'sad', 'angry', 'open', 'close', 'half'
  isTalking = false,
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
  const [isBlinking, setIsBlinking] = useState(false);

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
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150); // Mắt nhắm trong 150ms

      const nextBlinkTime = Math.random() * 2000 + 2000;
      setTimeout(blinkLoop, nextBlinkTime);
    };

    const timeoutId = setTimeout(blinkLoop, 6000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Tính toán tên file ảnh miệng dựa trên props
  const currentMouthImage = useMemo(() => {
    if (isTalking) {
      // Animation mấp máy môi: close -> half -> open
      const frames = ["mouth_close.png", "mouth_half.png", "mouth_open.png"];
      return frames[talkFrame];
    }

    // Nếu không nói, dùng prop mouthState
    return `mouth_${mouthState}.png`;
  }, [isTalking, talkFrame, mouthState]);

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

  // Hàm helper để load ảnh nhanh gọn
  const Part = ({
    name,
    yOffset = 0,
    xOffset = 0,
    zIndex = 0,
    visible = true,
    rotation = 0,
  }) => {
    if (!visible) return null;
    return (
      <Sprite
        // image={`${ASSET_PATH}/${name}`}
        image={getCharacterAsset(name)}
        anchor={0.5}
        x={xOffset}
        y={yOffset}
        zIndex={zIndex}
        rotation={rotation}
      />
    );
  };

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
      pivot={{ x: 0, y: 380 }}
      pointerupoutside={handlePointerUp}
      cursor={draggable ? (isDragging ? "grabbing" : "grab") : "default"}
      onclick={() => {
        if (onClick) return onClick;
      }}
    >
      {/* --- CƠ THỂ --- */}
      <Part name="shoes.png" yOffset={1442} zIndex={2} />
      <Part name="leg.png" yOffset={954} xOffset={-17} zIndex={3} />
      <Part
        name="ribbon_shoes.png"
        yOffset={1512}
        xOffset={-18}
        zIndex={4}
        rotation={swayRotation}
      />

      <Part name="head_base.png" yOffset={-500} xOffset={-48} zIndex={5} />
      <Part name="inner_shirt.png" yOffset={-110} xOffset={-18} zIndex={6} />

      {/* --- TAY (Cần chỉnh khớp với áo) --- */}
      <Part
        name="hand_left.png"
        xOffset={-360}
        yOffset={436}
        zIndex={8}
        rotation={swayRotation * 0.2}
      />
      <Part
        name="hand_right.png"
        xOffset={390}
        yOffset={430}
        zIndex={8}
        rotation={-swayRotation * 0.2}
      />

      {/* --- QUẦN ÁO --- */}
      {/* Váy cũng nên bay nhẹ */}
      <Part
        name="dress.png"
        yOffset={424}
        zIndex={7}
        rotation={swayRotation * 0.2}
      />
      {/* Áo khoác có thể bật tắt */}
      <Part name="coats.png" yOffset={30} zIndex={9} visible={showCoat} />

      {/* --- KHUÔN MẶT --- */}
      <Part
        name="whites_of_the_eyes.png"
        yOffset={-600}
        xOffset={-48}
        zIndex={10}
      />

      {/* Logic đổi texture mắt khi chớp */}
      {isBlinking ? (
        <Part
          name="eyes_closed.png"
          yOffset={-78 - 520}
          xOffset={-48}
          zIndex={11}
        />
      ) : (
        <Part
          name="eyes_open.png"
          yOffset={-80 - 520}
          xOffset={-48}
          zIndex={11}
        />
      )}

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
      <Part name={currentMouthImage} yOffset={-526} xOffset={-48} zIndex={12} />

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
        xOffset={60}
        yOffset={80}
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
