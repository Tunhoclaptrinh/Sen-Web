import React, { useState } from 'react';
import { FloatButton, Badge, Tooltip } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/store/hooks';
import AIChatPanel from '../AIChatPanel';
import type { AICharacter } from '@/services/ai.service';
import './styles.less';

interface AIChatFloatingButtonProps {
    defaultCharacter?: AICharacter;
    context?: {
        level_id?: number;
        artifact_id?: number;
        heritage_site_id?: number;
    };
}

const AIChatFloatingButton: React.FC<AIChatFloatingButtonProps> = ({
    defaultCharacter,
    context,
}) => {
    const [visible, setVisible] = useState(false);
    const { isTyping } = useAppSelector((state) => state.ai);

    // Count unread messages (messages after user last opened)
    const unreadCount = 0; // Can implement unread logic later

    return (
        <>
            <Tooltip title="Chat với AI Assistant" placement="left">
                <FloatButton
                    className="ai-chat-floating-button"
                    icon={
                        <Badge count={unreadCount} size="small" offset={[-5, 5]}>
                            <CommentOutlined
                                style={{
                                    fontSize: 20,
                                    color: visible ? '#fff' : '#f43f5e',
                                }}
                            />
                        </Badge>
                    }
                    type={visible ? 'primary' : 'default'}
                    style={{
                        right: 24,
                        bottom: 100,
                        width: 56,
                        height: 56,
                        zIndex: 9999,
                        background: visible
                            ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
                            : 'white',
                        border: visible ? 'none' : '2px solid #f43f5e',
                        boxShadow: visible
                            ? '0 4px 12px rgba(244, 63, 94, 0.4)'
                            : '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                    onClick={() => setVisible(!visible)}
                />
            </Tooltip>

            {isTyping && !visible && (
                <div className="ai-chat-typing-indicator">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
            )}

            <AIChatPanel
                visible={visible}
                onClose={() => setVisible(false)}
                defaultCharacter={defaultCharacter}
                context={context}
            />
        </>
    );
};

export default AIChatFloatingButton;
