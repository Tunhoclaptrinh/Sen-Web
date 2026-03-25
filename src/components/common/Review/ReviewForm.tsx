import React, { useState } from "react";
import { Form, Input, Button, Rate, message, Card, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { createReview } from "@/store/slices/reviewSlice";
import { RootState, AppDispatch } from "@/store";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ReviewFormProps {
  type: "heritage_site" | "artifact" | "exhibition" | "history_article";
  referenceId: number;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ type, referenceId, onSuccess }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (values: any) => {
    if (!isAuthenticated) {
      message.warning(t('common.reviews.loginRequired'));
      return;
    }

    setLoading(true);
    try {
      const response = await dispatch(
        createReview({
          ...values,
          type,
          referenceId,
        }),
      ).unwrap();

      if (response) {
        message.success(t('common.reviews.successMessage'));
        form.resetFields();
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      message.error(error?.message || "Không thể gửi đánh giá. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="review-form-locked" style={{ textAlign: "center", background: "#f5f5f5", border: "none" }}>
        <Text type="secondary">{t('common.reviews.loginRequired')}</Text>
      </Card>
    );
  }

  return (
    <div className="review-form-container">
      <Title level={4}>{t('common.reviews.writeBtn')}</Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ rating: 0 }}>
        <Form.Item
          name="rating"
          label={t('common.reviews.satisfaction')}
          rules={[{ required: true, message: t('common.reviews.requiredRating') }]}
        >
          <Rate allowHalf />
        </Form.Item>

        <Form.Item
          name="comment"
          label={t('common.reviews.comment')}
          rules={[
            { required: true, message: t('common.reviews.requiredComment') },
            { min: 10, message: t('common.reviews.minChars') },
          ]}
        >
          <TextArea rows={4} placeholder={t('common.reviews.placeholder')} maxLength={1000} showCount />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large" className="submit-review-btn">
            {t('common.reviews.submitBtn')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ReviewForm;
