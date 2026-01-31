import { useEffect, useState } from "react";
import { Modal, Descriptions, Tabs, Tag, Avatar, Badge } from "antd";
import { User, UserActivity } from "@/types";
import userService from "@/services/user.service";
import dayjs from "dayjs";
import { UserOutlined } from "@ant-design/icons";

interface UserDetailModalProps {
    userId: number | null;
    visible: boolean;
    onCancel: () => void;
}

const UserDetailModal = ({ userId, visible, onCancel }: UserDetailModalProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [activity, setActivity] = useState<UserActivity | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId && visible) {
            fetchUserDetail(userId);
        }
    }, [userId, visible]);

    const fetchUserDetail = async (id: number) => {
        setLoading(true);
        try {
            const response = await userService.getActivity(id);
            if (response.success && response.data) {
                // @ts-ignore - The API response structure might wrap user inside data
                setUser(response.data.user || null);
                // @ts-ignore
                setActivity(response.data.stats || null);
            }
        } catch (error) {
            console.error("Failed to fetch user detail:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderUserInfo = () => {
        if (!user) return null;
        return (
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Avatar">
                    <Avatar src={user.avatar} icon={<UserOutlined />} size={64} />
                </Descriptions.Item>
                <Descriptions.Item label="Họ tên">{user.name}</Descriptions.Item>
                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">{user.phone || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                    <Tag color={user.role === "admin" ? "red" : "blue"}>{user.role.toUpperCase()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Badge status={user.isActive ? "success" : "error"} text={user.isActive ? "Active" : "Inactive"} />
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tham gia">
                    {dayjs(user.createdAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
            </Descriptions>
        );
    };

    const renderActivityStats = () => {
        if (!activity) return <div>Không có dữ liệu hoạt động</div>;
        return (
            <Descriptions bordered column={2}>
                <Descriptions.Item label="Tổng đơn hàng">{activity.totalOrders}</Descriptions.Item>
                <Descriptions.Item label="Đơn thành công">{activity.completedOrders}</Descriptions.Item>
                <Descriptions.Item label="Tổng đánh giá">{activity.totalReviews}</Descriptions.Item>
                <Descriptions.Item label="Đánh giá trung bình">{activity.avgRating} / 5</Descriptions.Item>
            </Descriptions>
        );
    };

    return (
        <Modal
            title="Chi tiết người dùng"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
            loading={loading}
        >
            <Tabs
                items={[
                    {
                        key: "info",
                        label: "Thông tin cá nhân",
                        children: renderUserInfo(),
                    },
                    {
                        key: "activity",
                        label: "Hoạt động",
                        children: renderActivityStats(),
                    },
                ]}
            />
        </Modal>
    );
};

export default UserDetailModal;
