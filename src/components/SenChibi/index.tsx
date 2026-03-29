import React, { useEffect, useMemo, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Container, Sprite, useTick } from "@pixi/react";
import { IMAGE_MAPPING } from "@/config/imageMapping";
import { SenChibiProps } from "./types";

const getAsset = (name: string) => {
  const localPath = `src/assets/images/SenChibi/${name}`;
  return IMAGE_MAPPING[localPath] || new URL(`../../assets/images/SenChibi/${name}`, import.meta.url).href;
};

const SenChibi: React.FC<SenChibiProps> = ({
  x = 0,
  y = 0,
  scale = 0.5,
  origin = 'torso',
  visible = true,
  showHat = true,
  showGlasses = true,
  showCoat = true,
  outfit = "normal",
  mouthState = "smile",
  eyeState = "normal",
  gesture = "normal",
  isTalking = false,
  isBlinking = true, // Default to true
  interactive = false,
  onClick,
}) => {
  // Animation States
  const containerRef = useRef<PIXI.Container>(null);
  const [blinkState, setBlinkState] = useState(false);
  const [talkFrame, setTalkFrame] = useState(0);

  // Tick for animations - DIRECT PIXI PROPERTY UPDATES (No React re-renders)
  useTick(() => {
    const container = containerRef.current;
    if (!container) return;
    const tick = Date.now() / 1000;

    // 1. Breathing (Directly update Container properties)
    container.y = y + Math.sin(tick * 2) * 2;
    container.scale.y = scale * (1 + Math.sin(tick * 2) * 0.005);

    // 2. Swaying / Talking (Directly update Children properties)
    const sway = Math.sin(tick * 1.5) * 0.02;
    
    // Efficiently update children based on their name
    container.children.forEach((child: any) => {
      if (!child.name) return;

      if (child.name === 'hair_back.png') child.rotation = sway * 0.5;
      if (child.name === 'arm_right.png') child.rotation = -sway;
      if (child.name === 'arm_left.png') child.rotation = sway;
      if (child.name === 'hand_back.png') child.rotation = sway;
      if (child.name === 'hand_point.png') child.rotation = sway;
      if (child.name === 'hand_like.png') child.rotation = sway;
      if (child.name === 'hair_font.png') child.rotation = sway * 0.2;
      if (child.name === 'hair_top.png') child.rotation = sway * 0.4;
      
      // Dynamic hand/flag rotation
      if (child.name === 'arm_hello.png') child.rotation = -Math.sin(tick * 5) * 0.05;
      if (child.name === 'hand_flag.png') child.rotation = -Math.sin(tick * 3.3) * 0.05;
    });

    // 3. Talking Animation - We still use state here because it's only 10fps 
    // and triggers a texture change (which React handles well).
    if (isTalking) {
      setTalkFrame(Math.floor(tick * 10) % 3); // 0, 1, 2
    }
  });

  // Blinking Logic
  useEffect(() => {
    if (!isBlinking) {
      setBlinkState(false);
      return;
    }

    let timer: NodeJS.Timeout;
    const blinkLoop = () => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);

      // Random next blink 2-5s
      const nextBlink = Math.random() * 3000 + 2000;
      timer = setTimeout(blinkLoop, nextBlink);
    };

    timer = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timer);
  }, [isBlinking]);

  // Determine current textures
  const eyeTexture = useMemo(() => {
    if (blinkState) return "eye_sleep.png";

    switch (eyeState) {
      case "blink":
        return "eye_blink.png"; // Explicit Wink
      case "close":
        return "eye_close.png";
      case "half":
        return "eye_half.png";
      case "like":
        return "eye_Like.png";
      case "sleep":
        return "eye_sleep.png";
      default:
        return "eye.png";
    }
  }, [eyeState, blinkState]);

  const mouthTexture = useMemo(() => {
    if (isTalking) {
      const frames = ["mouth_close.png", "mouth_half.png", "mouth_open.png"];
      return frames[talkFrame];
    }
    switch (mouthState) {
      case "smile_2":
        return "mouth_smile_2.png";
      case "sad":
        return "mouth_sad.png";
      case "open":
        return "mouth_open.png";
      case "close":
        return "mouth_close.png";
      case "half":
        return "mouth_half.png";
      case "tongue":
        return "mouth_tongue.png";
      default:
        return "mouth_smile.png";
    }
  }, [mouthState, isTalking, talkFrame]);

  // Helper Part Component - NOW PASSES NAME TO SPRITE
  const Part = ({
    name,
    xOfs = 0,
    yOfs = 0,
    z = 0,
    rot = 0,
    vis = true,
    anchor = 0.5,
    scale = 1,
    pivot = 0,
  }: any) => {
    if (!vis) return null;
    return (
      <Sprite
        {...({ name } as any)}
        image={getAsset(name)}
        x={xOfs}
        y={yOfs}
        zIndex={z}
        rotation={rot}
        anchor={anchor}
        scale={scale}
        pivot={pivot}
      />
    );
  };

  // Calculate pivot based on requested origin
  const pivotY = useMemo(() => {
    switch (origin) {
      case 'head': return -1450;
      case 'feet': return 500;
      case 'torso':
      default: return -300;
    }
  }, [origin]);

  if (!visible) return null;

  return (
    <Container
      ref={containerRef}
      x={x}
      y={y}
      pivot={{ x: 0, y: pivotY }}
      scale={{ x: scale, y: scale }}
      sortableChildren={true}
      eventMode={interactive ? "static" : "none"}
      pointertap={onClick}
      cursor={interactive ? "pointer" : "default"}
    >
      {/* 1. Back Layer */}
      <Part
        name="hair_back.png"
        yOfs={-760}
        z={6}
        xOfs={-25}
        rot={0}
        scale={1}
      />

      {/* 2. Body Base */}
      <Part name="legs.png" yOfs={500} z={1} />

      {/* 3. Clothes */}
      <Part
        name={
          outfit === "ao_dai" ? "clothers_ao_dai.png" : "clothers_normal.png"
        }
        yOfs={80}
        z={5}
      />

      {/* 4. Coat */}
      <Part
        name="coats.png"
        yOfs={-24}
        z={5}
        xOfs={-20}
        scale={1}
        vis={showCoat && gesture === "normal"}
      />

      {/* 5. Arms \u0026 Gestures */}
      <Part
        name="arm_right.png"
        xOfs={270}
        yOfs={60}
        z={4}
        rot={0}
      />

      {gesture === "normal" && (
        <Part
          name="arm_left.png"
          xOfs={-300}
          yOfs={50}
          z={4}
          rot={0}
        />
      )}

      {["point", "like", "flag", "hello"].includes(gesture) && (
        <Part
          name="hand_back.png"
          yOfs={60}
          xOfs={-240}
          z={4}
          rot={0}
        />
      )}

      {gesture === "hello" && (
        <Part
          name="arm_hello.png"
          xOfs={-228}
          yOfs={16}
          scale={0.7}
          z={6}
          pivot={{ x: 30, y: 120 }}
          rot={0}
        />
      )}
      {gesture === "point" && (
        <Part
          name="hand_point.png"
          xOfs={-280}
          yOfs={-60}
          z={6}
          scale={0.7}
          rot={0}
        />
      )}
      {gesture === "like" && (
        <Part
          name="hand_like.png"
          xOfs={-400}
          yOfs={10}
          z={6}
          rot={0}
        />
      )}
      {gesture === "flag" && (
        <Part
          name="hand_flag.png"
          xOfs={-380}
          yOfs={-68}
          z={6}
          rot={0}
        />
      )}

      {/* 6. Face Base */}
      <Part name="face.png" yOfs={-604} z={2} xOfs={-55} scale={1} />

      {/* 7. Facial Features */}
      <Part name={eyeTexture} yOfs={-620} z={6} xOfs={-30} scale={1.02} />
      <Part name={mouthTexture} yOfs={-376} z={6} xOfs={-36} />

      {/* 8. Front Hair */}
      <Part
        name="hair_font.png"
        yOfs={-770}
        z={7}
        xOfs={-16}
        rot={0}
        scale={1}
      />
      <Part
        name="hair_top.png"
        yOfs={-1200}
        z={8}
        xOfs={-20}
        rot={0}
      />

      {/* 9. Accessories */}
      <Part name="glasses.png" yOfs={-620} z={9} xOfs={-30} vis={showGlasses} />
      <Part name="hat.png" yOfs={-1100} z={10} vis={showHat} />
    </Container>
  );
};

export default SenChibi;
