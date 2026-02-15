import React, {useState} from "react";
import {Form, Input, Button, Rate, message, Card, Typography} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {createReview} from "@/store/slices/reviewSlice";
import {RootState, AppDispatch} from "@/store";

const {Title, Text} = Typography;
const {TextArea} = Input;

interface ReviewFormProps {
  type: "heritage_site" | "artifact" | "exhibition" | "history_article";
  referenceId: number;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({type, referenceId, onSuccess}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const {isAuthenticated} = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (values: any) => {
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để để lại đánh giá");
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
        message.success("Cảm ơn bạn đã gửi đánh giá!");
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
      <Card className="review-form-locked" style={{textAlign: "center", background: "#f5f5f5", border: "none"}}>
        <Text type="secondary">Vui lòng đăng nhập để để lại đánh giá.</Text>
      </Card>
    );
  }

  return (
    <div className="review-form-container">
      <Title level={4}>Gửi đánh giá của bạn</Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{rating: 5}}>
        <Form.Item
          name="rating"
          label="Sự hài lòng của bạn"
          rules={[{required: true, message: "Vui lòng chọn mức độ hài lòng"}]}
        >
          <Rate allowHalf />
        </Form.Item>

        <Form.Item
          name="comment"
          label="Nội dung đánh giá"
          rules={[
            {required: true, message: "Vui lòng nhập nội dung đánh giá"},
            {min: 10, message: "Nội dung tối thiểu 10 ký tự"},
          ]}
        >
          <TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn..." maxLength={1000} showCount />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large" className="submit-review-btn">
            Gửi đánh giá
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ReviewForm;
