import React from "react";
import { Row, Col, Collapse, Form, Input, Button, Typography, message } from "antd";
import { useTranslation } from "react-i18next";
import { MailOutlined, PhoneOutlined, SendOutlined } from "@ant-design/icons";
import "./styles.less";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const SupportPage: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const onFinish = () => {
    // TODO: Implement contact form submission logic
    message.success(t('support.contact.form.success'));
    form.resetFields();
  };

  const faqData = [
    {
      question: t('support.faq.q1'),
      answer: t('support.faq.a1'),
    },
    {
      question: t('support.faq.q2'),
      answer: t('support.faq.a2'),
    },
    {
      question: t('support.faq.q3'),
      answer: t('support.faq.a3'),
    },
    {
      question: t('support.faq.q4'),
      answer: t('support.faq.a4'),
    },
    {
      question: t('support.faq.q5'),
      answer: t('support.faq.a5'),
    },
  ];

  return (
    <div className="support-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <Title level={1}>{t('support.hero.title')}</Title>
          <p className="hero-subtitle">
            {t('support.hero.subtitle')}
          </p>
        </div>
      </section>

      <div className="support-content-container">
        {/* Decoration - moved inside content */}
        <img src="https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355964/sen_web/static/public/images/hoatiettrongdong.png" className="bg-drum" alt="Decoration Drum Pattern" />
        {/* FAQ Section */}
        <div className="section-header">
          <Title level={2}>{t('support.faq.title')}</Title>
          <p>{t('support.faq.subtitle')}</p>
        </div>

        <div className="faq-section">
          <Collapse accordion defaultActiveKey={["0"]} expandIconPosition="end" ghost>
            {faqData.map((item, index) => (
              <Panel header={item.question} key={index}>
                <Paragraph style={{ color: "#666", lineHeight: 1.8, margin: 0 }}>{item.answer}</Paragraph>
              </Panel>
            ))}
          </Collapse>
        </div>

        {/* Contact Section */}
        <div className="contact-section">
          <div className="contact-header">
            <Title level={2}>{t('support.contact.title')}</Title>
            <p>{t('support.contact.subtitle')}</p>
          </div>

          <Row gutter={48}>
            {/* Left Column - Contact Methods */}
            <Col xs={24} md={10}>
              <div className="contact-info-column">
                <div className="contact-method">
                  <MailOutlined className="icon" />
                  <h4>{t('support.contact.email')}</h4>
                  <p>{t('support.contact.emailValue')}</p>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {t('support.contact.emailDesc')}
                  </Text>
                </div>
                <div className="contact-method">
                  <PhoneOutlined className="icon" />
                  <h4>{t('support.contact.hotline')}</h4>
                  <p>{t('support.contact.hotlineValue')}</p>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {t('support.contact.hotlineDesc')}
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
                      label={t('support.contact.form.name')}
                      rules={[{ required: true, message: t('support.contact.form.nameRequired') }]}
                    >
                      <Input placeholder={t('support.contact.form.namePlaceholder')} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label={t('support.contact.form.email')}
                      rules={[
                        { required: true, message: t('support.contact.form.emailRequired') },
                        { type: "email", message: t('support.contact.form.emailInvalid') },
                      ]}
                    >
                      <Input placeholder={t('support.contact.form.emailPlaceholder')} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="message"
                  label={t('support.contact.form.message')}
                  rules={[
                    { required: true, message: t('support.contact.form.messageRequired') },
                    { min: 20, message: t('support.contact.form.messageMin') },
                  ]}
                >
                  <Input.TextArea rows={5} placeholder={t('support.contact.form.messagePlaceholder')} />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button htmlType="submit" className="submit-button">
                    <SendOutlined /> {t('support.contact.form.submit')}
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
