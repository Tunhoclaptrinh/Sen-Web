import React from "react";
import {List, Empty, Spin} from "antd";
import {CommentOutlined} from "@ant-design/icons";
import ReviewItem from "./ReviewItem";
import type {Review, Pagination} from "@/types";

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({reviews, loading, pagination, onPageChange}) => {
  if (loading && reviews.length === 0) {
    return (
      <div style={{textAlign: "center", padding: "40px 0"}}>
        <Spin tip="Đang tải đánh giá..." />
      </div>
    );
  }

  return (
    <div className="review-list">
      <List
        itemLayout="horizontal"
        dataSource={reviews}
        loading={loading}
        pagination={
          pagination.total > 0
            ? {
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                onChange: onPageChange,
                align: "center",
                style: {marginTop: 24},
                hideOnSinglePage: false, // Force show even if only 1 page
              }
            : false
        }
        renderItem={(review) => (
          <List.Item>
            <ReviewItem review={review} />
          </List.Item>
        )}
        locale={{
          emptyText: (
            <Empty
              image={<CommentOutlined style={{fontSize: 48, color: "rgba(139, 29, 29, 0.2)"}} />}
              description={
                <span style={{color: "#886a64", fontStyle: "italic"}}>
                  Chưa có đánh giá nào cho mục này. Hãy là người đầu tiên!
                </span>
              }
            />
          ),
        }}
      />
    </div>
  );
};

export default ReviewList;
