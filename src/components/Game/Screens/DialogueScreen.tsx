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
    const currentDialogue = data.content?.[currentIndex];

    const handleNextDialogue = () => {
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
                <Card className="dialogue-box">
                    <div className="dialogue-header">
                        <Space align="center" size="middle">
                            <Avatar
                                size={64}
                                src={currentDialogue.avatar}
                                icon={<UserOutlined />}
                                className="character-avatar"
                            />
                            <div className="character-info">
                                <Text strong className="character-name">
                                    {currentDialogue.speaker === 'USER' ? 'Bạn' : currentDialogue.speaker}
                                </Text>
                            </div>
                        </Space>
                    </div>

                    <div className="dialogue-body">
                        <Paragraph className="dialogue-text">
                            {currentDialogue.text}
                        </Paragraph>
                    </div>

                    <div className="dialogue-actions">
                        <Button
                            type="primary"
                            size="large"
                            icon={<StepForwardOutlined />}
                            onClick={handleNextDialogue}
                        >
                            {currentIndex < (data.content?.length || 0) - 1 ? 'Tiếp tục' : 'Hoàn thành'}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DialogueScreen;
