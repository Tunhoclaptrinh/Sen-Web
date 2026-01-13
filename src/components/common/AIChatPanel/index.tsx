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

  const [inputMessage, setInputMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<{
    id: number;
    text: string;
  } | null>(null);
  const lastStreamedIdRef = useRef<number | null>(null);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stream text character by character
  const streamText = (fullText: string, messageId: number) => {
    // Clear any existing interval
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }

    let index = 0;
    setStreamingMessage({ id: messageId, text: "" });
    lastStreamedIdRef.current = messageId;
    
    streamIntervalRef.current = setInterval(() => {
      if (index < fullText.length) {
        setStreamingMessage((prev) => ({
          id: messageId,
          text: prev ? prev.text + fullText[index] : fullText[index],
        }));
        index++;
      } else {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
        setStreamingMessage(null);
      }
    }, 30); // 30ms per character
  };

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
  }, [chatHistory, streamingMessage]);

  // Show error
  useEffect(() => {
    if (error) {
      antdMessage.error(error);
    }
  }, [error]);

  // Handle streaming when new AI message arrives
  useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (
        lastMessage.role === "assistant" &&
        lastMessage.content &&
        lastStreamedIdRef.current !== lastMessage.id
      ) {
        streamText(lastMessage.content, lastMessage.id);
      }
    }
  }, [chatHistory]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

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
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
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
            const isStreaming = streamingMessage && streamingMessage.id === msg.id;
            const displayText = isStreaming ? streamingMessage.text : msg.content;
            
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
                  {isStreaming && <span className="cursor">|</span>}
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
