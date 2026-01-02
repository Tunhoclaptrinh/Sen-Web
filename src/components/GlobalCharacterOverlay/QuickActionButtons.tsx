import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Tooltip } from 'antd';
import {
    RocketOutlined,
    BookOutlined,
    DashboardOutlined,
    ControlOutlined,
    FileTextOutlined,
    ExperimentOutlined,
    PlusOutlined
} from '@ant-design/icons';
import senHead from '@/assets/images/SenChibi/face.png';
import './QuickActions.less';

/**
 * QuickActionButtons Component
 * Includes Sen toggle button + role-based quick action buttons
 */
interface QuickActionButtonsProps {
    isMinimized: boolean;
    onToggleMinimize: () => void;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
    isMinimized,
    onToggleMinimize
}) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

    // Role-based buttons (lowercase to match enum values)
    const renderRoleButtons = () => {
        if (!isAuthenticated || !user) return null;

        switch (user.role) {
            case 'admin':
                return (
                    <>
                        <Tooltip title="Dashboard" placement="left">
                            <button
                                className="quick-action-btn quick-action-btn--dashboard"
                                onClick={() => navigate('/admin/dashboard')}
                            >
                                <DashboardOutlined />
                            </button>
                        </Tooltip>
                    </>
                );

            case 'customer':
                return (
                    <>
                        <Tooltip title="Khám phá game" placement="left">
                            <button
                                className="quick-action-btn quick-action-btn--game"
                                onClick={() => navigate('/game/chapters')}
                            >
                                <RocketOutlined />
                            </button>
                        </Tooltip>
                    </>
                );

            case 'researcher':
                return (
                    <>
                        <Tooltip title="Nội dung của tôi" placement="left">
                            <button
                                className="quick-action-btn quick-action-btn--research"
                                onClick={() => navigate('/researcher/heritage/my-submissions')}
                            >
                                <FileTextOutlined />
                            </button>
                        </Tooltip>
                    </>
                );

            case 'curator':
                return (
                    <>
                        <Tooltip title="Bộ sưu tập" placement="left">
                            <button
                                className="quick-action-btn quick-action-btn--collection"
                                onClick={() => navigate('/collections')}
                            >
                                <BookOutlined />
                            </button>
                        </Tooltip>
                        <Tooltip title="Khám phá" placement="left">
                            <button
                                className="quick-action-btn quick-action-btn--explore"
                                onClick={() => navigate('/heritage-sites')}
                            >
                                <ExperimentOutlined />
                            </button>
                        </Tooltip>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                {/* Role-based Quick Action Buttons */}
                {renderRoleButtons()}

                {/* Sen Toggle Button */}
                <div
                    className={`sen-toggle-btn ${!isMinimized ? "sen-toggle-btn--active" : ""}`}
                    onClick={onToggleMinimize}
                    title={isMinimized ? "Gọi Sen" : "Ẩn Sen"}
                >
                    <img src={senHead} alt="Sen Toggle" className="sen-toggle-btn__icon" />
                </div>
            </div>
        </div>
    );
};

export default QuickActionButtons;
