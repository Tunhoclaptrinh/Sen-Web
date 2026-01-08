import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, message, List } from 'antd';
import { ClockCircleOutlined, CheckOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { TimelineScreen as TimelineScreenType } from '@/types/game.types';
import './styles.less';

const { Title, Text } = Typography;

interface Props {
    data: TimelineScreenType;
    onNext: () => void;
    onSubmit: (order: string[]) => Promise<{ isCorrect: boolean; correct_order?: string[] }>;
}

// Transform events from any data format
const transformEvents = (data: TimelineScreenType) => {
    if (data.events && Array.isArray(data.events) && data.events.length > 0) {
        return data.events;
    }
    return [];
};

const TimelineScreen: React.FC<Props> = ({ data, onNext, onSubmit }) => {
    const [events, setEvents] = useState(() => transformEvents(data));
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Reset state when data changes
    useEffect(() => {
        setEvents(transformEvents(data));
        setIsCorrect(null);
        setSubmitting(false);
    }, [data]);

    // Move item up/down in list
    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (isCorrect) return;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= events.length) return;
        
        const items = [...events];
        [items[index], items[newIndex]] = [items[newIndex], items[index]];
        setEvents(items);
    };

    const handleCheck = async () => {
        if (events.length === 0) {
            message.warning('Không có sự kiện để kiểm tra');
            return;
        }
        setSubmitting(true);
        const currentOrder = events.map(e => e.id);
        try {
            const result = await onSubmit(currentOrder);
            setIsCorrect(result.isCorrect);

            if (result.isCorrect) {
                message.success('Chính xác! Bạn đã sắp xếp đúng dòng lịch sử.');
            } else {
                message.error('Chưa chính xác. Hãy thử lại!');
            }
        } catch (error) {
            message.error('Lỗi kiểm tra đáp án');
        } finally {
            setSubmitting(false);
        }
    };

    if (events.length === 0) {
        return (
            <div style={{ padding: 24, textAlign: 'center' }}>
                <Card>
                    <Title level={4}>Timeline</Title>
                    <Text type="secondary">No events available</Text>
                    <div style={{ marginTop: 16 }}>
                        <Button type="primary" onClick={onNext}>Continue</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100%' }}>
            <Card title={<Title level={4}><ClockCircleOutlined /> Sắp xếp sự kiện theo thời gian</Title>}>
                <List
                    dataSource={events}
                    renderItem={(event, index) => (
                        <List.Item
                            style={{
                                background: isCorrect ? '#f6ffed' : 'white',
                                marginBottom: 8,
                                borderRadius: 8,
                                padding: '12px 16px'
                            }}
                            actions={!isCorrect ? [
                                <Button 
                                    key="up"
                                    icon={<ArrowUpOutlined />} 
                                    disabled={index === 0}
                                    onClick={() => moveItem(index, 'up')}
                                />,
                                <Button 
                                    key="down"
                                    icon={<ArrowDownOutlined />} 
                                    disabled={index === events.length - 1}
                                    onClick={() => moveItem(index, 'down')}
                                />
                            ] : []}
                        >
                            <List.Item.Meta
                                avatar={
                                    <div style={{ 
                                        fontWeight: 'bold', 
                                        color: '#1890ff',
                                        fontSize: 16,
                                        minWidth: 50
                                    }}>
                                        {isCorrect ? event.year : '????'}
                                    </div>
                                }
                                title={event.title}
                                description={event.description}
                            />
                        </List.Item>
                    )}
                />

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    {isCorrect ? (
                        <Button type="primary" size="large" onClick={onNext} icon={<CheckOutlined />}>
                            Tiếp tục
                        </Button>
                    ) : (
                        <Button type="primary" size="large" onClick={handleCheck} loading={submitting}>
                            Kiểm tra kết quả
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default TimelineScreen;
