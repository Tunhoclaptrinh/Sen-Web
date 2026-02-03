import React, { useState, useEffect } from "react";
import { Button, message } from "antd";
import { ViewModal } from "@/components/common";
import { 
    RedoOutlined, 
    StepForwardOutlined,
    FullscreenOutlined,
    SoundOutlined,
    MutedOutlined
} from "@ant-design/icons";
import { Screen, SCREEN_TYPES } from "@/types/game.types";
import { getImageUrl } from "@/utils/image.helper";
import AudioSettingsPopover from "@/components/Game/AudioSettingsPopover";

// Import actual Game Screens
import DialogueScreen from "@/components/Game/Screens/DialogueScreen";
import QuizScreen from "@/components/Game/Screens/QuizScreen";
import HiddenObjectScreen from "@/components/Game/Screens/HiddenObjectScreen";
import TimelineScreen from "@/components/Game/Screens/TimelineScreen";
import ImageViewerScreen from "@/components/Game/Screens/ImageViewerScreen";
import VideoScreen from "@/components/Game/Screens/VideoScreen";

// Styles (reuse game styles)
import "@/pages/Game/GamePlayPage/styles.less";

interface GameSimulatorProps {
    visible: boolean;
    onClose: () => void;
    screens: Screen[];
    initialScreenIndex?: number;
    title?: string;
    bgmUrl?: string; // New Prop
}

