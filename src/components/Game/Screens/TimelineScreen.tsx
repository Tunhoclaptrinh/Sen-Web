import React, { useState } from 'react';
import { Card, Button, Typography, message } from 'antd';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { ClockCircleOutlined, CheckOutlined } from '@ant-design/icons';
import type { TimelineScreen as TimelineScreenType } from '@/types/game.types';
import './styles.less';

const { Title, Paragraph, Text } = Typography;

interface Props {
    data: TimelineScreenType;
    onNext: () => void;
    onSubmit: (order: string[]) => Promise<{ isCorrect: boolean; correct_order?: string[] }>;
}

const TimelineScreen: React.FC<Props> = ({ data, onNext, onSubmit }) => {
    const [events, setEvents] = useState(data.events); // Init with shuffled events ideally, or just data.events
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || isCorrect) return;

        const items = Array.from(events);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setEvents(items);
    };

    const handleCheck = async () => {
        setSubmitting(true);
        const currentOrder = events.map(e => e.id);
        try {
            const result = await onSubmit(currentOrder);
            setIsCorrect(result.isCorrect);

            if (result.isCorrect) {
                message.success('Chính xác! Bạn đã sắp xếp đúng dòng lịch sử.');
            } else {
                message.error('Chưa chính xác. Hãy thử lại!');
                // Ideally backend returns correct order or hints, here we just let user retry
            }
        } catch (error) {
            message.error('Lỗi kiểm tra đáp án');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="timeline-screen" style={{ padding: 24, background: '#f0f2f5', height: '100%', overflowY: 'auto' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <Card title={<Title level={4}>Sắp xếp sự kiện theo trình tự thời gian</Title>}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="timeline">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="timeline-list"
                                >
                                    {events.map((event, index) => (
                                        <Draggable key={event.id} draggableId={event.id} index={index} isDragDisabled={!!isCorrect}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`timeline-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                                    style={{
                                                        userSelect: 'none',
                                                        padding: 16,
                                                        marginBottom: 12,
                                                        backgroundColor: isCorrect ? '#f6ffed' : 'white',
                                                        border: isCorrect ? '1px solid #b7eb8f' : '1px solid #d9d9d9',
                                                        borderRadius: 8,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 16,
                                                        ...provided.draggableProps.style
                                                    }}
                                                >
                                                    <div className="event-year" style={{ fontWeight: 'bold', minWidth: 60, color: '#1890ff' }}>
                                                        {isCorrect ? event.year : '????'}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <Text strong>{event.title}</Text>
                                                        <Paragraph type="secondary" style={{ margin: 0, fontSize: 13 }}>
                                                            {event.description}
                                                        </Paragraph>
                                                    </div>
                                                    <ClockCircleOutlined style={{ color: '#bfbfbf', fontSize: 20 }} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>

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
        </div>
    );
};

export default TimelineScreen;
