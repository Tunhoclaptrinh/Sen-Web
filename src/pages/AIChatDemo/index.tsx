import React from 'react';
import { Typography, Card, Space, Divider } from 'antd';
import type { AICharacter } from '@/services/ai.service';

const { Title, Paragraph, Text } = Typography;

const AIChatDemoPage: React.FC = () => {
    // Mock character (in real app, fetch from API)
    const defaultCharacter: AICharacter = {
        id: 1,
        name: 'Minh',
        avatar: '/images/characters/minh-avatar.png',
        personality: 'Thân thiện, nhiệt tình, giàu kiến thức về văn hóa Việt Nam',
        state: 'restored',
        description: 'Hướng dẫn viên AI chuyên gia về di sản văn hóa Việt Nam',
    };

    return (
        <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Title level={2}>🤖 AI Chat Assistant Demo</Title>
                    <Paragraph>
                        Đây là trang demo tính năng chat với AI Assistant (Minh) - người hướng dẫn
                        ảo về văn hóa Việt Nam.
                    </Paragraph>
                </div>

                <Card title="✨ Tính năng">
                    <Space direction="vertical" size="small">
                        <Text>
                            <strong>✓</strong> Chat real-time với AI sử dụng RAG (Retrieval-Augmented
                            Generation)
                        </Text>
                        <Text>
                            <strong>✓</strong> Vector Search qua MongoDB Atlas
                        </Text>
                        <Text>
                            <strong>✓</strong> Semantic Routing tự động phân loại câu hỏi
                        </Text>
                        <Text>
                            <strong>✓</strong> Query Reflection hiểu ngữ cảnh conversation
                        </Text>
                        <Text>
                            <strong>✓</strong> Text-to-Speech (gTTS) tự động sinh audio
                        </Text>
                        <Text>
                            <strong>✓</strong> Lưu lịch sử chat vào database
                        </Text>
                    </Space>
                </Card>

                <Card title="🎯 Cách sử dụng">
                    <Space direction="vertical" size="middle">
                        <div>
                            <Text strong>Bước 1:</Text> Click vào icon chat ở góc dưới bên phải
                        </div>
                        <div>
                            <Text strong>Bước 2:</Text> Nhập câu hỏi về văn hóa Việt Nam
                        </div>
                        <div>
                            <Text strong>Bước 3:</Text> Nhận câu trả lời từ AI với âm thanh (nếu có)
                        </div>
                        <div>
                            <Text strong>Mẹo:</Text> Nhấn <kbd>Enter</kbd> để gửi,{' '}
                            <kbd>Shift + Enter</kbd> để xuống dòng
                        </div>
                    </Space>
                </Card>

                <Card title="💡 Câu hỏi gợi ý">
                    <Space direction="vertical" size="small">
                        <Text>• "Múa rối nước có lịch sử như thế nào?"</Text>
                        <Text>• "Hoàng thành Thăng Long được xây dựng khi nào?"</Text>
                        <Text>• "Chú Tễu trong múa rối nước là ai?"</Text>
                        <Text>• "Kể cho tôi nghe về lịch sử Hoàng thành"</Text>
                        <Text>• "Di sản văn hóa Việt Nam có gì đặc biệt?"</Text>
                    </Space>
                </Card>

                <Divider />

                <Card title="🔧 Kiến trúc kỹ thuật" type="inner">
                    <Paragraph>
                        <Text strong>Frontend:</Text> React + TypeScript + Redux Toolkit + Ant Design
                    </Paragraph>
                    <Paragraph>
                        <Text strong>Backend:</Text> Node.js Express API
                    </Paragraph>
                    <Paragraph>
                        <Text strong>AI Service:</Text> Python FastAPI + OpenAI GPT-4o-mini
                    </Paragraph>
                    <Paragraph>
                        <Text strong>Database:</Text> MongoDB Atlas Vector Search
                    </Paragraph>
                    <Paragraph>
                        <Text strong>TTS:</Text> Google Text-to-Speech (gTTS)
                    </Paragraph>
                </Card>

                <Card title="📊 Flow" type="inner">
                    <Paragraph>
                        <Text code>User Input</Text> → <Text code>Frontend Redux</Text> →{' '}
                        <Text code>Backend API (/api/ai/chat)</Text> →{' '}
                        <Text code>Python FastAPI (:8000/process_query)</Text> →{' '}
                        <Text code>RAG Pipeline</Text> →{' '}
                        <Text code>MongoDB Vector Search</Text> →{' '}
                        <Text code>GPT-4o-mini</Text> → <Text code>gTTS Audio</Text> →{' '}
                        <Text code>Response</Text>
                    </Paragraph>
                </Card>
            </Space>

            {/* Chat button is now in QuickActionButtons */}
        </div>
    );
};

export default AIChatDemoPage;
