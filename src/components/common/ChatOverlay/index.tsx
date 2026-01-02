import React, { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { CaretDownOutlined } from '@ant-design/icons';
import './styles.less';

const ChatOverlay: React.FC = () => {
    const { currentMessage, isOpen, nextMessage } = useChat();
    const [displayedText, setDisplayedText] = useState('');

    // Typewriter effect
    useEffect(() => {
        if (currentMessage) {
            setDisplayedText('');
            let index = 0;
            const text = currentMessage.text;

            const timer = setInterval(() => {
                if (index < text.length) {
                    setDisplayedText((prev) => prev + text.charAt(index));
                    index++;
                } else {
                    clearInterval(timer);
                }
            }, 30); // 30ms per char

            return () => clearInterval(timer);
        }
    }, [currentMessage]);

    if (!isOpen || !currentMessage) return null;

    return (
        <div className="chat-overlay" onClick={nextMessage}>
            {currentMessage.avatar && (
                <div className="chat-overlay__avatar">
                    <img src={currentMessage.avatar} alt={currentMessage.speaker} />
                </div>
            )}

            <div className="chat-overlay__content">
                <div className="chat-overlay__speaker">{currentMessage.speaker}</div>
                <div className="chat-overlay__text">{displayedText}</div>
            </div>

            <div className="chat-overlay__next-btn">
                <CaretDownOutlined />
            </div>
        </div>
    );
};

export default ChatOverlay;
