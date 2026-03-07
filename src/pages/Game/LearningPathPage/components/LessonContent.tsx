import React from "react";
import { Card, Typography, Divider } from "antd";
import { RocketFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
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

  return (
    <Card className="detail-card main-content-card">
      <div className="article-content">
        <Title>{module.title}</Title>
        <Paragraph className="description">{module.description}</Paragraph>

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
