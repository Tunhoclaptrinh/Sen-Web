import {Modal, Descriptions, Tabs, Tag, Image, Space, Typography, List, Card} from "antd";
import {getImageUrl} from "@/utils/image.helper";
import {
  ReadOutlined,
  FieldTimeOutlined,
  BarChartOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

interface LearningDetailModalProps {
  open: boolean;
  onCancel: () => void;
  record: any | null;
}

const LearningDetailModal: React.FC<LearningDetailModalProps> = ({open, onCancel, record}) => {
  if (!record) return null;

  const quiz = record.quiz || {passingScore: 50, questions: []};
  const questions = quiz.questions || [];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={`Chi tiết bài học: ${record.title}`}
      width={900}
      footer={null}
      destroyOnClose
    >
      <Tabs defaultActiveKey="info" className="learning-detail-tabs">
        <Tabs.TabPane
          tab={
            <span>
              <ReadOutlined /> Thông tin chung
            </span>
          }
          key="info"
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Tiêu đề" span={2}>
              <Typography.Title level={5} style={{margin: 0}}>
                {record.title}
              </Typography.Title>
            </Descriptions.Item>

            <Descriptions.Item label="Hình ảnh">
              {record.thumbnail ? (
                <Image width={120} src={getImageUrl(record.thumbnail)} style={{borderRadius: 8, objectFit: "cover"}} />
              ) : (
                <span style={{color: "#999", fontStyle: "italic"}}>Chưa có ảnh</span>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  record.status === "published"
                    ? "green"
                    : record.status === "pending"
                      ? "orange"
                      : record.status === "rejected"
                        ? "red"
                        : "default"
                }
              >
                {record.status === "published"
                  ? "ĐÃ XUẤT BẢN"
                  : record.status === "pending"
                    ? "CHỜ DUYỆT"
                    : record.status === "rejected"
                      ? "TỪ CHỐI"
                      : "BẢN NHÁP"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Độ khó">
              <Space>
                <BarChartOutlined />
                <Tag color={record.difficulty === "hard" ? "red" : record.difficulty === "medium" ? "blue" : "green"}>
                  {record.difficulty?.toUpperCase()}
                </Tag>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Thời lượng">
              <Space>
                <FieldTimeOutlined />
                {record.estimatedDuration} phút
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Loại nội dung">
              <Tag color="cyan">{record.contentType?.toUpperCase()}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Tác giả">{record.authorName || record.author || "Hệ thống"}</Descriptions.Item>

            <Descriptions.Item label="Mô tả ngắn" span={2}>
              {record.description || "Chưa có mô tả."}
            </Descriptions.Item>
          </Descriptions>

          <div style={{marginTop: 24}}>
            <Typography.Title level={5}>Nội dung chi tiết</Typography.Title>
            <Card size="small" style={{background: "#fcfcfc", borderRadius: 8}}>
              {record.contentType === "article" ? (
                <div
                  className="article-content-preview"
                  dangerouslySetInnerHTML={{__html: record.contentUrl || record.content || "Chưa có nội dung."}}
                />
              ) : (
                <div style={{textAlign: "center", padding: "20px 0", color: "#8c8c8c"}}>
                  {record.contentType === "video" ? (
                    <p>
                      Đường dẫn Video:{" "}
                      <a href={record.contentUrl} target="_blank" rel="noopener noreferrer">
                        {record.contentUrl}
                      </a>
                    </p>
                  ) : (
                    <p>Loại nội dung: {record.contentType}</p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <QuestionCircleOutlined /> Quiz & Trắc nghiệm ({questions.length})
            </span>
          }
          key="quiz"
        >
          <Card size="small" style={{marginBottom: 16, background: "#e6f7ff", border: "1px solid #91d5ff"}}>
            <Space>
              <CheckCircleOutlined style={{color: "#1890ff"}} />
              <span>
                <strong>Điểm đạt yêu cầu:</strong> {quiz.passingScore || 0}%
              </span>
            </Space>
          </Card>

          <List
            dataSource={questions}
            renderItem={(item: any, index: number) => (
              <Card
                size="small"
                title={`Câu hỏi ${index + 1} (${item.point || 0} điểm)`}
                style={{marginBottom: 16, borderRadius: 8}}
              >
                <Typography.Paragraph style={{fontWeight: 500, marginBottom: 16}}>{item.question}</Typography.Paragraph>

                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
                  {(item.options || []).map((opt: string, optIdx: number) => (
                    <div
                      key={optIdx}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 6,
                        background: optIdx === item.correctAnswer ? "#f6ffed" : "#f5f5f5",
                        border: optIdx === item.correctAnswer ? "1px solid #b7eb8f" : "1px solid #d9d9d9",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Badge
                        count={optIdx}
                        style={{
                          backgroundColor: optIdx === item.correctAnswer ? "#52c41a" : "#d9d9d9",
                          color: optIdx === item.correctAnswer ? "#fff" : "#595959",
                        }}
                      />
                      <span style={{color: optIdx === item.correctAnswer ? "#389e0d" : "inherit"}}>{opt}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            locale={{emptyText: "Chưa có câu hỏi nào cho bài học này."}}
          />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default LearningDetailModal;
