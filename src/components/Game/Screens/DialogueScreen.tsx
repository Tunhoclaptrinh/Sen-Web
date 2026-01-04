import React, { useState } from 'react';
import { Card, Button, Avatar, Typography, Space } from 'antd';
import { StepForwardOutlined, UserOutlined } from '@ant-design/icons';
import type { DialogueScreen as DialogueScreenType } from '@/types/game.types';
import './styles.less';

const { Text, Paragraph } = Typography;

interface Props {
    data: DialogueScreenType;
    onNext: () => void;
}

const DialogueScreen: React.FC<Props> = ({ data, onNext }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const currentDialogue = data.content?.[currentIndex];

    React.useEffect(() => {
        if (currentDialogue) {
            setDisplayedText('');
            setIsTyping(true);
            let index = 0;
            const text = currentDialogue.text;

            const timer = setInterval(() => {
                setDisplayedText(text.slice(0, index + 1));
                index++;
                if (index >= text.length) {
                    clearInterval(timer);
                    setIsTyping(false);
                }
            }, 30); // Speed: 30ms per char

            return () => clearInterval(timer);
        }
    }, [currentIndex, currentDialogue]);

    const handleNextDialogue = () => {
        if (isTyping) {
            // Finish typing immediately
            setDisplayedText(currentDialogue?.text || '');
            setIsTyping(false);
            return;
        }

        if (currentIndex < (data.content?.length || 0) - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onNext();
        }
    };

    if (!currentDialogue) return null;

    return (
        <div className="dialogue-screen">
            <div
                className="dialogue-background"
                style={{ backgroundImage: `url(${data.background_image || 'https://via.placeholder.com/1200x600?text=Background'})` }}
            />

            <div className="dialogue-content">
                <Card className="dialogue-box" onClick={handleNextDialogue} hoverable={false}>
                    <div className="dialogue-header">
                        <Space align="center" size="middle">
                            <Avatar
                                size={64}
                                src={currentDialogue.avatar || (currentDialogue.speaker === 'USER' ? undefined : 'https://api.dicebear.com/7.x/bottts/svg?seed=SenBot')}
                                icon={<UserOutlined />}
                                className="character-avatar"
                                style={{ backgroundColor: currentDialogue.speaker === 'USER' ? '#1890ff' : '#ffc107' }}
                            />
                            <div className="character-info">
                                <Text strong className="character-name" style={{ fontSize: 18, color: '#1f1f1f' }}>
                                    {currentDialogue.speaker === 'USER' ? 'Bạn' : (currentDialogue.speaker === 'AI' ? 'Trợ lý Sen' : currentDialogue.speaker)}
                                </Text>
                            </div>
                        </Space>
                    </div>

                    <div className="dialogue-body">
                        <Paragraph className="dialogue-text" style={{ fontSize: 16, minHeight: 60 }}>
                            {displayedText}
                            {isTyping && <span className="typing-cursor">|</span>}
                        </Paragraph>
                    </div>

                    <div className="dialogue-actions">
                        <Button
                            type="primary"
                            size="large"
                            icon={<StepForwardOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNextDialogue();
                            }}
                        >
                            {isTyping ? 'Bỏ qua hiệu ứng' : (currentIndex < (data.content?.length || 0) - 1 ? 'Tiếp tục' : 'Hoàn thành')}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DialogueScreen;
