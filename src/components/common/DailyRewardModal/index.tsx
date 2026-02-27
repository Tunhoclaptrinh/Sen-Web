
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
    const lastClaim = progress?.lastRewardClaim ? dayjs(progress.lastRewardClaim).format('YYYY-MM-DD') : null;
    const isClaimedToday = lastClaim === today;
    
    // Logic to determine "Current Display Day" (1-7)
    // If claimed today: Show current streak as "Completed"
    // If NOT claimed today:
    //    If last claim was yesterday: Next day is target.
    //    If last claim was older: Day 1 is target.
    
    let currentStreak = progress?.streakDays || 0;
    let nextStreak = currentStreak + 1;
    let isReset = false;

    if (!isClaimedToday) {
        if (progress?.lastRewardClaim) {
             const diff = dayjs().diff(dayjs(progress.lastRewardClaim), 'day');
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
            wrapClassName="sen-hoa-premium"
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CalendarOutlined style={{ color: 'var(--seal-red)' }} />
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800 }}>Điểm danh nhận quà</span>
                </div>
            }
        >
            <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 24 }}>
                     <Title level={2} style={{ 
                        margin: 0, 
                        color: 'var(--seal-red)', 
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 900,
                        fontSize: '2.5rem',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 16 
                    }}>
                        <FireOutlined style={{ filter: 'drop-shadow(0 0 8px rgba(139, 29, 29, 0.3))' }} /> 
                        {isReset && !isClaimedToday ? '1 Ngày' : `${progress?.streakDays || 0} Ngày`}
                     </Title>
                     <Text style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-color-primary)', fontSize: '1.1rem' }}>
                        Chuỗi nỗ lực liên tiếp
                     </Text>
                     
                     {isReset && !isClaimedToday && (
                         <div style={{ marginTop: 12, padding: '4px 12px', background: 'rgba(139, 29, 29, 0.05)', borderRadius: 20, display: 'inline-block' }}>
                             <Text type="warning" style={{ fontWeight: 600 }}>Chuỗi đã bị reset do bạn quên điểm danh hôm qua!</Text>
                         </div>
                     )}
                </div>

                {renderDays()}

                <div style={{ background: 'rgba(197, 160, 101, 0.08)', padding: 20, borderRadius: 12, marginBottom: 32, border: '1px dashed var(--gold-border)' }}>
                     <Row gutter={[16, 16]}>
                         <Col span={12} style={{ borderRight: '1px solid var(--gold-border)' }}>
                             <Text type="secondary" style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem' }}>Phần quà hôm nay</Text>
                             <div style={{ fontSize: 28, fontWeight: '800', color: 'var(--seal-red)', marginTop: 8, fontFamily: 'var(--font-serif)' }}>
                                 50 <small style={{ fontSize: 16, fontWeight: 400 }}>Coins</small>
                             </div>
                         </Col>
                         <Col span={12}>
                             <Text type="secondary" style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem' }}>Vật phẩm quý</Text>
                             <div style={{ fontSize: 28, fontWeight: '800', color: 'var(--seal-red)', marginTop: 8, fontFamily: 'var(--font-serif)' }}>
                                 1 <small style={{ fontSize: 16, fontWeight: 400 }}>Cánh Sen</small>
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
                        height: 56, 
                        fontSize: 20, 
                        borderRadius: 8,
                        background: isClaimedToday ? '#ccc' : 'var(--seal-red)',
                        borderColor: isClaimedToday ? '#ccc' : 'var(--seal-border)',
                        color: '#fff9e6',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: 700,
                        boxShadow: isClaimedToday ? 'none' : '0 4px 0 var(--seal-border)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}
                    className="btn-heritage-claim"
                >
                    {isClaimedToday ? 'Hẹn gặp lại chủ nhân ngày mai' : 'Nhận báu vật ngay'}
                </Button>
                
                <div style={{ marginTop: 24 }}>
                    <Text type="secondary" style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--text-color-secondary)' }}>
                        *Kiên trì 7 ngày liên tục để nhận báu vật đặc biệt từ Sen*
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default DailyRewardModal;
