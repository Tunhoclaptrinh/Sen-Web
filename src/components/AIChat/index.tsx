import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Spin } from "antd";
import { SendOutlined } from "@ant-design/icons";
import axios from "axios";
import "./styles.less";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Xin chào! Mình là trợ lý Sen. Mình sẽ hướng dẫn bạn khám phá di sản văn hóa Việt Nam! 🌸",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingText, setStreamingText] = useState("");
  const userName = "Bạn";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Hiệu ứng streaming - hiện từng chữ
  const streamText = (fullText: string, messageId: string) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setStreamingText((prev) => prev + fullText[index]);
        index++;
      } else {
        clearInterval(interval);
        // Khi stream xong, cập nhật message chính thức
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: fullText, isStreaming: false }
              : msg,
          ),
        );
        setStreamingText("");
        setLoading(false);
      }
    }, 30); // 30ms mỗi ký tự
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/ai/chat`,
        { message: userMessage.content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Bắt đầu streaming text
      const fullResponse =
        response.data.data.message ||
        "Xin lỗi, mình không thể trả lời câu hỏi này.";
      streamText(fullResponse, aiMessage.id);
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">
              <div className="message-name">
                {message.role === "assistant" ? "Sen" : userName}
              </div>
              <div className="message-bubble">
                {message.isStreaming ? streamingText : message.content}
                {message.isStreaming && <span className="cursor">|</span>}
              </div>
            </div>
          </div>
        ))}
        {loading && !streamingText && (
          <div className="message assistant">
            <div className="message-content">
              <div className="message-name">Sen</div>
              <div className="message-bubble">
                <Spin size="small" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <Input
          placeholder="Hỏi về di sản văn hóa Việt Nam..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
          disabled={loading}
          suffix={
            <Button
              type="text"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{ color: "#1f5f25" }}
            />
          }
        />
      </div>
    </div>
  );
};

export default AIChat;
