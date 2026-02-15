import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Card, Rate, Divider, Button} from "antd";
import {EditOutlined, CloseOutlined, StarFilled, MessageOutlined} from "@ant-design/icons";
import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import {fetchReviewsByItem} from "@/store/slices/reviewSlice";
import {RootState, AppDispatch} from "@/store";
import "./styles.less";

interface ReviewSectionProps {
  type: "heritage_site" | "artifact" | "exhibition" | "history_article";
  referenceId: number;
  rating?: number;
  totalReviews?: number;
  onSuccess?: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({type, referenceId, rating = 0, totalReviews = 0, onSuccess}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {items: reviews, loading, pagination} = useSelector((state: RootState) => state.review);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (referenceId) {
      dispatch(
        fetchReviewsByItem({
          type,
          id: referenceId,
          params: {_page: 1, _limit: 10},
        }),
      );
    }
  }, [dispatch, type, referenceId]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchReviewsByItem({
        type,
        id: referenceId,
        params: {_page: page, _limit: 10},
      }),
    );
  };

  const handleReviewSuccess = () => {
    // Refresh reviews after successful submission
    dispatch(
      fetchReviewsByItem({
        type,
        id: referenceId,
        params: {_page: 1, _limit: 10},
      }),
    );
    if (onSuccess) onSuccess();
  };

  return (
    <div className="review-section-container">
      <div className="review-section-header">
        <h2 className="section-title">Cảm nhận khách tham quan</h2>
        <div className="review-stats-bar">
          <div className="avg-rating">
            <span className="rating-value">{rating.toFixed(1)}</span>
            <Rate disabled value={rating} allowHalf character={<StarFilled />} />
          </div>
          <div className="total-reviews-summary">
            Dựa trên <strong>{totalReviews || 0}</strong> lượt đánh giá
          </div>
        </div>
      </div>

      <div className="review-main-content">
        <Card className="review-list-card" bordered={false}>
          <div className="list-header">
            <h3>
              <MessageOutlined /> Tất cả nhận xét ({pagination.total || 0})
            </h3>
            <Button
              type="primary"
              className="write-review-btn"
              icon={showForm ? <CloseOutlined /> : <EditOutlined />}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Đóng" : "Gửi đánh giá của bạn"}
            </Button>
          </div>

          {showForm && (
            <div className="review-form-wrapper">
              <ReviewForm type={type} referenceId={referenceId} onSuccess={handleReviewSuccess} />
              <Divider dashed />
            </div>
          )}

          <ReviewList reviews={reviews} loading={loading} pagination={pagination} onPageChange={handlePageChange} />
        </Card>
      </div>
    </div>
  );
};

export default ReviewSection;
