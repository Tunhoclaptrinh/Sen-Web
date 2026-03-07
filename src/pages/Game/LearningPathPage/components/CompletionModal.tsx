import { Modal, Typography, Tag } from "antd";
import { CheckCircleFilled, TrophyFilled, CloseCircleFilled } from "@ant-design/icons";
import { motion } from "framer-motion";
import { TFunction } from "i18next";

const { Title, Text } = Typography;

export const showCompletionModal = (
  t: TFunction,
  data: {
    passed: boolean;
    score: number;
    pointsEarned: number;
    coinsEarned?: number;
    isLevelUp?: boolean;
    newLevel?: number;
    neededScore?: number;
  },
  onAction: (success: boolean) => void,
  playSuccess: () => void,
  playError: () => void,
) => {
  if (data.passed) {
    playSuccess();
    Modal.success({
      title: null,
      icon: null,
      width: 500,
      className: "completion-modal",
      content: (
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <CheckCircleFilled style={{ fontSize: 64, color: "#52c41a", marginBottom: 16 }} />
          </motion.div>

          <Title level={2} style={{ color: "#52c41a", marginBottom: 8 }}>
            {t('gameLearning.quiz.completion.success.title')}
          </Title>
          <Text style={{ fontSize: 16, color: "#555" }}>{t('gameLearning.quiz.completion.success.subtitle')}</Text>

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
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#52c41a" }}>{data.score}</div>
              <div style={{ fontSize: 18, color: "#8c8c8c", marginLeft: 4 }}>/ {data.neededScore || 70}</div>
            </div>
            <Text type="secondary">{t('gameLearning.quiz.completion.success.scoreLabel')}</Text>
          </div>

          {data.isLevelUp && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: 24 }}>
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
                <TrophyFilled /> {t('gameLearning.quiz.completion.success.levelUp')} {data.newLevel}
              </Tag>
            </motion.div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
            {data.pointsEarned > 0 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#faad14", fontSize: 20, fontWeight: "bold" }}>
                  +{data.pointsEarned}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t('gameLearning.quiz.completion.success.pointsLabel')}
                </Text>
              </div>
            )}
            {data.coinsEarned && data.coinsEarned > 0 ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#eb2f96", fontSize: 20, fontWeight: "bold" }}>
                  +{data.coinsEarned} 🪙
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Xu thưởng
                </Text>
              </div>
            ) : null}
          </div>
        </div>
      ),
      okText: t('gameLearning.quiz.completion.success.action'),
      centered: true,
      okButtonProps: {
        size: "large",
        shape: "round",
        style: { background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)", border: "none" },
      },
      onOk: () => onAction(true),
    });
  } else {
    playError();
    Modal.warning({
      title: t('gameLearning.quiz.completion.failure.title'),
      icon: <CloseCircleFilled style={{ color: "#ff4d4f" }} />,
      content: (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', marginBottom: 8 }}>
            <Title level={2} style={{ color: "#ff4d4f", margin: 0 }}>
              {data.score}
            </Title>
            <div style={{ fontSize: 18, color: "#8c8c8c", marginLeft: 4 }}>/ {data.neededScore || 70}</div>
          </div>
          <Text type="secondary">{t('gameLearning.quiz.completion.failure.neededScore', { score: data.neededScore || 70 })}</Text>
          <p style={{ marginTop: 16 }}>{t('gameLearning.quiz.completion.failure.encouragement')}</p>
        </div>
      ),
      okText: t('gameLearning.quiz.completion.failure.action'),
      centered: true,
      okButtonProps: { size: "large", shape: "round", danger: true },
      onOk: () => onAction(false),
    });
  }
};
