import React, {useState, useEffect, startTransition} from "react";
import {
  Card,
  Typography,
  Button,
  Radio,
  Spin,
  message,
  Divider,
  Tag,
  Empty,
  Modal,
  Row,
  Col,
  Progress,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  QuestionCircleOutlined,
  TrophyFilled,
  StarFilled,
  FireFilled,
  CheckOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {useNavigate, useParams} from "react-router-dom";
import learningService, {LearningModule} from "@/services/learning.service";
import {motion, AnimatePresence} from "framer-motion";
import {getYouTubeEmbedUrl} from "@/utils/youtube.helper";

const {Title, Paragraph, Text} = Typography;

const LearningDetail: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<LearningModule | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<"content" | "quiz">("content");
  const [timeLeft, setTimeLeft] = useState(0);
  const [warned, setWarned] = useState(false);

  const handleNavigate = React.useCallback(
    (path: string) => {
      startTransition(() => {
        navigate(path);
      });
    },
    [navigate],
  );

  const fetchModuleDetail = React.useCallback(
    async (moduleId: number) => {
      try {
        setLoading(true);
        const data = await learningService.getModuleDetail(moduleId);
        setModule(data);
      } catch (error) {
        message.error("Không thể tải nội dung bài học");
        handleNavigate("/game/learning");
      } finally {
        setLoading(false);
      }
    },
    [handleNavigate],
  );

  useEffect(() => {
    if (id) {
      fetchModuleDetail(parseInt(id));
    }
  }, [id, fetchModuleDetail]);

  const handleAnswerChange = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({...prev, [questionId]: optionIndex}));
  };

  const handleNextStep = () => {
    if (module?.quiz) {
      setCurrentStep("quiz");
      window.scrollTo({top: 0, behavior: "smooth"});
    } else {
      // If no quiz, just complete
      handleNavigate("/game/learning");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep("content");
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  // Timer Logic
  useEffect(() => {
    if (currentStep === "quiz" && module?.estimatedDuration) {
      setTimeLeft(module.estimatedDuration * 60);
      setWarned(false);
    }
  }, [currentStep, module]);

  useEffect(() => {
    if (currentStep === "quiz" && timeLeft > 0 && !submitting) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 61 && !warned) {
            message.warning("Thời gian sắp hết! Bạn còn 1 phút để hoàn thành.");
            setWarned(true);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && currentStep === "quiz" && !submitting && module) {
      message.info("Hết giờ làm bài! Hệ thống đang tự động nộp bài làm của bạn.");
      handleQuizSubmit();
    }
  }, [timeLeft, currentStep, submitting, module, warned]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getEmbedUrl = (url?: string) => {
    return getYouTubeEmbedUrl(url);
  };

  const handleQuizSubmit = async () => {
    if (!module) return;

    // Calculate score locally for preview (Weighted Scoring)
    let score = 100;
    if (module.quiz && module.quiz.questions && module.quiz.questions.length > 0) {
      let totalPoints = 0;
      let earnedPoints = 0;

      module.quiz.questions.forEach((q) => {
        const questionPoint = q.point || 10; // Default to 10 if not set
        totalPoints += questionPoint;

        if (answers[q.id] === q.correctAnswer) {
          earnedPoints += questionPoint;
        }
      });

      score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    }

    try {
      setSubmitting(true);
      const response = await learningService.completeModule(module.id, {
        timeSpent: (module.estimatedDuration || 30) * 60 - timeLeft, // Calculate actual time spent
        score: score,
        answers: answers, // Send answers for backend validation
      });

      if (response.success) {
        if (response.data.passed) {
          // Check for level up in response data (updated backend)
          const responseData = response.data as any; // Cast safely for extended properties
          const isLevelUp = responseData.isLevelUp;
          const newLevel = responseData.newLevel;

          Modal.success({
            title: null, // Custom title below
            icon: null,
            width: 500,
            className: "completion-modal",
            content: (
              <div style={{textAlign: "center", padding: "10px 0"}}>
                <motion.div
                  initial={{scale: 0}}
                  animate={{scale: 1}}
                  transition={{type: "spring", stiffness: 260, damping: 20}}
                >
                  <CheckCircleFilled style={{fontSize: 64, color: "#52c41a", marginBottom: 16}} />
                </motion.div>

                <Title level={2} style={{color: "#52c41a", marginBottom: 8}}>
                  Xuất Sắc!
                </Title>
                <Text style={{fontSize: 16, color: "#555"}}>Bạn đã hoàn thành bài học</Text>

                <div
                  style={{
                    background: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: 16,
                    padding: "16px",
                    marginTop: 24,
                    marginBottom: 24,
                  }}
                >
                  <div style={{fontSize: 36, fontWeight: 800, color: "#52c41a"}}>{response.data.score}</div>
                  <Text type="secondary">Phần trăm cúp</Text>
                </div>

                {isLevelUp && (
                  <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} style={{marginBottom: 24}}>
                    <Tag
                      color="gold"
                      style={{
                        padding: "8px 16px",
                        fontSize: 16,
                        borderRadius: 20,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <TrophyFilled /> LEVEL UP! {newLevel}
                    </Tag>
                  </motion.div>
                )}

                <div style={{display: "flex", justifyContent: "center", gap: 24}}>
                  <div style={{textAlign: "center"}}>
                    <div style={{color: "#faad14", fontSize: 20, fontWeight: "bold"}}>
                      +{response.data.pointsEarned}
                    </div>
                    <Text type="secondary" style={{fontSize: 12}}>
                      CÚP
                    </Text>
                  </div>
                </div>
              </div>
            ),
            okText: "Tiếp tục hành trình",
            centered: true,
            okButtonProps: {
              size: "large",
              shape: "round",
              style: {background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)", border: "none"},
            },
            onOk: () => {
              handleNavigate("/game/learning");
            },
          });
        } else {
          Modal.warning({
            title: "Cần Cố Gắng Hơn",
            icon: <CloseCircleFilled style={{color: "#ff4d4f"}} />,
            content: (
              <div style={{textAlign: "center", marginTop: 16}}>
                <Title level={2} style={{color: "#ff4d4f", margin: 0}}>
                  {response.data.score}
                </Title>
                <Text type="secondary">Cần đạt: {module.quiz?.passingScore || 70}/100 cúp</Text>
                <p style={{marginTop: 16}}>Đừng nản chí! Hãy ôn lại kiến thức và thử lại nhé.</p>
              </div>
            ),
            okText: "Thử lại ngay",
            centered: true,
            okButtonProps: {size: "large", shape: "round", danger: true},
            onOk: () => {
              setAnswers({});
              const element = document.getElementById("quiz-section");
              if (element) element.scrollIntoView({behavior: "smooth"});
            },
          });
        }
      }
    } catch (error) {
      message.error("Lỗi nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f0f2f5",
        }}
      >
        <Spin size="large" tip="Đang tải bài học..." />
      </div>
    );

  if (!module) return <Empty description="Không tìm thấy bài học" />;

  return (
    <div
      className="learning-detail-page"
      style={{
        minHeight: "100vh",
        paddingBottom: 40,
      }}
    >
      {/* Header Area */}
      <div
        style={{
          height: 100,
          position: "relative",
          marginBottom: -40,
        }}
      >
        <div style={{position: "absolute", top: 24, left: 24}}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined style={{color: "#A31D1D", fontSize: 20}} />}
            onClick={() => (currentStep === "quiz" ? handlePrevStep() : handleNavigate("/game/learning"))}
            style={{color: "#A31D1D", fontWeight: 600, fontSize: 16}}
          >
            {currentStep === "quiz" ? "Trở về bài học" : "Quay lại"}
          </Button>
        </div>
      </div>

      <div style={{maxWidth: "100%", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1}}>
        {/* CSS for Article Content */}
        <style>{`
                    .article-content {
                        font-family: 'Georgia', serif;
                        color: #2c3e50;
                        line-height: 1.8;
                        font-size: 17px;
                    }
                    .article-content h1, .article-content h2, .article-content h3 {
                        color: #A31D1D;
                        font-family: 'Playfair Display', serif;
                        margin-top: 1.5em;
                        margin-bottom: 0.8em;
                        font-weight: 700;
                    }
                    .article-content h1 { font-size: 28px; }
                    .article-content h2 { font-size: 24px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; }
                    .article-content h3 { font-size: 20px; }
                    .article-content p { margin-bottom: 1.5em; text-align: justify; }
                    .article-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    .article-content blockquote {
                        border-left: 4px solid #faad14;
                        padding-left: 20px;
                        margin: 20px 0;
                        font-style: italic;
                        color: #595959;
                        background: #fffbe6;
                        padding: 16px 20px;
                        border-radius: 0 8px 8px 0;
                    }
                    .article-content ul, .article-content ol {
                        margin-bottom: 1.5em;
                        padding-left: 24px;
                    }
                    .article-content li {
                        margin-bottom: 0.5em;
                    }
                    .article-content strong {
                        color: #5c0011;
                    }

                    /* Video Responsive Styles */
                    .video-wrapper iframe,
                    .video-wrapper object,
                    .video-wrapper embed {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border-radius: 12px;
                    }
                    
                    /* Custom Radio Styles - Hide default Ant Radio */
                    .custom-radio .ant-radio {
                        display: none;
                    }
                    .custom-radio {
                        align-items: center;
                    }
                    .custom-radio .ant-radio + * {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                        width: 100%;
                    }
                `}</style>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <AnimatePresence mode="wait">
              {currentStep === "content" && (
                <motion.div
                  key="content-step"
                  initial={{y: 20, opacity: 0}}
                  animate={{y: 0, opacity: 1}}
                  exit={{y: -20, opacity: 0}}
                  transition={{duration: 0.4}}
                >
                  {/* Main Content Card */}
                  <Card
                    bordered={false}
                    style={{
                      maxWidth: 880,
                      margin: "0 auto 32px auto",
                      overflow: "hidden",
                    }}
                    bodyStyle={{padding: "40px"}}
                  >
                    <div style={{display: "flex", alignItems: "center", gap: 12, marginBottom: 20}}>
                      <Tag
                        color="#A31D1D"
                        style={{padding: "4px 16px", borderRadius: 20, fontWeight: 600, border: "none", color: "white"}}
                      >
                        {module.contentType?.toUpperCase()}
                      </Tag>
                      <Tag
                        icon={<FireFilled />}
                        color="#faad14"
                        style={{borderRadius: 20, border: "none", color: "#fff", fontWeight: 600, padding: "4px 12px"}}
                      >
                        {module.difficulty?.toUpperCase() || "EASY"}
                      </Tag>
                    </div>

                    <Title
                      level={1}
                      style={{marginBottom: 16, fontSize: 36, fontFamily: "serif", color: "#1f1f1f", lineHeight: 1.3}}
                    >
                      {module.title}
                    </Title>

                    <Paragraph
                      type="secondary"
                      style={{fontSize: 18, lineHeight: 1.7, marginBottom: 32, maxWidth: "90%"}}
                    >
                      {module.description}
                    </Paragraph>

                    <Divider style={{margin: "24px 0", borderTop: "1px solid #f0f0f0"}} />

                    {/* Content Renderer */}
                    {/* Content Renderer */}
                    {module.contentType === "video" ? (
                      <div
                        style={{
                          position: "relative",
                          paddingBottom: "56.25%" /* 16:9 Aspect Ratio */,
                          height: 0,
                          marginBottom: 32,
                          borderRadius: 16,
                          overflow: "hidden",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          background: "#000",
                        }}
                        className="video-wrapper"
                      >
                        {(() => {
                          const embedSrc = getEmbedUrl(module.contentUrl);
                          if (module.contentUrl?.trim().startsWith("<")) {
                            return (
                              <div
                                dangerouslySetInnerHTML={{__html: module.contentUrl}}
                                style={{width: "100%", height: "100%"}}
                              />
                            );
                          }

                          if (!embedSrc) {
                            return (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "rgba(255,255,255,0.7)",
                                  background: "#1f1f1f",
                                }}
                              >
                                <CloseCircleFilled style={{fontSize: 32, marginBottom: 8}} />
                                <Text style={{color: "rgba(255,255,255,0.7)"}}>Video không khả dụng hoặc Link lỗi</Text>
                                <Text type="secondary" style={{fontSize: 12, marginTop: 4}}>
                                  {module.contentUrl}
                                </Text>
                              </div>
                            );
                          }

                          return (
                            <iframe
                              src={embedSrc}
                              title={module.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              referrerPolicy="origin"
                            />
                          );
                        })()}
                      </div>
                    ) : (
                      /* Render other types (article, quiz text, etc.) as HTML content */
                      <div className="article-content" style={{marginTop: 24}}>
                        <div dangerouslySetInnerHTML={{__html: module.contentUrl || ""}} />
                      </div>
                    )}

                    <div style={{marginTop: 60, textAlign: "center"}}>
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleNextStep}
                        style={{
                          height: 48,
                          padding: "0 48px",
                          fontSize: 16,
                          transition: "all 0.3s",
                        }}
                      >
                        {module.quiz ? "Làm bài kiểm tra ngay" : "Hoàn thành bài học"}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {currentStep === "quiz" && module.quiz && (
                <motion.div
                  key="quiz-step"
                  initial={{x: 20, opacity: 0}}
                  animate={{x: 0, opacity: 1}}
                  exit={{x: 20, opacity: 0}}
                  transition={{duration: 0.4}}
                >
                  <div style={{position: "relative"}}>
                    {/* Main Content: Strictly Centered */}
                    <div style={{maxWidth: 880, margin: "0 auto", paddingBottom: 60, position: "relative"}}>
                      <Card
                        bordered={false}
                        id="quiz-section"
                        style={{
                          borderRadius: 20,
                          padding: 0,
                          overflow: "hidden",
                        }}
                        bodyStyle={{padding: 0}}
                      >
                        <div
                          style={{
                            background: "linear-gradient(135deg, #870000 0%, #A31D1D 100%)",
                            padding: "32px 40px",
                            color: "white",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <div style={{position: "relative", zIndex: 1}}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                              }}
                            >
                              <Title
                                level={2}
                                style={{
                                  color: "#ffffff",
                                  margin: 0,
                                  fontSize: 24,
                                  fontFamily: "serif",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <QuestionCircleOutlined style={{color: "#ffffff"}} /> <span style={{color: "#ffffff"}}>KIỂM TRA KIẾN THỨC</span>
                              </Title>

                              <div style={{display: "flex", gap: 10}}>
                                <span
                                  style={{
                                    background: "rgba(255, 255, 255, 0.2)",
                                    color: "white",
                                    padding: "4px 12px",
                                    borderRadius: 20,
                                    fontWeight: 800,
                                    fontSize: 11,
                                    letterSpacing: 1,
                                    backdropFilter: "blur(4px)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                  }}
                                >
                                  ARTICLE
                                </span>
                                <span
                                  style={{
                                    background: "#faad14",
                                    color: "white",
                                    padding: "4px 12px",
                                    borderRadius: 20,
                                    fontWeight: 800,
                                    fontSize: 11,
                                    letterSpacing: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                  }}
                                >
                                  <FireFilled />
                                  {(module.difficulty || "MEDIUM").toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <p style={{color: "rgba(255,255,255,0.9)", marginTop: 0, fontSize: 16}}>
                              Hãy trả lời các câu hỏi sau để nhận thêm cúp.
                            </p>
                          </div>
                          {/* Decorative Circles */}
                          <div
                            style={{
                              position: "absolute",
                              top: -40,
                              right: -40,
                              width: 200,
                              height: 200,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.04)",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: -40,
                              left: 20,
                              width: 140,
                              height: 140,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.03)",
                            }}
                          />
                        </div>

                        <div style={{padding: "24px 32px"}}>
                          {module.quiz.questions.map((q, idx) => (
                            <div key={q.id || idx} style={{marginBottom: 24}}>
                              <div style={{marginBottom: 12}}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    background: "#fff1f0",
                                    color: "#A31D1D",
                                    fontWeight: 700,
                                    padding: "4px 10px",
                                    borderRadius: 6,
                                    fontSize: 12,
                                    marginBottom: 6,
                                  }}
                                >
                                  CÂU HỎI {idx + 1}
                                </span>
                                <Title
                                  level={4}
                                  style={{
                                    marginTop: 4,
                                    marginBottom: 0,
                                    color: "#262626",
                                    fontSize: 16,
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {q.question}
                                </Title>
                              </div>

                              <Radio.Group
                                onChange={(e) => handleAnswerChange(q.id || idx, e.target.value)}
                                value={answers[q.id || idx]}
                                style={{width: "100%"}}
                              >
                                <Row gutter={[12, 12]}>
                                  {q.options.map((opt, optIdx) => (
                                    <Col xs={24} key={optIdx}>
                                      <Radio
                                        value={optIdx}
                                        className="custom-radio"
                                        style={{
                                          width: "100%",
                                          padding: "12px 16px",
                                          border: answers[q.id] === optIdx ? "2px solid #A31D1D" : "2px solid #f0f0f0",
                                          borderRadius: 12,
                                          background: answers[q.id] === optIdx ? "#fff1f0" : "white",
                                          transition: "all 0.2s",
                                          display: "flex",
                                          alignItems: "center",
                                          fontSize: 14,
                                          color: answers[q.id] === optIdx ? "#A31D1D" : "#434343",
                                          fontWeight: answers[q.id] === optIdx ? 600 : 400,
                                        }}
                                      >
                                        <div style={{display: "flex", gap: 12, width: "100%"}}>
                                          <div
                                            style={{
                                              minWidth: 24,
                                              height: 24,
                                              borderRadius: "50%",
                                              border: `1.5px solid ${answers[q.id] === optIdx ? "#A31D1D" : "#d9d9d9"}`,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: 11,
                                              fontWeight: 700,
                                              color: answers[q.id] === optIdx ? "#A31D1D" : "#bfbfbf",
                                              marginTop: 1,
                                            }}
                                          >
                                            {String.fromCharCode(65 + optIdx)}
                                          </div>
                                          <span style={{lineHeight: 1.5}}>{opt}</span>
                                        </div>
                                      </Radio>
                                    </Col>
                                  ))}
                                </Row>
                              </Radio.Group>
                            </div>
                          ))}
                        </div>
                      </Card>

                      {/* Micro-Pill Docked Toolbar */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: "100%",
                          height: "100%",
                          paddingLeft: 40,
                          zIndex: 100,
                        }}
                      >
                        <div style={{position: "sticky", top: 140, width: 80}}>
                          <Card
                            bordered={false}
                            style={{
                              borderRadius: 40,
                              boxShadow: "0 8px 32px rgba(163, 29, 29, 0.15)",
                              overflow: "hidden",
                              background: "rgba(255, 255, 255, 0.95)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                            bodyStyle={{
                              padding: "24px 0",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 24,
                            }}
                          >
                            {/* Timer */}
                            <Tooltip title="Thời gian làm bài còn lại">
                              <div
                                style={{
                                  width: 52,
                                  height: 52,
                                  borderRadius: "50%",
                                  background: timeLeft < 60 ? "#fff1f0" : "#e6f7ff", // Red if < 1 min
                                  border: `2px solid ${timeLeft < 60 ? "#ff4d4f" : "#1890ff"}`,
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: timeLeft < 60 ? "#ff4d4f" : "#1890ff",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  transition: "all 0.3s",
                                }}
                              >
                                <ClockCircleOutlined style={{fontSize: 14, marginBottom: 2}} />
                                <div style={{fontSize: 12, fontWeight: 800, lineHeight: 1}}>{formatTime(timeLeft)}</div>
                              </div>
                            </Tooltip>

                            <div style={{width: 32, height: 1, background: "#f0f0f0"}} />

                            {/* Progress Circle */}
                            <Tooltip
                              title={`Đã làm: ${Object.keys(answers).length}/${module.quiz.questions.length} câu`}
                            >
                              <div style={{cursor: "help"}}>
                                <Progress
                                  type="circle"
                                  percent={Math.round(
                                    (Object.keys(answers).length / module.quiz.questions.length) * 100,
                                  )}
                                  width={52}
                                  strokeColor={{"0%": "#A31D1D", "100%": "#faad14"}}
                                  strokeWidth={8}
                                  trailColor="#f0f0f0"
                                  format={() => (
                                    <div style={{fontSize: 12, fontWeight: 800, color: "#A31D1D", lineHeight: 1}}>
                                      {Object.keys(answers).length}
                                      <div style={{fontSize: 10, color: "#bfbfbf", fontWeight: 600}}>
                                        /{module.quiz?.questions?.length || 0}
                                      </div>
                                    </div>
                                  )}
                                />
                              </div>
                            </Tooltip>

                            <div style={{width: 32, height: 1, background: "#f0f0f0"}} />

                            {/* Reward Info */}
                            <Tooltip title="Phần thưởng: +50 EXP">
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  background: "#fff7e6",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#faad14",
                                  fontSize: 20,
                                }}
                              >
                                <StarFilled />
                              </div>
                            </Tooltip>

                            {/* Passing Score Info */}
                            <Tooltip title={`Cần đạt: ${module.quiz.passingScore || 70}/100 cúp`}>
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  background: "#f5f5f5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#595959",
                                  fontSize: 18,
                                  fontWeight: 700,
                                  fontFamily: "serif",
                                }}
                              >
                                70
                              </div>
                            </Tooltip>

                            <div style={{width: 32, height: 1, background: "#f0f0f0"}} />

                            {/* Submit Button */}
                            <Tooltip
                              title={
                                Object.keys(answers).length < module.quiz.questions.length
                                  ? "Vui lòng hoàn thành tất cả câu hỏi"
                                  : "Nộp bài ngay"
                              }
                            >
                              <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                onClick={handleQuizSubmit}
                                loading={submitting}
                                disabled={Object.keys(answers).length < module.quiz.questions.length}
                                style={{
                                  width: 56,
                                  height: 56,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "linear-gradient(135deg, #A31D1D 0%, #800000 100%)",
                                  border: "none",
                                  opacity: Object.keys(answers).length < module.quiz.questions.length ? 0.5 : 1,
                                  boxShadow: "0 8px 20px rgba(163, 29, 29, 0.3)",
                                }}
                                icon={<CheckOutlined style={{fontSize: 24, fontWeight: "bold"}} />}
                              />
                            </Tooltip>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LearningDetail;
