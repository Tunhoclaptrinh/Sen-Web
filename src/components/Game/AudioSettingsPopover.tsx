import React from 'react';
import { Popover, Slider, Switch, Space, Typography, Button } from 'antd';
import { SoundOutlined, MutedOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface AudioSettingsProps {
    isMuted: boolean;
    onMuteToggle: (muted: boolean) => void;
    bgmVolume: number;
    onBgmVolumeChange: (value: number) => void;
    sfxVolume: number;
    onSfxVolumeChange: (value: number) => void;
    children?: React.ReactNode;
}

const AudioSettingsPopover: React.FC<AudioSettingsProps> = ({
    isMuted,
    onMuteToggle,
    bgmVolume,
    onBgmVolumeChange,
    sfxVolume,
    onSfxVolumeChange,
    children
}) => {
    const content = (
        <div style={{ width: 250, padding: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>Âm thanh</Text>
                    <Switch 
                        checked={!isMuted} 
                        onChange={(checked) => onMuteToggle(!checked)} 
                        checkedChildren={<SoundOutlined />}
                        unCheckedChildren={<MutedOutlined />}
                    />
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12 }}>Nhạc nền (BGM)</Text>
                        <Text style={{ fontSize: 12, color: '#888' }}>{Math.round(bgmVolume * 100)}%</Text>
                    </div>
                    <Slider 
                        min={0} 
                        max={1} 
                        step={0.1} 
                        value={bgmVolume} 
                        onChange={onBgmVolumeChange}
                        disabled={isMuted}
                        trackStyle={{ backgroundColor: 'var(--primary-color)' }}
                    />
                </div>

                <div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12 }}>Hiệu ứng (SFX)</Text>
                        <Text style={{ fontSize: 12, color: '#888' }}>{Math.round(sfxVolume * 100)}%</Text>
                    </div>
                    <Slider 
                        min={0} 
                        max={1} 
                        step={0.1} 
                        value={sfxVolume} 
                        onChange={onSfxVolumeChange}
                        disabled={isMuted}
                        trackStyle={{ backgroundColor: 'var(--primary-color)' }}
                    />
                </div>
            </Space>
        </div>
    );

    return (
        <Popover 
            content={content} 
            trigger="click" 
            placement="topRight" 
            overlayClassName="game-settings-popover"
        >
            {children || (
                <Button 
                    icon={isMuted ? <MutedOutlined /> : <SoundOutlined />} 
                    size="large"
                    className="sound-button"
                    style={{ position: 'absolute', bottom: 20, right: 80, zIndex: 100 }}
                />
            )}
        </Popover>
    );
};

export default AudioSettingsPopover;
