import React, {useState} from "react";
// import { Button } from "antd"; // Unused
import {Stage} from "@pixi/react";
import SenChibi from "@/components/SenChibi";
import type {DialogueScreen as DialogueScreenType} from "@/types/game.types";
import "./styles.less";

// const { Text, Paragraph } = Typography; // Unused

import {getImageUrl} from "@/utils/image.helper";

interface Props {
  data: DialogueScreenType;
  onNext: () => void;
  loading?: boolean;
}

const DialogueScreen: React.FC<Props> = ({data, onNext, loading}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

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
          console.log("Playing dialogue audio:", audioUrl);
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

      const timer = setInterval(() => {
        setDisplayedText(text.slice(0, index + 1));
        index++;
        if (index >= text.length) {
          clearInterval(timer);
          setIsTyping(false);
        }
      }, 30); // Speed: 30ms

      return () => {
        clearInterval(timer);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }
  }, [currentIndex, currentDialogue]);

  // Auto-scroll to bottom whenever text updates
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [displayedText, currentIndex]);

  const handleNextDialogue = () => {
    if (isTyping) {
      // Finish typing immediately
      setDisplayedText(currentDialogue?.text || "");
      setIsTyping(false);
      return;
    }

    if (currentIndex < (data.content?.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (!loading) {
      onNext();
    }
  };

  if (!currentDialogue) return null;

  // Storyteller Layout: No history visible, just current message.

  return (
    <div className="dialogue-screen" onClick={handleNextDialogue}>
      <div
        className="dialogue-background"
        style={{
          backgroundImage: `url(${getImageUrl(data.backgroundImage)})`,
        }}
      />

      <div className="dialogue-content">
        {/* Story Interface Container */}
        <div className="story-interface">
          {/* SEN PORTRAIT (LEFT OF BOX or INSIDE) - Reference shows it on right of text, but let's put it next to it */}
          {/* IF SEN IS SPEAKING/ACTIVE */}
          <div className={`sen-portrait-container ${isSenSpeaking ? "active" : ""}`}>
            <Stage
              width={280}
              height={400}
              options={{backgroundAlpha: 0}}
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
          </div>

          <div
            className={`dialogue-box-story ${isUserSpeaking ? "user-turn" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleNextDialogue();
            }}
          >
            <div className="dialogue-header">
              <span className="character-name">
                {isUserSpeaking ? "Bạn" : currentDialogue.speaker === "AI" ? "Trợ lý Sen" : currentDialogue.speaker}
              </span>
            </div>
            <div className="dialogue-text">
              {displayedText}
              {isTyping && <span className="typing-cursor">|</span>}
            </div>

            {!isTyping && <div className="next-indicator">Chạm để tiếp tục ▼</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueScreen;
