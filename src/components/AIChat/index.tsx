import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Spin, Modal, List, Avatar, Tabs } from "antd";
import { 
    SendOutlined, 
    CloseOutlined, 
    SoundOutlined, 
    AudioMutedOutlined, 
    AudioOutlined, 
    PauseCircleOutlined,
    SettingOutlined,
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    BulbOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";
import { Stage } from "@pixi/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendChatMessage,
  fetchChatHistory,
  fetchCharacters,
  addUserMessage,
  setCurrentCharacter,
  setMuted,
  clearChatHistory,
} from "@/store/slices/aiSlice";
import type { ChatMessage } from "@/types";
import SenChibi from "@/components/SenChibi";
import SenCharacter from "@/components/SenCharacter";
import { SenCustomizationSettings } from "@/components/common";
import "./styles.less";

interface AIChatProps {
  open: boolean;
  onClose: () => void;
  position?: 'fixed' | 'absolute';
}

const AIChat: React.FC<AIChatProps> = ({ open, onClose, position = 'fixed' }) => {
  const dispatch = useAppDispatch();
  const { chatHistory, currentCharacter, characters, chatLoading, isMuted, senSettings, activeContext } = useAppSelector((state) => state.ai);
  const { user } = useAppSelector((state) => state.auth);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [streamingText, setStreamingText] = useState("");
  const [dimensions, setDimensions] = useState({
    width: 1000, // Default fallback
    height: 800,
  });

  const topMargin = (dimensions.height * 0.2) + (35 * (senSettings?.scale || 0.2));

  // Fetch history when opening
  useEffect(() => {
    if (open && user && currentCharacter) {
      dispatch(fetchChatHistory({ characterId: currentCharacter.id, limit: 50 }));
    }
  }, [open, user, currentCharacter, dispatch]);

  // Set default character if not present
  useEffect(() => {
    if (open && !currentCharacter) {
      dispatch(fetchCharacters()).then((action: any) => {
        if (action.payload && action.payload.length > 0) {
          dispatch(setCurrentCharacter(action.payload[0]));
        }
      });
    }
  }, [open, currentCharacter, dispatch]);

  // Audio & Sync Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const targetTextRef = useRef<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const charPerMsRef = useRef<number>(0.1); // Default: 1 char per 10ms
  const pausedDurationRef = useRef<number>(0);
  const activePauseEndTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const lastPunctuationIndexRef = useRef<number>(-1);

  const PUNCTUATION_PAUSES: Record<string, number> = {
    '.': 600, '!': 600, '?': 600,
    ',': 300, ';': 300, ':': 300
  };

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    updateSize();

    return () => observer.disconnect();
  }, [open]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [chatHistory, streamingText, open]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!open) {
      stopAll();
    }
    return () => stopAll();
  }, [open]);

  const stopAll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setAudioPlaying(null);
    startTimeRef.current = 0;
  };

  const playMessageAudio = (audioBase64: string, messageId: number) => {
    if (audioPlaying === messageId && audioRef.current) {
        audioRef.current.pause();
        return;
    }
    stopAll();
    if (!audioBase64) return;

    const audioSrc = audioBase64.startsWith("data:") ? audioBase64 : `data:audio/mp3;base64,${audioBase64}`;
    const audio = new Audio(audioSrc);
    audio.muted = isMuted;
    audioRef.current = audio;

    audio.onplay = () => {
        setIsSpeaking(true);
        setAudioPlaying(messageId);
    };
    audio.onended = () => {
        setIsSpeaking(false);
        setAudioPlaying(null);
    };
    audio.onpause = () => {
        setIsSpeaking(false);
        setAudioPlaying(null);
    };
    audio.onerror = () => {
        setIsSpeaking(false);
        setAudioPlaying(null);
    };

    audio.play().catch(console.error);
  };

  const startStreaming = () => {
    if (intervalRef.current) return;
    
    if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
    }

    intervalRef.current = setInterval(() => {
      const targetText = targetTextRef.current;
      if (!targetText) {
          stopAll();
          return;
      }

      const now = Date.now();

      // Handle active pause (punctuation)
      if (activePauseEndTimeRef.current > 0) {
          if (now < activePauseEndTimeRef.current) {
              setIsSpeaking(false); // Stop mouth movement during pause
              return;
          }
          // Pause finished
          pausedDurationRef.current += (activePauseEndTimeRef.current - pauseStartTimeRef.current);
          activePauseEndTimeRef.current = 0;
          pauseStartTimeRef.current = 0;
          setIsSpeaking(true);
      }

      const speed = charPerMsRef.current > 0 ? charPerMsRef.current : 0.1;
      const effectiveElapsed = Math.max(0, now - startTimeRef.current - pausedDurationRef.current);
      let charsToShow = Math.floor(effectiveElapsed * speed);
      
      // Check for next punctuation pause
      const currentLen = streamingText.length;
      if (charsToShow > currentLen && charsToShow <= targetText.length) {
          for (let i = currentLen; i < charsToShow; i++) {
              const char = targetText[i];
              if (PUNCTUATION_PAUSES[char] && i > lastPunctuationIndexRef.current) {
                  charsToShow = i + 1;
                  activePauseEndTimeRef.current = now + PUNCTUATION_PAUSES[char];
                  pauseStartTimeRef.current = now;
                  lastPunctuationIndexRef.current = i;
                  setIsSpeaking(false);
                  break;
              }
          }
      }

      if (charsToShow < targetText.length) {
        setStreamingText(targetText.substring(0, charsToShow));
        if (activePauseEndTimeRef.current === 0) setIsSpeaking(true);
      } else {
        // Complete
        setStreamingText(targetText);
        setIsSpeaking(false);
        // Note: Redux chatHistory will already have the message from sendChatMessage.fulfilled
        // We just clear local streaming text after a short delay or immediately
        setTimeout(() => {
            setStreamingText("");
            stopAll();
        }, 500);
      }
    }, 16); 
  };

  const streamText = (fullText: string, audioBase64?: string) => {
    targetTextRef.current = fullText;
    setStreamingText("");
    startTimeRef.current = Date.now();
    pausedDurationRef.current = 0;
    activePauseEndTimeRef.current = 0;
    lastPunctuationIndexRef.current = -1;
    charPerMsRef.current = 0.05; // Fallback

    if (audioBase64) {
        const audioSrc = audioBase64.startsWith("data:") ? audioBase64 : `data:audio/mp3;base64,${audioBase64}`;
        const audio = new Audio(audioSrc);
        audio.muted = isMuted; // Set initial mute state
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
            const durationMs = audio.duration * 1000;
            if (durationMs > 0 && fullText.length > 0) {
                let totalPauseTime = 0;
                for (const char of fullText) {
                    if (PUNCTUATION_PAUSES[char]) totalPauseTime += PUNCTUATION_PAUSES[char];
                }
                const activeDuration = durationMs - totalPauseTime;
                const safeDuration = activeDuration > (durationMs * 0.2) ? activeDuration : durationMs * 0.8; 
                charPerMsRef.current = fullText.length / (safeDuration * 0.95);
            }
            audio.play();
            startStreaming();
        };
        audio.onerror = () => startStreaming();
    } else {
        startStreaming();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !currentCharacter) return;

    const userText = input.trim();
    setInput("");
    setLoading(true);

    // Add user message to Redux
    dispatch(addUserMessage(userText));

    try {
      console.log("Sending message to AI via Redux:", userText);
      const action: any = await dispatch(sendChatMessage({
        character_id: currentCharacter.id,
        message: userText,
        context: activeContext || undefined,
      })).unwrap();

      // Extracted from ChatResponse
      const fullResponse = action.message?.content || action.message || "Xin lỗi, mình không thể trả lời câu hỏi này.";
      const audioBase64 = action.message?.audio_base64 || action.audio_base64;
      
      setLoading(false);
      streamText(fullResponse, audioBase64);
    } catch (error) {
      console.error("AI Chat Error Detail:", error);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          ref={containerRef}
          className={`ai-chat-overlay ${position === 'fixed' ? 'is-fixed' : 'is-absolute'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="ai-chat-container"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="controls-group">
                <Button 
                    className="control-button delete-button"
                    icon={<DeleteOutlined />} 
                    onClick={() => {
                        if (currentCharacter) dispatch(clearChatHistory(currentCharacter.id));
                    }}
                    type="text"
                    disabled={chatHistory.length === 0}
                />
                <Button 
                    className="control-button mute-button"
                    icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />} 
                    onClick={() => {
                        const newMuted = !isMuted;
                        dispatch(setMuted(newMuted));
                        if (audioRef.current) {
                            audioRef.current.muted = newMuted;
                            if (newMuted) {
                                audioRef.current.pause(); // Pause if muted, as per user's "thực sự hoạt động"
                                setIsSpeaking(false);
                            } else if (!!streamingText || targetTextRef.current) {
                                audioRef.current.play().catch(console.error);
                                setIsSpeaking(true);
                            }
                        }
                        if (newMuted) {
                            window.speechSynthesis.cancel();
                        }
                    }}
                    type="text"
                />
                <Button 
                    className="control-button setting-button"
                    icon={<SettingOutlined />} 
                    onClick={() => setIsSettingsOpen(true)}
                    type="text"
                />
                <Button 
                    className="control-button close-button"
                    icon={<CloseOutlined />} 
                    onClick={onClose}
                    type="text"
                />
            </div>

            <div className="chat-scene">
              <div className="scene-background" />
              
              <div className="character-layer">
                <Stage
                  width={dimensions.width * 0.4}
                  height={dimensions.height}
                  options={{ backgroundAlpha: 0, antialias: true }}
                >
                  {senSettings.isChibi ? (
                    <SenChibi
                        x={dimensions.width * 0.2}
                        y={topMargin} 
                        scale={senSettings.scale * 1.45} 
                        origin="head"
                        isTalking={loading || !!streamingText || isSpeaking}
                        gesture={loading ? "point" : (isSpeaking ? "hello" : "normal")}
                        eyeState={loading ? "blink" : (isSpeaking ? "normal" : senSettings.eyeState as any)}
                        mouthState={senSettings.mouthState as any}
                        showHat={senSettings.accessories.hat}
                        showGlasses={senSettings.accessories.glasses}
                        showCoat={senSettings.accessories.coat}
                        isBlinking={senSettings.isBlinking}
                    />
                  ) : (
                    <SenCharacter
                        x={dimensions.width * 0.2}
                        y={topMargin}
                        scale={senSettings.scale * 1.45}
                        origin="head"
                        isTalking={loading || !!streamingText || isSpeaking}
                        eyeState={loading ? "blink" : (isSpeaking ? "normal" : senSettings.eyeState as any)}
                        mouthState={senSettings.mouthState as any}
                        showHat={senSettings.accessories.hat}
                        showGlasses={senSettings.accessories.glasses}
                        showCoat={senSettings.accessories.coat}
                        showBag={senSettings.accessories.bag}
                        isBlinking={senSettings.isBlinking}
                        draggable={false}
                        onPositionChange={() => { }}
                        onClick={() => { }}
                    />
                  )}
                </Stage>
              </div>

              <div className="messages-overlay">
                <div className="messages-container">
                  {chatHistory.length === 0 && !loading && !streamingText && (
                    <div className="message assistant">
                      <div className="message-content">
                        <div className="message-bubble">
                          Xin chào! Mình là trợ lý Sen. Mình sẽ hướng dẫn bạn khám phá di sản văn hóa Việt Nam! 🌸
                        </div>
                      </div>
                    </div>
                  )}
                  {chatHistory
                    .slice()
                    .map((message: ChatMessage, index: number) => {
                      // Tránh hiển thị trùng lặp khi đang stream tin nhắn mới nhất
                      const isLastAssistantMessage = 
                        index === chatHistory.length - 1 && 
                        message.role === "assistant" && 
                        streamingText;
                        
                      if (isLastAssistantMessage) return null;

                      return (
                        <div key={message.id} className={`message ${message.role}`}>
                          <div className="message-content">
                            <div className="message-bubble">
                              <div className="message-text">{message.content}</div>
                              <div className="message-footer">
                                <span className="timestamp">
                                  {new Date(message.timestamp).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                {message.role === "assistant" && message.audio_base64 && (
                                  <Button
                                    className="audio-replay-btn"
                                    icon={audioPlaying === message.id ? <PauseCircleOutlined /> : <SoundOutlined />}
                                    size="small"
                                    onClick={() => playMessageAudio(message.audio_base64!, message.id)}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {streamingText && (
                    <div className="message assistant">
                      <div className="message-content">
                        <div className="message-bubble">
                          <div className="message-text">
                            {streamingText}
                            <span className="cursor">|</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {loading && !streamingText && (
                    <div className="message assistant">
                      <div className="message-content">
                        <div className="message-bubble">
                          <Spin size="small" />
                        </div>
                      </div>
                    </div>
                  )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

              {/* Suggestions Overlay */}
              <div className="suggestions-overlay">
                <div className="suggestions-container">
                    {position === 'absolute' && activeContext?.level_id && (
                        <div className="suggestion-chip" onClick={() => { setInput("Gợi ý giúp mình với"); handleSend(); }}>
                            <BulbOutlined /> Gợi ý bài học
                        </div>
                    )}
                    {(activeContext?.artifact_id || activeContext?.heritage_site_id) && (
                        <div className="suggestion-chip" onClick={() => { setInput("Bạn hãy giải thích thêm về nội dung này"); handleSend(); }}>
                            <InfoCircleOutlined /> Giải thích thêm
                        </div>
                    )}
                </div>
              </div>
            </div>

            <div className="input-container" style={{ pointerEvents: 'auto' }}>
              <Input
                autoFocus
                placeholder="Hỏi về di sản văn hóa Việt Nam..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={handleSend}
                disabled={loading || chatLoading}
                style={{ fontSize: '18px' }}
                suffix={
                  <Button
                    type="text"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    disabled={loading || chatLoading || !input.trim()}
                    style={{ color: "#8b1d1d" }}
                  />
                }
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      <Modal
        title="Cài đặt AI"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        footer={null}
        width={600}
        className="character-settings-modal"
      >
        <Tabs
            defaultActiveKey="select"
            items={[
                {
                    key: 'select',
                    label: (
                        <span>
                            <UserOutlined />
                            Nhân vật
                        </span>
                    ),
                    children: (
                        <List
                            itemLayout="horizontal"
                            dataSource={characters}
                            renderItem={(character) => (
                                <List.Item
                                    className={`character-item ${currentCharacter?.id === character.id ? 'active' : ''}`}
                                    onClick={() => {
                                        dispatch(setCurrentCharacter(character));
                                        // Keep modal open if it's Sen to allow customization, 
                                        // or close it if user wants to get back to chat
                                    }}
                                    style={{ cursor: 'pointer', padding: '12px', borderRadius: '8px' }}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={character.avatar} size="large" />}
                                        title={character.name}
                                        description={character.description}
                                    />
                                    {currentCharacter?.id === character.id && (
                                        <div className="active-badge">Đang chọn</div>
                                    )}
                                </List.Item>
                            )}
                        />
                    )
                },
                ...(currentCharacter?.name?.toLowerCase().includes('sen') ? [{
                    key: 'customize',
                    label: (
                        <span>
                            <EditOutlined />
                            Tùy chỉnh SEN
                        </span>
                    ),
                    children: (
                        <div style={{ padding: '0 12px 12px 12px', maxHeight: '60vh', overflowY: 'auto' as const }}>
                            <SenCustomizationSettings compact />
                        </div>
                    )
                }] : [])
            ]}
        />
      </Modal>
    </AnimatePresence>
  );
};

export default AIChat;
