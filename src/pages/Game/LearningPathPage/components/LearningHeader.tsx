import React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface LearningHeaderProps {
  onBack: () => void;
}

const LearningHeader: React.FC<LearningHeaderProps> = ({ onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="learning-header-container">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        className="back-btn"
      >
        {t('gameLearning.detail.back')}
      </Button>
    </div>
  );
};

export default LearningHeader;
