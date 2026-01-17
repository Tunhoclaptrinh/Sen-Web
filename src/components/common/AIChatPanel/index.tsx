import React, { useState, useEffect, useRef } from "react";
import {
  Input,
  Button,
  Space,
  Typography,
  Tooltip,
  Spin,
  message as antdMessage,
} from "antd";
import {
  SendOutlined,
  DeleteOutlined,
  SoundOutlined,
  PauseCircleOutlined,
  CloseOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendChatMessage,
  fetchChatHistory,
  clearChatHistory,
  addUserMessage,
  setCurrentCharacter,
} from "@/store/slices/aiSlice";
import type { AICharacter } from "@/services/ai.service";
import "./styles.less";

const { TextArea } = Input;
const { Text } = Typography;

interface AIChatPanelProps {
  visible?: boolean;
  onClose?: () => void;
  defaultCharacter?: AICharacter;
  context?: {
    level_id?: number;
    artifact_id?: number;
    heritage_site_id?: number;
  };
}

import { useGlobalCharacter } from "@/contexts/GlobalCharacterContext";

const AIChatPanel: React.FC<AIChatPanelProps> = ({
  visible = false,
  onClose,
  defaultCharacter,
  context,
}) => {
  const dispatch = useAppDispatch();
  const { chatHistory, currentCharacter, chatLoading, isTyping, error } =
    useAppSelector((state) => state.ai);
  const { user } = useAppSelector((state) => state.auth);
  
  // Connect to Global Character
  const globalChar = useGlobalCharacter();
  const setIsTalking = globalChar?.setIsTalking || (() => {});

  const [inputMessage, setInputMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Enhanced Streaming State
  const [streamingState, setStreamingState] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const targetTextRef = useRef<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const charPerMsRef = useRef<number>(0.1); // Default: 1 char per 10ms
  
  // Pause Refs
  const pausedDurationRef = useRef<number>(0);
  const activePauseEndTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const lastPunctuationIndexRef = useRef<number>(-1);

  const PUNCTUATION_PAUSES: Record<string, number> = {
    '.': 600, '!': 600, '?': 600,
    ',': 300, ';': 300, ':': 300
  };

  // Track processed messages to avoid re-streaming history on mount
  const lastProcessedMessageIdRef = useRef<number | null>(null);

  // Helper to start/ensure interval running
  const startStreaming = () => {
    if (intervalRef.current) return;
    
    // Initialize start time if starting fresh
    if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
    }

    setIsTalking(true);
    intervalRef.current = setInterval(() => {
      setStreamingState((prev) => {
        if (!prev) {
          if (intervalRef.current) {
             clearInterval(intervalRef.current);
             intervalRef.current = null;
          }
          setIsTalking(false);
          startTimeRef.current = 0;
          return null;
        }

        const now = Date.now();
        const targetText = targetTextRef.current;

        // CHECK PAUSE STATE
        if (activePauseEndTimeRef.current > 0) {
            if (now < activePauseEndTimeRef.current) {
                // Still Paused
                setIsTalking(false);
                return prev;
            }
            // Pause Finished
            pausedDurationRef.current += (activePauseEndTimeRef.current - pauseStartTimeRef.current);
            activePauseEndTimeRef.current = 0;
            pauseStartTimeRef.current = 0;
            setIsTalking(true);
        }

        // Use a fallback speed if charPerMsRef is invalid
        const speed = charPerMsRef.current > 0 ? charPerMsRef.current : 0.1;
        const effectiveElapsed = Math.max(0, now - startTimeRef.current - pausedDurationRef.current);
        
        let charsToShow = Math.floor(effectiveElapsed * speed);
        
        // CHECK PUNCTUATION PAUSE
        const currentLen = prev.text.length;
        // Optimization: only check punctuation if we are advancing
        if (charsToShow > currentLen && charsToShow <= targetText.length) {
             for (let i = currentLen; i < charsToShow; i++) {
                 const char = targetText[i];
                 if (PUNCTUATION_PAUSES[char] && i > lastPunctuationIndexRef.current) {
                     // Found punctuation -> Trigger Pause
                     charsToShow = i + 1; // Stop exactly after punctuation
                     
                     // Set pause state
                     const pauseDur = PUNCTUATION_PAUSES[char];
                     activePauseEndTimeRef.current = now + pauseDur;
                     pauseStartTimeRef.current = now;
                     lastPunctuationIndexRef.current = i;
                     
                     setIsTalking(false);
                     break; // Stop loop, we pause here
                 }
             }
        }

        if (charsToShow < targetText.length) {
          if (activePauseEndTimeRef.current === 0) setIsTalking(true);
          return { ...prev, text: targetText.substring(0, charsToShow) };
        } else {
          // Caught up
          setIsTalking(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          startTimeRef.current = 0;
          return { ...prev, text: targetText };
        }
      });
    }, 16); 
  }; 

  // Handle streaming and audio when new AI message arrives
  useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      
      // On mount/first load, don't stream if it's history
      // We assume it's history if we haven't processed any message yet and there's a list.
      // However, to be safe, if the user just sent a message, we want to stream the response.
      // For now, let's just ensure we don't stream if ID implies it's old (not reliable).
      // Better: if lastProcessedMessageIdRef is null, and we have history, set it to the last ID 
      // WITHOUT streaming, UNLESS chatLoading is false and it just arrived (complex).
      // SIMPLIFICATION: Only stream if the message ID changes while we are already mounted?
      // No, that breaks the first message.
      // Let's rely on standard check: only stream if id changes. 
      // BUT to avoid 'autoplay on reload' causing errors, we can suppress audio on first render?
      // The issue user reported "Empty bubble" means streaming started but didn't progress.
      
      if (lastMessage.role === "assistant" && lastMessage.content) {
        // Update target text reference immediately
        targetTextRef.current = lastMessage.content;

        // If this is a new message we haven't processed for streaming yet
        if (streamingState?.id !== lastMessage.id && lastProcessedMessageIdRef.current !== lastMessage.id) {
          
          const isHistoryLoad = lastProcessedMessageIdRef.current === null && chatHistory.length > 1; 
          // If it's the very first load and we have history, assume it's old -> don't stream.
          // Exception: If chatHistory has 1 item, it might be the welcome message or a fresh response.
          // Let's assume if we are reloading, lastProcessedMessageId is null.
          
          if (isHistoryLoad) {
              lastProcessedMessageIdRef.current = lastMessage.id;
              // Ensure we show full text for history
              setStreamingState(null); 
              return;
          }

          lastProcessedMessageIdRef.current = lastMessage.id;

          // New Message: Initialize state and stop previous
          if (intervalRef.current) clearInterval(intervalRef.current);
          
          startTimeRef.current = Date.now();
          pausedDurationRef.current = 0;
          activePauseEndTimeRef.current = 0;
          pauseStartTimeRef.current = 0;
          lastPunctuationIndexRef.current = -1;
          
          // Reset speed default
          charPerMsRef.current = 0.1;

          setStreamingState({ id: lastMessage.id, text: "" });

          const audioBase64 = (lastMessage as any).audio_base64;

          // Calculate speed based on audio duration if available
          if (audioBase64) {
             const audioSrc = audioBase64.startsWith("data:") 
                ? audioBase64 
                : `data:audio/mp3;base64,${audioBase64}`;
             
             // Trigger audio immediately
             handlePlayAudio(lastMessage.id, audioBase64);

             const tempAudio = new Audio(audioSrc);
             // Safety timeout
             const safetyTimeout = setTimeout(() => {
                 // Audio meta load timed out, start streaming with default speed
                 startStreaming(); 
             }, 1000);

             tempAudio.onloadedmetadata = () => {
                 clearTimeout(safetyTimeout);
                 const durationMs = tempAudio.duration * 1000;
                 if (durationMs > 0 && lastMessage.content.length > 0) {
                     let totalPauseTime = 0;
                     for (const char of lastMessage.content) {
                         if (PUNCTUATION_PAUSES[char]) totalPauseTime += PUNCTUATION_PAUSES[char];
                     }

                     const activeDuration = durationMs - totalPauseTime;
                     const safeDuration = activeDuration > (durationMs * 0.2) 
                        ? activeDuration 
                        : durationMs * 0.8; 

                     const speed = lastMessage.content.length / (safeDuration * 0.95);
                     charPerMsRef.current = speed;
                     console.log("Syncing TTS: Speed adjusted to", speed);
                 }
                 // Start streaming after speed calculation
                 startStreaming();
             };
             tempAudio.onerror = () => {
                 clearTimeout(safetyTimeout);
                 startStreaming();
             };
          } else {
             // No audio, just stream
             startStreaming();
          }

        } else if (streamingState?.id === lastMessage.id) {
          // Existing Message: If stopped (interval null) but text incomplete, resume ?
          // With new logic, safer to just let it run. 
          // If intervalRef is null and text < target, restart
          if (!intervalRef.current && streamingState.text.length < lastMessage.content.length) {
             const currentChars = streamingState.text.length;
             // Recover start time
             startTimeRef.current = Date.now() - (currentChars / charPerMsRef.current);
             pausedDurationRef.current = 0; 
             startStreaming();
          }
        }
      }
    }
  }, [chatHistory]); // Intentionally omitting streamingState to avoid loops

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        setIsTalking(false);
      }
    };
  }, []);

  // Set default character on mount
  useEffect(() => {
    if (defaultCharacter && !currentCharacter) {
      dispatch(setCurrentCharacter(defaultCharacter));
    }
  }, [defaultCharacter, currentCharacter, dispatch]);

  // Load chat history when character changes (only if user is logged in)
  useEffect(() => {
    if (currentCharacter && user) {
      dispatch(
        fetchChatHistory({
          characterId: currentCharacter.id,
          limit: 50,
        }),
      );
    }
  }, [currentCharacter, user, dispatch]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, streamingState]); // Scroll on stream update

  // Show error
  useEffect(() => {
    if (error) {
      antdMessage.error(error);
    }
  }, [error]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentCharacter || chatLoading) return;

    // Check if user is logged in
    if (!user) {
      antdMessage.warning("Vui lòng đăng nhập để sử dụng chat");
      return;
    }

    const messageText = inputMessage.trim();
    setInputMessage("");

    // Add user message optimistically
    dispatch(addUserMessage(messageText));

    // Send to backend
    try {
      await dispatch(
        sendChatMessage({
          character_id: currentCharacter.id,
          message: messageText,
          context,
        }),
      ).unwrap();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleClearHistory = async () => {
    if (!currentCharacter) return;

    // Check if user is logged in
    if (!user) {
      antdMessage.warning("Vui lòng đăng nhập để xóa lịch sử chat");
      return;
    }

    try {
      await dispatch(clearChatHistory(currentCharacter.id)).unwrap();
      antdMessage.success("Đã xóa lịch sử chat");
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const handlePlayAudio = async (messageId: number, audioBase64?: string) => {
    if (!audioBase64) {
      antdMessage.warning("Không có âm thanh cho tin nhắn này");
      return;
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (audioPlaying === messageId) {
      setAudioPlaying(null);
      return;
    }

    try {
      console.log("Playing audio for message", messageId, "Length:", audioBase64.length);
      
      // Check if base64 already has prefix
      const audioSrc = audioBase64.startsWith("data:") 
        ? audioBase64 
        : `data:audio/mp3;base64,${audioBase64}`;

      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.onended = () => {
        setAudioPlaying(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        antdMessage.error("Không thể phát audio");
        setAudioPlaying(null);
        audioRef.current = null;
      };

      setAudioPlaying(messageId);
      await audio.play();
    } catch (err) {
      console.error("Error playing audio:", err);
      antdMessage.error("Lỗi khi phát audio");
      setAudioPlaying(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!visible) return null;

  return (
    <div className={`ai-chat-panel ${isMinimized ? "minimized" : ""}`}>
      {/* Header */}
      <div className="ai-chat-panel__header">
        <Space>
          <CommentOutlined />
          <Text strong>
            {currentCharacter
              ? `Chat với ${currentCharacter.name}`
              : "AI Assistant"}
          </Text>
        </Space>
        <Space>
          <Tooltip title="Xóa lịch sử">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleClearHistory}
              disabled={chatHistory.length === 0}
            />
          </Tooltip>
          <Tooltip title={isMinimized ? "Mở rộng" : "Thu nhỏ"}>
            <Button
              type="text"
              size="small"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? "▲" : "▼"}
            </Button>
          </Tooltip>
          {onClose && (
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={onClose}
            />
          )}
        </Space>
      </div>

      {/* Messages */}
      <div className="ai-chat-panel__messages">
        {chatHistory.length === 0 ? (
          <div className="ai-chat-panel__empty">
            <Text type="secondary">
              Chào {user?.name || "bạn"}! Hãy bắt đầu cuộc trò chuyện 💬
            </Text>
          </div>
        ) : (
          chatHistory.map((msg) => {
            const isStreaming = streamingState && streamingState.id === msg.id;
            const displayText = isStreaming ? streamingState.text : msg.content;
            
            return (
            <div
              key={msg.id}
              className={`ai-chat-panel__message ${
                msg.role === "user" ? "user" : "assistant"
              }`}
            >
              <div className="ai-chat-panel__message-content">
                <div className="ai-chat-panel__message-name">
                  {msg.role === "assistant" ? currentCharacter?.name || "Sen" : "Bạn"}
                </div>
                <div className="ai-chat-panel__message-text">
                  {displayText}
                  {isStreaming && streamingState.text.length < msg.content.length && <span className="cursor">|</span>}
                </div>
                <div className="ai-chat-panel__message-meta">
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(msg.timestamp).toLocaleTimeString("vi-VN")}
                  </Text>
                  {msg.role === "assistant" && (msg as any).audio_base64 && (
                    <Button
                      type="text"
                      size="small"
                      icon={
                        audioPlaying === msg.id ? (
                          <PauseCircleOutlined />
                        ) : (
                          <SoundOutlined />
                        )
                      }
                      onClick={() =>
                        handlePlayAudio(msg.id, (msg as any).audio_base64)
                      }
                    />
                  )}
                </div>
              </div>
            </div>
            );
          })
        )}
        {isTyping && (
          <div className="ai-chat-panel__message assistant">
            <div className="ai-chat-panel__typing">
              <Spin size="small" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="ai-chat-panel__input">
        <TextArea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !user
              ? "Vui lòng đăng nhập để sử dụng chat..."
              : "Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
          }
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={chatLoading || !currentCharacter || !user}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          loading={chatLoading}
          disabled={!inputMessage.trim() || !currentCharacter || !user}
        >
          Gửi
        </Button>
      </div>
    </div>
  );
};

export default AIChatPanel;
