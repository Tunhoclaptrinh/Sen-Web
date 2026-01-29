import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, message, Modal, Button } from 'antd';
import { CheckCircleFilled, SearchOutlined } from '@ant-design/icons';
import type { HiddenObjectScreen as HiddenObjectScreenType } from '@/types/game.types';
import './styles.less';
import { getImageUrl } from '@/utils/image.helper';

const { Title } = Typography;

interface HiddenItem {
    id: string;
    name: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    radius: number; // Percentage
    fact_popup: string;
}

// Transform backend data to frontend format
const transformItems = (rawItems: any[]): HiddenItem[] => {
    if (!rawItems || !Array.isArray(rawItems)) return [];
    
    return rawItems.map(item => ({
        id: item.id,
        name: item.name,
        x: item.x || 0,
        y: item.y || 0,
        radius: item.radius || 6, // Default radius 6%
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
    const [missMarkers, setMissMarkers] = useState<{x: number, y: number, id: number}[]>([]);
    
    const sceneRef = useRef<HTMLDivElement>(null);

    // Reset state when data changes
    useEffect(() => {
        setFoundItems([]);
        setProgress({ collected: 0, required: data.required_items || data.items?.length || 0 });
    }, [data]);

    const handleSceneClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        if (!sceneRef.current || loading) return;

        const rect = sceneRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        // Calculate click percentage
        const xPercent = ((clientX - rect.left) / rect.width) * 100;
        const yPercent = ((clientY - rect.top) / rect.height) * 100;

        // Check for hits
        let hitItem: HiddenItem | null = null;
        const candidates = items.filter(item => !foundItems.includes(item.id));
        
        for (const item of candidates) {
            // Re-calculate distance in pixels for accuracy relative to current aspect
            const itemX = (item.x / 100) * rect.width;
            const itemY = (item.y / 100) * rect.height;
            const clickX = clientX - rect.left;
            const clickY = clientY - rect.top;
            
            const dist = Math.sqrt(Math.pow(clickX - itemX, 2) + Math.pow(clickY - itemY, 2));
            const radiusPx = (item.radius / 100) * rect.width;

            if (dist <= radiusPx) {
                hitItem = item;
                break; 
            }
        }

        if (hitItem) {
            handleItemFound(hitItem);
        } else {
            // Miss
            const id = Date.now();
            setMissMarkers(prev => [...prev, { x: xPercent, y: yPercent, id }]);
            setTimeout(() => {
                setMissMarkers(prev => prev.filter(m => m.id !== id));
            }, 800); 
        }
    };

    const handleItemFound = async (item: HiddenItem) => {
        setLoading(item.id);
        try {
            const result = await onCollect(item.id);

            setFoundItems(prev => [...prev, item.id]);
            setProgress(result.progress);

            Modal.success({
                title: `🎉 Bạn đã tìm thấy: ${result.item.name}`,
                content: <p>{result.item.fact_popup}</p>,
                okText: 'Tuyệt vời',
                onOk: () => {
                    if (result.progress.all_collected) {
                         Modal.success({
                            title: '🏆 Màn chơi hoàn thành!',
                            content: 'Bạn đã tìm thấy tất cả các vật phẩm bí ẩn.',
                            onOk: onNext,
                            okText: 'Tiếp tục hành trình'
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

    if (!items || items.length === 0) {
        return (
            <Card style={{ margin: 20, textAlign: 'center' }}>
                <Title level={4}>Dữ liệu không hợp lệ</Title>
                <Button type="primary" onClick={onNext}>Bỏ qua</Button>
            </Card>
        );
    }

    return (
        <div className="hidden-object-screen">
            {/* Main Interactive Scene */}
            <div className="scene-container">
                <div className="interactive-area" ref={sceneRef} onClick={handleSceneClick}>
                     <img 
                        src={getImageUrl(data.background_image)} 
                        alt="Hidden Scene" 
                        className="game-scene-image"
                        draggable={false}
                        onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/800x600?text=Image+Load+Error";
                        }}
                     />

                     {/* Found Markers */}
                     {items.map(item => (
                         foundItems.includes(item.id) && (
                             <div 
                                key={item.id}
                                className="found-marker"
                                style={{
                                    left: `${item.x}%`,
                                    top: `${item.y}%`,
                                    width: `${item.radius * 2}%`, 
                                    aspectRatio: '1/1',
                                }}
                             />
                         )
                     ))}

                     {/* Miss Markers */}
                     {missMarkers.map(marker => (
                         <div 
                            key={marker.id}
                            className="miss-marker"
                            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                         />
                     ))}
                </div>
            </div>

            {/* HUD */}
            <div className="hidden-object-hud">
                <div className="hud-info">
                     <span className="label"><SearchOutlined /> Tìm vật phẩm</span>
                     <span className="count">
                         {progress.collected} / {progress.required}
                     </span>
                </div>

                <div className="items-list">
                    {items.map(item => {
                        const isFound = foundItems.includes(item.id);
                        return (
                            <div key={item.id} className={`target-item ${isFound ? 'found' : ''}`}>
                                {isFound ? <CheckCircleFilled /> : <SearchOutlined />}
                                <span>{item.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HiddenObjectScreen;