const GameSimulator: React.FC<GameSimulatorProps> = ({ 
    visible, 
    onClose, 
    screens, 
    initialScreenIndex = 0,
    title = "Chạy thử (Preview Mode)",
    bgmUrl
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialScreenIndex);
    const [score, setScore] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [bgmVolume, setBgmVolume] = useState(0.5);
    const [sfxVolume, setSfxVolume] = useState(1.0);
    const bgmAudioRef = React.useRef<HTMLAudioElement | null>(null);

    // BGM Logic
    useEffect(() => {
        if (!bgmUrl || !visible) {
             if (bgmAudioRef.current) {
                 bgmAudioRef.current.pause();
                 bgmAudioRef.current = null;
             }
             return;
        }

        const url = getImageUrl(bgmUrl);
        if (!bgmAudioRef.current) {
            bgmAudioRef.current = new Audio(url);
            bgmAudioRef.current.loop = true;
        } else if (bgmAudioRef.current.src !== url) {
             bgmAudioRef.current.src = url;
        }

        // Apply volume
        bgmAudioRef.current.volume = bgmVolume;

        if (visible && !isMuted) {
            bgmAudioRef.current.play().catch(e => console.warn("Preview Autoplay blocked:", e));
        } else {
            bgmAudioRef.current.pause();
        }

        return () => {
             if (bgmAudioRef.current) {
                 bgmAudioRef.current.pause();
             }
        };
    }, [bgmUrl, visible, isMuted, bgmVolume]);

    // Reset when opening
    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialScreenIndex);
            setScore(0);
        }
    }, [visible, initialScreenIndex]);

    const currentScreen = screens[currentIndex];

    // --- Mock Handlers ---

    const handleNext = () => {
        if (currentIndex < screens.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            message.success("Đã hoàn thành tất cả màn chơi trong bản xem trước!");
        }
    };

    const handleAnswerSubmit = async (answerId: string) => {
        const screen = currentScreen as any;
        // QuizScreen sends text as answerId (based on its implementation), so we must check text as well
        const option = screen.options?.find((o: any) => o.id === answerId) 
                    || screen.options?.find((o: any) => o._id === answerId)
                    || screen.options?.find((o: any) => o.text === answerId);
        
        if (option?.isCorrect) {
            message.success("Đúng rồi! (+Điểm)");
            setScore(prev => prev + 10);
            return { isCorrect: true, pointsEarned: 10, explanation: "Chính xác!" };
        } else {
             message.error("Sai rồi!");
             return { isCorrect: false, pointsEarned: 0, explanation: "Sai rồi, hãy thử lại!" };
        }
    };

    const handleTimelineSubmit = async (_order: string[]) => {
        // Mock validation: simple check if sorted by year
        // In real app, backend validates. Here we assume strict year ordering.
        message.info("Đã gửi thứ tự (Mock validation)");
        return { isCorrect: true, points_earned: 20 };
    };

    // Track collected items to return correct progress
    const [collectedItemsMap, setCollectedItemsMap] = useState<Record<string, string[]>>({});

    const handleCollectItem = async (itemId: string) => {
        const screen = currentScreen as any;
        const item = screen.items?.find((i: any) => i.id === itemId);
        
        if (!item) {
             return { 
                success: false, 
                pointsEarned: 0,
                item: { id: itemId, name: 'Unknown', factPopup: '' },
                progress: { collected: 0, required: 1, allCollected: false }
            };
        }

        // Update collected tracking
        const currentCollected = collectedItemsMap[screen.id] || [];
        const newCollected = currentCollected.includes(itemId) ? currentCollected : [...currentCollected, itemId];
        
        setCollectedItemsMap(prev => ({
            ...prev,
            [screen.id]: newCollected
        }));

        const required = screen.requiredItems || screen.items?.length || 0;
        const isAllCollected = newCollected.length >= required;

        if (!currentCollected.includes(itemId)) {
             setScore(prev => prev + 5);
             message.success("Đã tìm thấy vật phẩm!");
        }

        return { 
            success: true, 
            pointsEarned: 5,
            item: { 
                id: itemId, 
                name: item.name, 
                factPopup: item.factPopup || item.content || item.description || "Bạn đã tìm thấy một manh mối quan trọng!" 
            },
            progress: { 
                collected: newCollected.length, 
                required: required, 
                allCollected: isAllCollected 
            }
        };
    };

    // --- Render Logic ---

    const getEffectiveBackground = () => {
        if (!screens || screens.length === 0) return undefined;
        // Ensure start index is within bounds
        const start = Math.min(currentIndex, screens.length - 1);
        if (start < 0) return undefined;
        
        for (let i = start; i >= 0; i--) {
            if (screens[i]?.backgroundImage) {
                return screens[i].backgroundImage;
            }
        }
        return undefined;
    };

    const effectiveBg = getEffectiveBackground();

    const renderScreenContent = () => {
        if (!currentScreen) return <div style={{padding: 40, textAlign: 'center', color: 'white'}}>Không có dữ liệu màn chơi</div>;

        const commonProps = {
            onNext: handleNext,
        };

        // Helper to inject background if missing
        const screenWithBg = {
            ...currentScreen,
            backgroundImage: currentScreen.backgroundImage || effectiveBg
        };

        switch (currentScreen.type) {
            case SCREEN_TYPES.DIALOGUE:
                return <DialogueScreen data={screenWithBg as any} {...commonProps} />;
            case SCREEN_TYPES.QUIZ:
                return (
                    <QuizScreen
                        data={currentScreen as any}
                        {...commonProps}
                        onSubmitAnswer={handleAnswerSubmit}
                        fallbackImage={effectiveBg}
                    />
                );
            case SCREEN_TYPES.HIDDEN_OBJECT:
                return (
                    <HiddenObjectScreen
                        data={screenWithBg as any} // Hidden Object usually requires specific bg, but fallback doesn't hurt
                        {...commonProps}
                        onCollect={handleCollectItem}
                    />
                );
            case SCREEN_TYPES.TIMELINE:
                return (
                    <TimelineScreen
                        data={screenWithBg as any}
                        {...commonProps}
                        onSubmit={handleTimelineSubmit}
                    />
                );
            case SCREEN_TYPES.IMAGE_VIEWER:
                return <ImageViewerScreen data={screenWithBg as any} {...commonProps} />;
            case SCREEN_TYPES.VIDEO:
                return <VideoScreen data={screenWithBg as any} {...commonProps} />;
            default:
                return <div style={{color: 'white', padding: 20}}>Loại màn hình chưa hỗ trợ preview: {currentScreen.type}</div>;
        }
    };

    return (
        <ViewModal
            title={`${title} - Screen ${currentIndex + 1}/${screens.length}`}
            open={visible}
            onClose={onClose}
            width={1200}
            bodyStyle={{ padding: 0, height: '80vh', overflow: 'hidden', background: '#000' }}
            className="game-simulator-modal"
        >
            <div className="gameplay-page" style={{height: '100%', position: 'relative', margin: 0}}>
                {/* Simulator Controls Overlay */}
                <div style={{
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    zIndex: 9999, 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <div style={{ 
                        background: 'rgba(0,0,0,0.6)', 
                        color: '#ffc107', 
                        padding: '4px 12px', 
                        borderRadius: 20, 
                        fontSize: 13, 
                        fontWeight: 600,
                        border: '1px solid rgba(255,193,7,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginRight: 8
                    }}>
                        <span style={{ fontSize: 16 }}>💰</span>
                        <span>Điểm giả lập: {score}</span>
                    </div>

                    <Button 
                        size="small" 
                        icon={<RedoOutlined />} 
                        onClick={() => {
                            setCurrentIndex(initialScreenIndex);
                            setScore(0);
                        }}
                    >
                        Replay
                    </Button>
                    <Button 
                        size="small" 
                        type="primary" 
                        icon={<StepForwardOutlined />} 
                        onClick={handleNext}
                    >
                        Force Next
                    </Button>
                    <Button
                        size="small"
                        icon={<FullscreenOutlined />}
                        onClick={() => {
                            const elem = document.querySelector('.game-simulator-modal .ant-modal-content');
                            if (elem) {
                                if (!document.fullscreenElement) {
                                    elem.requestFullscreen().catch(err => {
                                        message.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                                    });
                                } else {
                                    document.exitFullscreen();
                                }
                            }
                        }}
                    />
                    
                     
                     <AudioSettingsPopover
                        isMuted={isMuted}
                        onMuteToggle={setIsMuted}
                        bgmVolume={bgmVolume}
                        onBgmVolumeChange={setBgmVolume}
                        sfxVolume={sfxVolume}
                        onSfxVolumeChange={setSfxVolume}
                     >
                         <Button
                            size="small"
                            icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
                            title="Cài đặt âm thanh"
                        />
                     </AudioSettingsPopover>
                </div>

                <div style={{
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    background: '#000'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '177.78vh', // 16:9 aspect ratio constraint based on height
                        height: '100%',
                        maxHeight: '56.25vw', // 16:9 aspect ratio constraint based on width
                        aspectRatio: '16/9',
                        position: 'relative',
                        background: '#fff', // Or game bg color
                        overflow: 'hidden',
                        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                    }}>
                        {renderScreenContent()}
                    </div>
                </div>
            </div>
        </ViewModal>
    );
};

export default GameSimulator;
