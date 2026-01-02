import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
    id: string;
    speaker: string;
    text: string;
    avatar?: string; // URL or 'sen-chibi'
    mood?: string;
    choices?: { label: string; value: string }[];
    onChoice?: (value: string) => void;
}

interface ChatContextType {
    messages: ChatMessage[];
    currentMessage: ChatMessage | null;
    isOpen: boolean;
    isTyping: boolean;

    // Actions
    addMessage: (msg: Omit<ChatMessage, 'id'>) => void;
    setIsOpen: (open: boolean) => void;
    nextMessage: () => void;
    clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [queue, setQueue] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState<ChatMessage | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const addMessage = (msg: Omit<ChatMessage, 'id'>) => {
        const newMsg = { ...msg, id: Date.now().toString() + Math.random() };
        setQueue((prev) => [...prev, newMsg]);

        // Auto open if closed
        if (!isOpen) setIsOpen(true);

        // If infinite idle, auto play next? (Implementation choice: manual next for now)
    };

    const nextMessage = () => {
        if (queue.length > 0) {
            const [next, ...rest] = queue;
            setCurrentMessage(next);
            setQueue(rest);
            setIsTyping(true);
        } else {
            setCurrentMessage(null);
            setIsOpen(false);
        }
    };

    // Auto trigger first message if queue has items and no current message
    React.useEffect(() => {
        if (isOpen && !currentMessage && queue.length > 0) {
            nextMessage();
        }
    }, [isOpen, currentMessage, queue]);

    const clearMessages = () => {
        setQueue([]);
        setCurrentMessage(null);
        setIsOpen(false);
    };

    return (
        <ChatContext.Provider
            value={{
                messages: queue,
                currentMessage,
                isOpen,
                isTyping,
                addMessage,
                setIsOpen,
                nextMessage,
                clearMessages,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
