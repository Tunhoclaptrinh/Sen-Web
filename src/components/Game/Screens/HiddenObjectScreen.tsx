import React, { useState, useEffect } from 'react';
import { Card, Typography, message, Modal, Button, List, Progress } from 'antd';
import { CheckCircleFilled, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { HiddenObjectScreen as HiddenObjectScreenType } from '@/types/game.types';
import './styles.less';

const { Title, Text } = Typography;

interface HiddenItem {
    id: string;
    name: string;
    fact_popup: string;
}

// Transform backend data to frontend format
const transformItems = (rawItems: any[]): HiddenItem[] => {
    if (!rawItems || !Array.isArray(rawItems)) return [];
    
    return rawItems.map(item => ({
        id: item.id,
        name: item.name,
        fact_popup: item.fact_popup || item.content || item.description || 'Thông tin thú vị!',
    }));
};

interface HiddenObjectScreenProps {
    data: HiddenObjectScreenType;
    onNext: () => void;
    onCollect: (itemId: string) => Promise<{
        item: { id: string; name: string; fact_popup: string };
        progress: { collected: number; required: number; all_collected: boolean };
    }>;
}

const HiddenObjectScreen: React.FC<HiddenObjectScreenProps> = ({ data, onNext, onCollect }) => {
    const items: HiddenItem[] = transformItems(data.items);
    const requiredItems = data.required_items || items.length;
    
    const [foundItems, setFoundItems] = useState<string[]>([]);
    const [progress, setProgress] = useState({ collected: 0, required: requiredItems });
    const [loading, setLoading] = useState<string | null>(null);

    // Reset state when data changes
    useEffect(() => {
        setFoundItems([]);
        setProgress({ collected: 0, required: data.required_items || data.items?.length || 0 });
    }, [data]);

    const handleItemClick = async (item: HiddenItem) => {
        if (foundItems.includes(item.id) || loading) return;

        setLoading(item.id);
        try {
            const result = await onCollect(item.id);

            setFoundItems(prev => [...prev, item.id]);
            setProgress(result.progress);

            Modal.success({
                title: `🎉 Tìm thấy: ${result.item.name}`,
                content: <p>{result.item.fact_popup}</p>,
                okText: 'OK',
                onOk: () => {
                    if (result.progress.all_collected) {
                        Modal.success({
                            title: '🏆 Hoàn thành!',
                            content: 'Bạn đã tìm thấy tất cả!',
                            onOk: onNext,
                            okText: 'Tiếp tục'
                        });
                    }
                }
            });
        } catch (error) {
            message.error('Có lỗi xảy ra');
        } finally {
            setLoading(null);
        }
    };

    // No items - show error
    if (!items || items.length === 0) {
        return (
            <Card style={{ margin: 20, textAlign: 'center' }}>
                <Title level={4}>Không có dữ liệu</Title>
                <Button type="primary" onClick={onNext}>Bỏ qua</Button>
            </Card>
        );
    }

    return (
        <div style={{ padding: 20 }}>
            {/* Progress */}
            <Card size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>
                        <EyeOutlined /> Tìm vật phẩm: {progress.collected}/{progress.required}
                    </Text>
                    <Progress 
                        percent={Math.round((progress.collected / progress.required) * 100)} 
                        size="small" 
                        style={{ width: 120 }} 
                    />
                </div>
            </Card>

            {/* Simple list of items to find */}
            <Card title="Click vào vật phẩm để tìm:" style={{ marginBottom: 16 }}>
                <List
                    grid={{ gutter: 16, column: 2 }}
                    dataSource={items}
                    renderItem={(item) => {
                        const isFound = foundItems.includes(item.id);
                        const isLoading = loading === item.id;
                        
                        return (
                            <List.Item>
                                <Button
                                    block
                                    size="large"
                                    type={isFound ? 'primary' : 'default'}
                                    icon={isFound ? <CheckCircleFilled /> : <SearchOutlined />}
                                    disabled={isFound}
                                    loading={isLoading}
                                    onClick={() => handleItemClick(item)}
                                    style={{ 
                                        height: 60,
                                        background: isFound ? '#52c41a' : undefined,
                                        borderColor: isFound ? '#52c41a' : undefined,
                                    }}
                                >
                                    {isFound ? item.name : '???'}
                                </Button>
                            </List.Item>
                        );
                    }}
                />
            </Card>

            {/* Description */}
            {data.description && (
                <Card size="small">
                    <Text type="secondary">{data.description}</Text>
                </Card>
            )}
        </div>
    );
};

export default HiddenObjectScreen;
