import React from "react";
import {Avatar, Rate, Typography, Space} from "antd";
import {UserOutlined, StarFilled} from "@ant-design/icons";
import dayjs from "dayjs";
import type {Review} from "@/types";

const {Text, Paragraph} = Typography;

interface ReviewItemProps {
  review: Review;
}

const ReviewItem: React.FC<ReviewItemProps> = ({review}) => {
  return (
    <div className="review-item">
      <Space align="start" size="middle">
        <Avatar src={review.userAvatar} icon={<UserOutlined />} size="large" />
        <div className="review-content">
          <div className="review-header">
            <Text className="user-name">{review.userName || review.authorName || "Người dùng Sen"}</Text>
            <Text className="review-date">{dayjs(review.createdAt).format("DD/MM/YYYY")}</Text>
          </div>
          <div style={{margin: "4px 0"}}>
            <Rate disabled defaultValue={review.rating} style={{fontSize: 14}} character={<StarFilled />} />
          </div>
          <Paragraph className="review-comment">{review.comment}</Paragraph>
        </div>
      </Space>
    </div>
  );
};

export default ReviewItem;
