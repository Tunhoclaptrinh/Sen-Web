// @ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import { Container, Sprite, useTick } from "@pixi/react";
import { SenChibiProps } from "./types";

const getAsset = (name: string) => {
    return new URL(`../../assets/images/SenChibi/${name}`, import.meta.url).href;
};

const SenChibi: React.FC<SenChibiProps> = ({
    x = 0,
    y = 0,
    scale = 0.5,
    visible = true,
    showHat = true,
    showGlasses = true,
    showCoat = true,
    outfit = 'normal',
    mouthState = 'smile',
    eyeState = 'normal',
    gesture = 'normal',
    isTalking = false,
    interactive = false,
    onClick,
}) => {
    // Animation States
    const [breathingScale, setBreathingScale] = useState(1);
    const [breathingY, setBreathingY] = useState(0);
    const [swayRotation, setSwayRotation] = useState(0);
    const [blinkState, setBlinkState] = useState(false);
    const [talkFrame, setTalkFrame] = useState(0);

    // Tick for animations
    useTick(() => {
        const tick = Date.now() / 1000;

        // 1. Breathing
        setBreathingScale(1 + Math.sin(tick * 2) * 0.005);
        setBreathingY(Math.sin(tick * 2) * 2);

        // 2. Swaying (Hair/Clothes)
        setSwayRotation(Math.sin(tick * 1.5) * 0.02);

        // 3. Talking Animation
        if (isTalking) {
            setTalkFrame(Math.floor(tick * 10) % 3); // 0, 1, 2
        }
    });

    // Blinking Logic
    useEffect(() => {
        const blinkLoop = () => {
            setBlinkState(true);
            setTimeout(() => setBlinkState(false), 150);

            // Random next blink 2-5s
            const nextBlink = Math.random() * 3000 + 2000;
            setTimeout(blinkLoop, nextBlink);
        };

        const timer = setTimeout(blinkLoop, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Determine current textures
    const eyeTexture = useMemo(() => {
        if (blinkState) return 'eye_blink.png';
        switch (eyeState) {
            case 'blink': return 'eye_blink.png';
            case 'close': return 'eye_close.png';
            case 'half': return 'eye_half.png';
            case 'like': return 'eye_Like.png';
            case 'sleep': return 'eye_sleep.png';
            default: return 'eye.png';
        }
    }, [eyeState, blinkState]);

    const mouthTexture = useMemo(() => {
        if (isTalking) {
            const frames = ['mouth_close.png', 'mouth_half.png', 'mouth_open.png'];
            return frames[talkFrame];
        }
        switch (mouthState) {
            case 'smile_2': return 'mouth_smile_2.png';
            case 'sad': return 'mouth_sad.png';
            case 'open': return 'mouth_open.png';
            case 'close': return 'mouth_close.png';
            case 'half': return 'mouth_half.png';
            case 'tongue': return 'mouth_tongue.png';
            default: return 'mouth_smile.png';
        }
    }, [mouthState, isTalking, talkFrame]);

    // Helper Part Component
    const Part = ({ name, xOfs = 0, yOfs = 0, z = 0, rot = 0, vis = true, anchor = 0.5 }: any) => {
        if (!vis) return null;
        return (
            <Sprite
                image={getAsset(name)}
                x={xOfs}
                y={yOfs}
                zIndex={z}
                rotation={rot}
                anchor={anchor}
            />
        );
    };

    if (!visible) return null;

    return (
        <Container
            x={x}
            y={y + breathingY}
            scale={{ x: scale, y: scale * breathingScale }}
            sortableChildren={true}
            interactive={interactive}
            pointertap={onClick}
            cursor={interactive ? 'pointer' : 'default'}
        >
            {/* 1. Back Layer */}
            <Part name="hair_back.png" yOfs={-20} z={0} rot={swayRotation * 0.5} />

            {/* 2. Body Base */}
            <Part name="legs.png" yOfs={150} z={1} />

            {/* 3. Clothes */}
            <Part
                name={outfit === 'ao_dai' ? "clothers_ao_dai.png" : "clothers_normal.png"}
                yOfs={80}
                z={2}
            />

            {/* 4. Coat */}
            <Part name="coats.png" yOfs={80} z={3} vis={showCoat} />

            {/* 5. Arms & Gestures */}
            {/* Left Arm (Fixed for now unless gesture affects it) */}
            <Part name="arm_left.png" xOfs={-90} yOfs={60} z={4} rot={swayRotation} />

            {/* Right Arm / Gesture */}
            {gesture === 'normal' && (
                <Part name="arm_right.png" xOfs={90} yOfs={60} z={4} rot={-swayRotation} />
            )}
            {gesture === 'hello' && (
                <Part name="arm_hello.png" xOfs={90} yOfs={30} z={4} rot={Math.sin(Date.now() / 200) * 0.1} />
            )}
            {gesture === 'point' && (
                <Part name="hand_point.png" xOfs={90} yOfs={40} z={4} rot={-swayRotation} />
            )}
            {gesture === 'like' && (
                <Part name="hand_like.png" xOfs={90} yOfs={50} z={4} rot={-swayRotation} />
            )}
            {gesture === 'flag' && (
                <Part name="hand_flag.png" xOfs={100} yOfs={20} z={4} rot={Math.sin(Date.now() / 300) * 0.05} />
            )}
            {gesture === 'hand_back' && (
                <Part name="hand_back.png" xOfs={0} yOfs={60} z={1} />
            )}

            {/* 6. Face Base */}
            <Part name="face.png" yOfs={-80} z={5} />

            {/* 7. Facial Features */}
            <Part name={eyeTexture} yOfs={-90} z={6} />
            <Part name={mouthTexture} yOfs={-40} z={6} />

            {/* 8. Front Hair */}
            <Part name="hair_font.png" yOfs={-100} z={7} rot={swayRotation * 0.3} />
            <Part name="hair_top.png" yOfs={-190} z={8} rot={swayRotation * 0.4} />

            {/* 9. Accessories */}
            <Part name="glasses.png" yOfs={-90} z={9} vis={showGlasses} />
            <Part name="hat.png" yOfs={-180} z={10} vis={showHat} />

        </Container>
    );
};

export default SenChibi;
