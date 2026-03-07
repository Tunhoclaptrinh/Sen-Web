import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Result, Spin, message, Tag, Space } from "antd";
import { useTranslation } from "react-i18next";
import Button from "@/components/common/Button";
import { useGameSounds } from "@/hooks/useSound";
import { QrcodeOutlined, GiftOutlined, ArrowLeftOutlined, ReloadOutlined, EnvironmentFilled, StarFilled } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import QRScanner from "@/components/Game/QRScanner";
import { gameService } from "@/services";
import { ITEM_TYPES } from "@/config/constants";
import "./styles.less";

const { Text } = Typography;

const ScanPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null); // Scan result data
  const { playClick } = useGameSounds();

  const handleScan = async (decodedText: string) => {
    if (processing || !scanning) return;
    setScanning(false);
    setProcessing(true);

    try {

      // Check if it's a Check-in code
      if (decodedText.startsWith("CHECKIN_")) {
        const locationId = parseInt(decodedText.replace("CHECKIN_", ""));
        if (!isNaN(locationId)) {
          const res = await gameService.checkIn(locationId);
          setResult({
            success: true,
            type: "checkin",
            data: res,
          });
        } else {
          message.error(t('gameScan.errors.invalidCheckinCode'));
          setScanning(true);
        }
      }
      // Assume it's a game object/artifact code
      else {
        const res = await gameService.scanObject(decodedText);
        setResult({
          success: true,
          type: ITEM_TYPES.ARTIFACT,
          data: res,
        });
      }
    } catch (error: any) {
      console.error("Scan error:", error);
      // If error is 404/400, show failure result
      setResult({
        success: false,
        message: error.response?.data?.message || t('gameScan.errors.notFound'),
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setScanning(true);
  };

  const renderResult = () => {
    if (!result) return null;

    if (!result.success) {
      return (
        <Result
          status="error"
          title={t('gameScan.errors.scanFailed')}
          subTitle={result.message}
          extra={[
            <Button variant="primary" key="retry" icon={<ReloadOutlined />} onClick={handleReset}>
              {t('gameScan.actions.retry')}
            </Button>,
            <Button key="back" variant="outline" onClick={() => navigate(-1)}>
              {t('gameScan.actions.backHome')}
            </Button>,
          ]}
        />
      );
    }

    if (result.type === "checkin") {
      const { pointsEarned, locationName, totalCheckins } = result.data;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Result
            status="success"
            icon={
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <EnvironmentFilled style={{ color: "#8b1d1d", fontSize: 64 }} />
              </motion.div>
            }
            title={t('gameScan.checkin.success')}
            subTitle={
              <span>
                {t('gameScan.checkin.description', { locationName: locationName })}
              </span>
            }
            extra={[
              <div key="stats" className="result-stats">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Text strong style={{ fontSize: 22, color: "#faad14", display: "block", marginBottom: 8 }}>
                    {t('gameScan.checkin.meritPoints', { points: pointsEarned })}
                  </Text>
                </motion.div>
                <Text type="secondary">
                  {t('gameScan.checkin.visitCount', { count: totalCheckins })}
                </Text>
              </div>,
              <Button variant="primary" key="map" onClick={() => navigate("/map")}>
                {t('gameScan.actions.viewMap')}
              </Button>,
              <Button key="continue" variant="outline" onClick={handleReset}>
                {t('gameScan.actions.continueSearching')}
              </Button>,
            ]}
          />
        </motion.div>
      );
    }

    if (result.type === ITEM_TYPES.ARTIFACT) {
      const { artifact, rewards, isNewDiscovery, newBadges } = result.data;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Result
            status="success"
            icon={
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              >
                <GiftOutlined style={{ color: "#c5a065", fontSize: 64 }} />
              </motion.div>
            }
            title={isNewDiscovery ? t('gameScan.artifact.newDiscovery') : t('gameScan.artifact.collect')}
            subTitle={artifact.name}
            extra={[
              <motion.div
                key="artifact-img"
                className="artifact-preview"
                whileHover={{ scale: 1.05 }}
              >
                <img src={artifact.image} alt={artifact.name} />
                {isNewDiscovery && <div className="new-badge-tag">{t('gameScan.artifact.new')}</div>}
              </motion.div>,

              <div key="stats" className="result-stats">
                <Text type="secondary" style={{ display: "block", marginBottom: 12, fontStyle: "italic" }}>
                  {artifact.description}
                </Text>

                <Space size="large">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="reward-item"
                  >
                    <StarFilled style={{ color: '#faad14' }} />
                    <Text strong style={{ fontSize: 20, color: "#faad14" }}> {t('gameScan.artifact.rewards.coins', { count: rewards.coins })}</Text>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="reward-item"
                  >
                    <div className="petal-icon-mini" />
                    <Text strong style={{ fontSize: 20, color: "#eb2f96" }}> {t('gameScan.artifact.rewards.petals', { count: rewards.petals })}</Text>
                  </motion.div>
                </Space>

                {newBadges && newBadges.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">{t('gameScan.artifact.badgesFound')}</Text>
                    <div style={{ marginTop: 8 }}>
                      {newBadges.map((b: any) => (
                        <Tag key={b.id} color="purple">{b.name}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>,

              <Button variant="primary" key="collection" onClick={() => navigate("/profile/library")}>
                {t('gameScan.actions.goToLibrary')}
              </Button>,
              <Button key="continue" variant="outline" onClick={handleReset}>
                {t('gameScan.actions.continueFinding')}
              </Button>,
            ]}
          />
        </motion.div>
      );
    }
  };

  return (
    <div className="scan-page-wrapper">
      <div className="nav-back-wrapper" onClick={() => { playClick(); navigate(-1); }}>
        <button className="nav-back-btn">
          <ArrowLeftOutlined />
        </button>
      </div>

      <Card
        className="scan-card"
        title={
          <span>
            <QrcodeOutlined style={{ marginRight: 10 }} />
            {t('gameScan.card.title')}
          </span>
        }
      >
        <AnimatePresence mode="wait">
          {processing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="processing-container"
            >
              <Spin size="large" tip={t('gameScan.processing')} />
            </motion.div>
          ) : result ? (
            <div key="result">{renderResult()}</div>
          ) : (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="scanner-container"
            >
              <QRScanner onScanSuccess={handleScan} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default ScanPage;
