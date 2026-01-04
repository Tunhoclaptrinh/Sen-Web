import React, { useState } from 'react';
import { Card, Typography, message, Modal, Tooltip, Progress } from 'antd';
import { SearchOutlined, CheckCircleFilled } from '@ant-design/icons';
import type { HiddenObjectScreen as HiddenObjectScreenType } from '@/types/game.types';
import './styles.less';

const { Text } = Typography;

interface HiddenObjectScreenProps {
    data: HiddenObjectScreenType;
    onNext: () => void;
    onCollect: (itemId: string) => Promise<{
        item: { id: string; name: string; fact_popup: string };
        progress: { collected: number; required: number; all_collected: boolean };
    }>;
}

const HiddenObjectScreen: React.FC<HiddenObjectScreenProps> = ({ data, onNext, onCollect }) => {
    const [foundItems, setFoundItems] = useState<string[]>([]);
    const [progress, setProgress] = useState({ collected: 0, required: data.required_items });
    const handleItemClick = async (item: { id: string; name: string; fact_popup: string }) => {
        if (foundItems.includes(item.id)) return;

        try {
            const result = await onCollect(item.id);

            setFoundItems(prev => [...prev, item.id]);
            setProgress(result.progress);

            // Show Fact Popup
            Modal.info({
                title: `Bạn đã tìm thấy: ${result.item.name}`,
                content: (
                    <div>
                        <div style={{ textAlign: 'center', marginBottom: 12 }}>
                            <CheckCircleFilled style={{ fontSize: 40, color: '#52c41a' }} />
                        </div>
                        <p>{result.item.fact_popup}</p>
                    </div>
                ),
                okText: 'Tuyệt vời',
                onOk: () => {
                    if (result.progress.all_collected) {
                        Modal.success({
                            title: 'Hoàn thành màn chơi!',
                            content: 'Bạn đã tìm thấy tất cả các vật phẩm yêu cầu.',
                            onOk: onNext,
                            okText: 'Tiếp tục'
                        });
                    }
                }
            });

        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    return (
        <div className="hidden-object-screen">
            <div className="hidden-object-header">
                <Card size="small" className="status-bar">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong>Tìm vật phẩm: {progress.collected}/{progress.required}</Text>
                        <Progress
                            percent={Math.round((progress.collected / progress.required) * 100)}
                            size="small"
                            style={{ width: 150 }}
                        />
                    </div>

                    <div className="items-list" style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        {data.items.slice(0, data.required_items).map((item, idx) => (
                            <Tooltip key={idx} title={foundItems.includes(item.id) ? item.name : '???'}>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: foundItems.includes(item.id) ? '#52c41a' : '#d9d9d9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}
                                >
                                    {foundItems.includes(item.id) ? <CheckCircleFilled /> : <SearchOutlined />}
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                </Card>
            </div>

            <div
                className="hidden-object-container"
                style={{
                    backgroundImage: `url(${data.background_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '600px', // Fixed height for coordinate wrapper
                    position: 'relative'
                }}
            >
                {data.items.map((item) => (
                    <div
                        key={item.id}
                        className={`hidden-item ${foundItems.includes(item.id) ? 'found' : ''}`}
                        style={{
                            left: `${item.x}%`, // Logic coordinates 0-100%
                            top: `${item.y}%`,
                        }}
                        onClick={() => handleItemClick({ id: item.id, name: item.name, fact_popup: item.fact_popup })}
                    >
                        {/* Invisible click area unless debugging */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HiddenObjectScreen;
