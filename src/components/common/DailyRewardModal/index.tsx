
import React, { useState } from 'react';
import { Modal, Button, Typography, message, Row, Col } from 'antd';
import { GiftOutlined, CheckCircleFilled, CalendarOutlined, FireOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { claimDailyReward } from '@/store/slices/gameSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface DailyRewardModalProps {
    visible: boolean;
    onClose: () => void;
}

const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ visible, onClose }) => {
    const dispatch = useDispatch();
    const { progress } = useSelector((state: RootState) => state.game); // Note: successMessage might be global, be careful
    const [loading, setLoading] = useState(false);

    // Calculate State
    const today = dayjs().format('YYYY-MM-DD');
    const lastClaim = progress?.last_reward_claim ? dayjs(progress.last_reward_claim).format('YYYY-MM-DD') : null;
    const isClaimedToday = lastClaim === today;
    
    // Logic to determine "Current Display Day" (1-7)
    // If claimed today: Show current streak as "Completed"
    // If NOT claimed today:
    //    If last claim was yesterday: Next day is target.
    //    If last claim was older: Day 1 is target.
    
    let currentStreak = progress?.streak_days || 0;
    let nextStreak = currentStreak + 1;
    let isReset = false;

    if (!isClaimedToday) {
        if (progress?.last_reward_claim) {
             const diff = dayjs().diff(dayjs(progress.last_reward_claim), 'day');
             if (diff > 1) {
                 nextStreak = 1;
                 isReset = true;
             }
        } else {
            nextStreak = 1; // First time ever
        }
    } else {
        // If claimed today, currentStreak IS the today's streak.
        nextStreak = currentStreak; 
    }

    // Cycle handling: modulo 7
    // If nextStreak is 8, it means Day 1 of next cycle logic-wise, but maybe visuals just show 7 days?
    // Let's rely on "Day in Cycle"
    // (streak - 1) % 7 + 1
    
    const targetDisplayDay = ((nextStreak - 1) % 7) + 1;
    
    const handleClaim = async () => {
        setLoading(true);
        try {
            await dispatch(claimDailyReward() as any).unwrap();
            message.success('Đã nhận thưởng thành công!');
            // onClose(); // Optional: keep open to show "Claimed" state
        } catch (err) {
            message.error('Nhận thưởng thất bại');
        } finally {
            setLoading(false);
        }
    };

    const renderDays = () => {
        const days = [1, 2, 3, 4, 5, 6, 7];
        
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, marginBottom: 16, gap: 8, overflowX: 'auto', padding: '12px 12px' }}>
                {days.map(day => {
                    // Determine status
                    // Active: This is the day user is ABOUT to claim or JUST claimed
                    // Completed: Days before Target Day
                    // Locked: Future days
                    
                    let status: 'completed' | 'active' | 'locked' = 'locked';
                    
                    if (isClaimedToday) {
                        if (day < targetDisplayDay) status = 'completed';
                        else if (day === targetDisplayDay) status = 'completed'; // Today is done
                        else status = 'locked';
                    } else {
                        // Not claimed yet
                        if (day < targetDisplayDay) status = 'completed';
                        else if (day === targetDisplayDay) status = 'active'; // Waiting to claim
                        else status = 'locked';
                    }
                    
                    // Special styling for Day 7
                    const isBig = day === 7;
                    
                    let bg = '#f5f5f5';
                    let border = '1px solid #f0f0f0';
                    let color = '#bfbfbf';
                    let scale = 1;
                    let shadow = 'none';

                    if (status === 'active') {
                        bg = '#e6f7ff';
                        border = '2px solid #1890ff';
                        color = '#1890ff';
                        scale = 1.1;
                        shadow = '0 4px 12px rgba(24, 144, 255, 0.2)';
                    } else if (status === 'completed') {
                        bg = '#f6ffed';
                        border = '1px solid #b7eb8f';
                        color = '#52c41a';
                    }

                    return (
                        <div key={day} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: 8,
                            flex: 1,
                            minWidth: 50
                        }}>
                            <div style={{ 
                                width: isBig ? 64 : 48, 
                                height: isBig ? 64 : 48, 
                                borderRadius: '50%', 
                                background: bg,
                                border: border,
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                transition: 'all 0.3s',
                                transform: `scale(${scale})`,
                                boxShadow: shadow,
                                position: 'relative'
                            }}>
                                {status === 'completed' ? (
                                    <CheckCircleFilled style={{ fontSize: 24, color }} />
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                         {isBig ? <GiftOutlined style={{ fontSize: 24, color: status === 'locked' ? '#bfbfbf' : '#faad14' }} /> 
                                                : <span style={{ fontWeight: 600, color: status === 'locked' ? '#bfbfbf' : '#faad14', fontSize: 16 }}>
                                                    +50
                                                  </span>
                                         }
                                    </div>
                                )}
                                
                                {isBig && status !== 'locked' && (
                                     <div style={{ position: 'absolute', top: -8, right: -8 }}>
                                         <span style={{ fontSize: 20 }}>🌸</span>
                                     </div>
                                )}
                            </div>
                            <Text style={{ fontSize: 12, fontWeight: status === 'active' || isBig ? 700 : 400, color: isBig ? '#ff4d4f' : 'inherit' }}>
                                {isBig ? 'Bonus Gift' : `Ngày ${day}`}
                            </Text>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={600}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: '#eb2f96' }} />
                    <span>Điểm danh nhận quà</span>
                </div>
            }
            bodyStyle={{ padding: '24px 32px' }}
        >
            <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 16 }}>
                     <Title level={2} style={{ margin: 0, color: '#faad14', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <FireOutlined style={{ color: '#ff4d4f' }} /> 
                        {isReset && !isClaimedToday ? '1 Ngày' : `${progress?.streak_days || 0} Ngày`}
                     </Title>
                     <Text type="secondary">Chuỗi nỗ lực liên tiếp</Text>
                     
                     {isReset && !isClaimedToday && (
                         <div style={{ marginTop: 8 }}>
                             <Text type="warning">Chuỗi đã bị reset do bạn quên điểm danh hôm qua!</Text>
                         </div>
                     )}
                </div>

                {renderDays()}

                <div style={{ background: '#fafafa', padding: 16, borderRadius: 12, marginBottom: 24 }}>
                     <Row gutter={[16, 16]}>
                         <Col span={12} style={{ borderRight: '1px solid #f0f0f0' }}>
                             <Text type="secondary">Phần quà hôm nay</Text>
                             <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14', marginTop: 4 }}>
                                 50 <small style={{ fontSize: 14 }}>Coins</small>
                             </div>
                         </Col>
                         <Col span={12}>
                             <Text type="secondary">Vật phẩm</Text>
                             <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f', marginTop: 4 }}>
                                 1 <small style={{ fontSize: 14 }}>Petal</small>
                             </div>
                         </Col>
                     </Row>
                </div>

                <Button 
                    type="primary" 
                    size="large" 
                    block 
                    icon={<GiftOutlined />}
                    onClick={handleClaim}
                    loading={loading}
                    disabled={isClaimedToday}
                    style={{ 
                        height: 50, 
                        fontSize: 18, 
                        borderRadius: 25,
                        background: isClaimedToday ? '#d9d9d9' : 'linear-gradient(90deg, #faad14, #ffbb33)',
                        borderColor: isClaimedToday ? '#d9d9d9' : '#faad14',
                        boxShadow: isClaimedToday ? 'none' : '0 4px 15px rgba(250, 173, 20, 0.4)'
                    }}
                >
                    {isClaimedToday ? 'Đã nhận thưởng hôm nay' : 'Nhận thưởng ngay'}
                </Button>
                
                <div style={{ marginTop: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        *Điểm danh liên tục 7 ngày để nhận quà đặc biệt!
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default DailyRewardModal;
