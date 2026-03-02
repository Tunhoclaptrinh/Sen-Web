import React from "react";
import {Row, Col, Collapse, Form, Input, Button, Typography} from "antd";
import {MailOutlined, PhoneOutlined, SendOutlined} from "@ant-design/icons";
import "./styles.less";

const {Title, Paragraph, Text} = Typography;
const {Panel} = Collapse;

const SupportPage: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = () => {
    // TODO: Implement contact form submission logic
    form.resetFields();
  };

  const faqData = [
    {
      question: "Làm thế nào để tạo tài khoản?",
      answer:
        'Bạn có thể đăng ký tài khoản bằng cách nhấp vào nút "Tài khoản" ở góc trên bên phải màn hình và chọn "Đăng ký". Điền các thông tin cần thiết và xác nhận email để hoàn tất.',
    },
    {
      question: "Tôi có thể đóng góp thông tin về di sản không?",
      answer:
        'Tất nhiên! Chúng tôi hoan nghênh sự đóng góp từ cộng đồng. Sau khi đăng nhập, bạn có thể truy cập mục "Đóng góp" hoặc liên hệ với chúng tôi qua email để gửi thông tin và tư liệu về di sản.',
    },
    {
      question: "Làm sao để báo cáo nội dung không chính xác?",
      answer:
        'Nếu bạn phát hiện thông tin chưa chính xác, vui lòng sử dụng tính năng "Báo cáo" ở cuối mỗi bài viết hoặc trang chi tiết di sản, hoặc gửi email trực tiếp cho đội ngũ hỗ trợ.',
    },
    {
      question: "Ứng dụng có miễn phí không?",
      answer:
        "Phần lớn các nội dung trên SEN là hoàn toàn miễn phí để phục vụ cộng đồng. Tuy nhiên, một số tính năng nâng cao hoặc nội dung chuyên sâu có thể yêu cầu tài khoản thành viên.",
    },
    {
      question: "Làm cách nào để liên hệ với ban quản trị?",
      answer:
        "Bạn có thể liên hệ với chúng tôi qua form bên dưới, hoặc gửi email đến support@sen.com. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.",
    },
  ];

  return (
    <div className="support-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <Title level={1}>Chúng tôi có thể giúp gì cho bạn?</Title>
          <p className="hero-subtitle">
            Khám phá các câu hỏi thường gặp hoặc liên hệ trực tiếp với đội ngũ hỗ trợ của SEN.
          </p>
        </div>
      </section>

      <div className="support-content-container">
        {/* Decoration - moved inside content */}
        <img src="/images/hoatiettrongdong.png" className="bg-drum" alt="" />
        {/* FAQ Section */}
        <div className="section-header">
          <Title level={2}>Câu hỏi thường gặp</Title>
          <p>Tìm câu trả lời nhanh chóng cho các thắc mắc phổ biến</p>
        </div>

        <div className="faq-section">
          <Collapse accordion defaultActiveKey={["0"]} expandIconPosition="end" ghost>
            {faqData.map((item, index) => (
              <Panel header={item.question} key={index}>
                <Paragraph style={{color: "#666", lineHeight: 1.8, margin: 0}}>{item.answer}</Paragraph>
              </Panel>
            ))}
          </Collapse>
        </div>

        {/* Contact Section */}
        <div className="contact-section">
          <div className="contact-header">
            <Title level={2}>Liên hệ với chúng tôi</Title>
            <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
          </div>

          <Row gutter={48}>
            {/* Left Column - Contact Methods */}
            <Col xs={24} md={10}>
              <div className="contact-info-column">
                <div className="contact-method">
                  <MailOutlined className="icon" />
                  <h4>Email</h4>
                  <p>support@sen.com</p>
                  <Text type="secondary" style={{fontSize: 13}}>
                    Chúng tôi sẽ phản hồi trong vòng 24 giờ
                  </Text>
                </div>
                <div className="contact-method">
                  <PhoneOutlined className="icon" />
                  <h4>Hotline</h4>
                  <p>1900 1234 56</p>
                  <Text type="secondary" style={{fontSize: 13}}>
                    Hỗ trợ từ 8:00 - 22:00 hàng ngày
                  </Text>
                </div>
              </div>
            </Col>

            {/* Right Column - Contact Form */}
            <Col xs={24} md={14}>
              <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} className="contact-form">
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label="Họ và tên"
                      rules={[{required: true, message: "Vui lòng nhập họ tên"}]}
                    >
                      <Input placeholder="Nhập họ tên của bạn" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        {required: true, message: "Vui lòng nhập email"},
                        {type: "email", message: "Email không hợp lệ"},
                      ]}
                    >
                      <Input placeholder="Nhập địa chỉ email" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="message"
                  label="Nội dung cần hỗ trợ"
                  rules={[
                    {required: true, message: "Vui lòng nhập nội dung"},
                    {min: 20, message: "Nội dung yêu cầu tối thiểu 20 ký tự"},
                  ]}
                >
                  <Input.TextArea rows={5} placeholder="Mô tả vấn đề bạn đang gặp phải..." />
                </Form.Item>
                <Form.Item style={{marginBottom: 0}}>
                  <Button htmlType="submit" className="submit-button">
                    <SendOutlined /> Gửi yêu cầu
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
