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
    width: number; // Percentage
    height: number; // Percentage
    factPopup: string;
}

// Transform backend data to frontend format
const transformItems = (rawItems: any[]): HiddenItem[] => {
    if (!rawItems || !Array.isArray(rawItems)) return [];
    
    return rawItems.map(item => ({
        id: item.id,
        name: item.name,
        x: item.coordinates?.x || item.x || 0,
        y: item.coordinates?.y || item.y || 0,
        width: item.coordinates?.width || item.width || 10,
        height: item.coordinates?.height || item.height || 10,
        factPopup: item.factPopup || item.content || item.description || 'Thông tin thú vị!',
    }));
};

interface HiddenObjectScreenProps {
    data: HiddenObjectScreenType;
    onNext: () => void;
    onCollect: (itemId: string) => Promise<{
        item: { id: string; name: string; factPopup: string };
        progress: { collected: number; required: number; allCollected: boolean };
    }>;
}

const HiddenObjectScreen: React.FC<HiddenObjectScreenProps> = ({ data, onNext, onCollect }) => {
    const items: HiddenItem[] = transformItems(data.items);
    const requiredItems = data.requiredItems || items.length;
    
    const [foundItems, setFoundItems] = useState<string[]>([]);
    const [progress, setProgress] = useState({ collected: 0, required: requiredItems });
    const [loading, setLoading] = useState<string | null>(null);
    const [missMarkers, setMissMarkers] = useState<{x: number, y: number, id: number}[]>([]);
    
    const sceneRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Reset state when data changes
    useEffect(() => {
        setFoundItems([]);
        setProgress({ collected: 0, required: data.requiredItems || data.items?.length || 0 });
    }, [data]);

    const handleSceneClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current || loading) return;

        // Get rect of the ACTUAL IMAGE element for precise coordinates
        const rect = imageRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        // Calculate click percentage relative to valid image area
        const xPercent = ((clientX - rect.left) / rect.width) * 100;
        const yPercent = ((clientY - rect.top) / rect.height) * 100;

        // Check for hits (Rectangular Collision)
        let hitItem: HiddenItem | null = null;
        const candidates = items.filter(item => !foundItems.includes(item.id));
        
        for (const item of candidates) {
            // Check bounding box
            const isHitX = xPercent >= item.x && xPercent <= (item.x + item.width);
            const isHitY = yPercent >= item.y && yPercent <= (item.y + item.height);

            if (isHitX && isHitY) {
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
                content: <p>{result.item.factPopup}</p>,
                okText: 'Tuyệt vời',
                onOk: () => {
                    if (result.progress.allCollected) {
                        // Play success sound or delay?
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
                        ref={imageRef}
                        src={getImageUrl(data.backgroundImage)} 
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
                                    width: `${item.width}%`, 
                                    height: `${item.height}%`,
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
