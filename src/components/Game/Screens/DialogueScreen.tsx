import React, { useState } from "react";
import { Stage } from "@pixi/react";
import { motion, AnimatePresence } from "framer-motion";
import SenChibi from "@/components/SenChibi";
import type { DialogueScreen as DialogueScreenType } from "@/types/game.types";
import { useGameSounds } from "@/hooks/useSound";
import { useTranslation } from "react-i18next";
import "./styles.less";

import { getImageUrl } from "@/utils/image.helper";

interface Props {
  data: DialogueScreenType;
  onNext: () => void;
  loading?: boolean;
}

const DialogueScreen: React.FC<Props> = ({ data, onNext, loading }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const { playClick } = useGameSounds();

  // Determine current active dialogue
  const currentDialogue = data.content?.[currentIndex];
  // Determine if Sen is speaking or listening (for animation)
  const isSenSpeaking = currentDialogue?.speaker !== "USER";
  const isUserSpeaking = currentDialogue?.speaker === "USER";

  // Typing Effect & Audio
  React.useEffect(() => {
    if (currentDialogue) {
      setDisplayedText("");
      setIsTyping(true);

      // Audio Playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (currentDialogue.audio) {
        try {
          const audioUrl = getImageUrl(
            currentDialogue.audio || (currentDialogue as any).audioUrl || (currentDialogue as any).url,
          );
          audioRef.current = new Audio(audioUrl);
          audioRef.current.play().catch((e) => {
            console.warn("Audio play failed (interaction required or invalid file):", e);
          });
        } catch (err) {
          console.error("Invalid audio data", err);
        }
      }

      let index = 0;
      const text = currentDialogue.text;

      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      typingTimerRef.current = setInterval(() => {
        setDisplayedText(text.slice(0, index + 1));
        index++;
        if (index >= text.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          typingTimerRef.current = null; // Clear ref after interval is done
          setIsTyping(false);
        }
      }, 15); // Speed: 15ms

      return () => {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        typingTimerRef.current = null; // Clear ref on unmount or re-run
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }
  }, [currentIndex, currentDialogue]);

  // Auto-scroll logic - Throttle or only on index change to avoid layout thrashing
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentIndex]); // Only scroll when dialogue changes, not every character


  const handleNextDialogue = () => {
    if (isTyping) {
      // Finish typing immediately
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setDisplayedText(currentDialogue?.text || "");
      setIsTyping(false);
      return;
    }

    if (currentIndex < (data.content?.length || 0) - 1) {
      playClick();
      setCurrentIndex(currentIndex + 1);
    } else if (!loading) {
      playClick();
      onNext();
    }
  };

  if (!currentDialogue) return null;

  return (
    <div className="dialogue-screen" onClick={handleNextDialogue}>
      <div
        className="dialogue-background"
        style={{
          backgroundImage: `url(${getImageUrl(data.backgroundImage)})`,
        }}
      />

      <div className="dialogue-content">
        <div className="story-interface">
          {/* Transition wrapper for portrait to animate on speaker change */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDialogue.speaker}
              className={`sen-portrait-container ${isSenSpeaking ? "active" : ""}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <Stage
                width={280}
                height={400}
                options={{ 
                  backgroundAlpha: 0, 
                  antialias: true, 
                  resolution: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1 
                }}
                style={{
                  position: "absolute",
                  bottom: -100,
                  right: -100,
                  pointerEvents: "none",
                }}
              >
                <SenChibi
                  x={140}
                  y={200}
                  scale={0.16}
                  visible={true}
                  mouthState={isSenSpeaking && isTyping ? "open" : "smile"}
                  isTalking={isSenSpeaking && isTyping}
                  eyeState="normal"
                  gesture="normal"
                  showCoat={true}
                  showHat={true}
                />
              </Stage>
            </motion.div>
          </AnimatePresence>

          <motion.div
            className={`dialogue-box-story ${isUserSpeaking ? "user-turn" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleNextDialogue();
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentIndex}
          >
            <div className="dialogue-header">
              <span className="character-name">
                {isUserSpeaking ? t('gamePlay.screens.dialogue.user') : currentDialogue.speaker === "AI" ? t('gamePlay.screens.dialogue.ai') : currentDialogue.speaker}
              </span>
            </div>
            <div className="dialogue-text">
              {displayedText}
              {isTyping && <span className="typing-cursor">|</span>}
            </div>

            {!isTyping && (
              <motion.div
                className="next-indicator"
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {t('gamePlay.screens.dialogue.nextIndicator')}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DialogueScreen;
