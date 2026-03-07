import React from "react";
import { RocketFilled, PlayCircleOutlined, CheckCircleFilled, SyncOutlined } from "@ant-design/icons";
import { Card, Typography, Divider, Tag } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LearningModule } from "@/services/learning.service";
import { getYouTubeEmbedUrl } from "@/utils/youtube.helper";
import Button from "@/components/common/Button";

const { Title, Paragraph } = Typography;

interface LessonContentProps {
  module: LearningModule;
  onContinue: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({ module, onContinue }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card className="detail-card main-content-card">
      <div className="article-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title style={{ margin: 0 }}>{module.title}</Title>
          {module.isCompleted && (
            <Tag color="#52c41a" icon={<CheckCircleFilled />} style={{ padding: '0 12px', height: 28, display: 'inline-flex', alignItems: 'center', fontSize: 14 }}>
              {t('gameLearning.card.completed')}
            </Tag>
          )}
        </div>
        <Paragraph className="description">{module.description}</Paragraph>

        <div style={{
          display: 'flex',
          gap: 24,
          background: 'rgba(212, 175, 55, 0.05)',
          padding: '12px 20px',
          borderRadius: 8,
          border: '1px solid rgba(212, 175, 55, 0.2)',
          marginBottom: 24,
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 600, color: 'var(--gold-text)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {module.isCompleted ? t('gameLearning.detail.reviewRewards') : t('gameLearning.detail.rewards')}
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500,
              opacity: (module.isCompleted && (module.reviewCount || 0) >= (module.maxReviewRewards || 3)) ? 0.4 : 1
            }}>
              <span style={{ fontSize: 18 }}>🏆</span>
              {module.isCompleted ? (module.reviewRewardPoints || 0) : (module.rewardPoints || 0)}
              <span style={{ fontSize: 12, opacity: 0.7 }}>Cúp</span>
            </span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500,
              opacity: (module.isCompleted && (module.reviewCount || 0) >= (module.maxReviewRewards || 3)) ? 0.4 : 1
            }}>
              <span style={{ fontSize: 18 }}>🪙</span>
              {module.isCompleted ? (module.reviewRewardCoins || 0) : (module.rewardCoins || 0)}
              <span style={{ fontSize: 12, opacity: 0.7 }}>Xu</span>
            </span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500,
              opacity: (module.isCompleted && (module.reviewCount || 0) >= (module.maxReviewRewards || 3)) ? 0.4 : 1
            }}>
              <span style={{ fontSize: 18 }}>🪷</span>
              {module.isCompleted ? (module.reviewRewardPetals || 0) : (module.rewardPetals || 0)}
              <span style={{ fontSize: 12, opacity: 0.7 }}>Sen hoa</span>
            </span>
          </div>

          {module.isCompleted && (
            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(212, 175, 55, 0.6)', fontWeight: 500 }}>
              Tiến độ ôn tập: {module.reviewCount || 0}/{module.maxReviewRewards || 3}
              {(module.reviewCount || 0) >= (module.maxReviewRewards || 3) && (
                <span style={{ marginLeft: 8, color: '#ff4d4f' }}>(Đã hết thưởng)</span>
              )}
            </div>
          )}
        </div>

        {module.contentType === "video" && module.contentUrl && (
          <div className="video-wrapper">
            <iframe
              src={getYouTubeEmbedUrl(module.contentUrl || undefined)}
              title={module.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {module.contentType === "interactive" && (
          <div className="interactive-wrapper" style={{ textAlign: "center", margin: "32px 0", position: "relative" }}>
            <div
              style={{
                background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${module.thumbnail || "/images/hoatiettrongdong.png"}) center/cover`,
                borderRadius: 16,
                padding: "60px 20px",
                border: "2px solid var(--gold-border)",
                boxShadow: "0 8px 24px rgba(168, 7, 26, 0.15)"
              }}
            >
              <h3 style={{ color: "#fff", fontFamily: "var(--font-serif)", fontSize: 24, marginBottom: 16 }}>
                {t('gameLearning.detail.interactiveTitle')}
              </h3>
              <Button
                variant={module.isCompleted ? "secondary" : "primary"}
                buttonSize="large"
                icon={module.isCompleted ? <SyncOutlined /> : <PlayCircleOutlined />}
                onClick={() => navigate(module.contentUrl || "/game/chapters")}
                style={{ fontSize: 18, padding: "0 32px", height: 48 }}
              >
                {module.isCompleted ? t('gameLearning.detail.playAgainBtn') : t('gameLearning.detail.playGameBtn')}
              </Button>
            </div>
          </div>
        )}

        <Divider className="content-divider" />

        {/* The description is already shown at the top, no need to duplicate it here unless there's dedicated rich text content */}

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <Button
            variant="primary"
            buttonSize="large"
            icon={<RocketFilled />}
            onClick={onContinue}
            className="continue-btn"
          >
            {module.quiz ? t('gameLearning.quiz.startQuiz') : t('gameLearning.detail.nextStep.complete')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LessonContent;

