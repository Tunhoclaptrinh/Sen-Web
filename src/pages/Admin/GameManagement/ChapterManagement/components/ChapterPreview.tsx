import React, { useState, useEffect } from "react";
import { Radio, Spin, Empty } from "antd";
import { ViewModal } from "@/components/common";
import { AppstoreOutlined, TableOutlined } from "@ant-design/icons";
import ChapterMap from "@/components/Game/ChapterMap";
import LevelManagement from "@/pages/Admin/GameManagement/LevelManagement";
import adminLevelService from "@/services/admin-level.service";
import { Level } from "@/types";

// Import styles from LevelsPage to ensure Map looks correct
import "@/pages/Game/LevelsPage/styles.less"; 
import GameSimulator from "@/pages/Admin/GameManagement/LevelManagement/components/GameSimulator";
import adminScreenService from "@/services/admin-screen.service"; 

interface ChapterPreviewProps {
    chapterId: number;
    chapterName: string;
    visible: boolean;
    onClose: () => void;
}

const ChapterPreview: React.FC<ChapterPreviewProps> = ({ 
    chapterId, 
    chapterName, 
    visible, 
    onClose 
}) => {
    const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Simulator State
    const [simulatorVisible, setSimulatorVisible] = useState(false);
    const [simulatorScreens, setSimulatorScreens] = useState<any[]>([]);
    const [simulatorBgm, setSimulatorBgm] = useState<string | undefined>();

    const handleRunLevel = async (level: any) => {
        setSimulatorBgm(level.backgroundMusic);
        try {
            // 1. Try to use screens from local level object first
            if (level.screens && Array.isArray(level.screens) && level.screens.length > 0) {
                setSimulatorScreens(level.screens);
                setSimulatorVisible(true);
                return;
            }
  
            // 2. Fallback to API
            const res = await adminScreenService.getScreens(level.id);
            if (res.success && res.data) {
                // Handle response format variations
                const screens = Array.isArray(res.data) ? res.data : (res.data?.items || []);
                setSimulatorScreens(screens);
                setSimulatorVisible(true);
            } else {
                 // Fallback if no screens
                 setSimulatorScreens([]);
                 setSimulatorVisible(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (visible && viewMode === 'map') {
            fetchLevels();
        }
    }, [visible, viewMode, chapterId]);

    const fetchLevels = async () => {
        setLoading(true);
        try {
            const res = await adminLevelService.getAll({
                page: 1, 
                limit: 50, 
                chapterId: chapterId  // ✅ Fix: Use camelCase to match database field
            });
            
            if (res.data) {
                // Mock user-specific fields for the map (locked, completed)
                // In Admin preview, we assume everything is UNLOCKED so they can see all nodes.
                const previewLevels = res.data.map((l: any) => ({
                    ...l,
                    is_locked: false, // Unlock all for preview
                    is_completed: false,
                    player_best_score: 0,
                    // If backend doesn't return image/thumbnail, mock it?
                    thumbnail: l.thumbnail || "https://via.placeholder.com/150",
                }));
                setLevels(previewLevels);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <ViewModal
            title={`Xem trước: ${chapterName}`}
            titleExtra={
                <Radio.Group 
                    value={viewMode} 
                    onChange={(e) => setViewMode(e.target.value)}
                    buttonStyle="solid"
                    size="small"
                >
                    <Radio.Button value="table">
                        <TableOutlined /> Dạng Bảng
                    </Radio.Button>
                    <Radio.Button value="map">
                        <AppstoreOutlined /> Dạng Bản đồ
                    </Radio.Button>
                </Radio.Group>
            }
            open={visible}
            onClose={onClose}
            width={1200}
            bodyStyle={{ 
                height: viewMode === 'map' ? '80vh' : 'auto',
                maxHeight: '80vh',
                overflowY: 'auto', 
                padding: 0, 
                background: viewMode === 'map' ? '#f4efe4' : '#fff' 
            }}
        >
            <div style={{ position: 'relative', minHeight: '100%' }}>
                {viewMode === 'table' ? (
                     <div>
                        {/* Pass chapterId to LevelManagement to filter levels */}
                        <LevelManagement key={chapterId} chapterId={chapterId} chapterName={chapterName} hideCard={true} /> 
                     </div>
                ) : (
                    <div style={{ 
                
                        display: 'flex', 
                        height: '100%', 
                        width: '100%',
                        position: 'relative',
                        // Replicate .game-page-background() from common.less
                        backgroundColor: '#f4efe4',
                        backgroundImage: 'radial-gradient(#c5a065 1.5px, transparent 0)',
                        backgroundSize: '20px 20px',
                        justifyContent: 'center', // Keep original centering
                        padding: '24px', // Keep original padding
                        minHeight: 500 // Keep original minHeight
                    }}>
                        {loading ? <Spin size="large" /> : (
                            levels.length > 0 ? (
                                <ChapterMap 
                                    levels={levels}
                                    onLevelClick={handleRunLevel}
                                    showDetailCards={true}
                                />
                             ) : <Empty description="Chưa có màn chơi nào trong chương này" />
                        )}
                    </div>
                )}
            </div>
            
            <GameSimulator 
                visible={simulatorVisible}
                onClose={() => setSimulatorVisible(false)}
                screens={simulatorScreens}
                title="Running Level (Preview)"
                bgmUrl={simulatorBgm}
            />
        </ViewModal>
    );
};

export default ChapterPreview;
