import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  fetchLevelsByChapter,
  setCurrentLevel,
} from "@/store/slices/gameSlice";
import { Button, Spin, Typography, Progress, Switch, Tooltip } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import type { Level } from "@/types";
import "./styles.less";

import lotus_1 from "@/assets/images/background/lotus-1.png";
import lotus_2 from "@/assets/images/background/lotus-2.png";

const { Title } = Typography;
import ChapterMap from "@/components/Game/ChapterMap";

const LevelsPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { levels, levelsLoading, currentChapter } = useAppSelector(
    (state) => state.game,
  );
  
  // Controls validity of card "Always On" mode
  const [showDetailCards, setShowDetailCards] = React.useState(true);

  useEffect(() => {
    if (chapterId) {
      dispatch(fetchLevelsByChapter(Number(chapterId)));
    }
  }, [dispatch, chapterId, levels?.length, currentChapter?.id]); // Refetch if chapter mismatches or initially

  // ✅ Force refetch when progress changes (level completed)
  const { progress } = useAppSelector((state) => state.game); // Needs to be destructured from state.game
  
  useEffect(() => {
    if (chapterId) {
       dispatch(fetchLevelsByChapter(Number(chapterId)));
    }
  }, [dispatch, chapterId, progress?.completed_levels]); // Re-run when completion status changes

  const handleStartLevel = (level: Level) => {
    if (!level.is_locked) {
      dispatch(setCurrentLevel(level));
      navigate(`/game/play/${level.id}`);
    }
  };

  const currentActiveLevelId = levels?.find(
    (l) => !l.is_completed && !l.is_locked,
  )?.id;

  if (levelsLoading)
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  if (!levels || levels.length === 0) return null;

  return (
    <div className="levels-page-container">
      {/* BACKGROUND DECORATIONS - Kept in Page for now or move to layout */}
      <div className="decorative-background">
          <div className="bg-lotus-container">
             <img src={lotus_1} className="bg-lotus lotus-1" alt="Lotus" />
             <img src={lotus_2} className="bg-lotus lotus-2" alt="Lotus" />
          </div>
      </div>

      {/* HEADER */}
      <div className="fixed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          type="link"
          icon={<span>←</span>}
          onClick={() => navigate("/game/chapters")}
        >
          Trở về
        </Button>

        {currentChapter && (
           <div className="chapter-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Title level={5} style={{ margin: 0 }}>
              {currentChapter.name}
            </Title>
            <Progress
              percent={currentChapter.completion_rate}
              showInfo={false}
              strokeColor="#1f5f25"
              trailColor="#e5e5e5"
              size="small"
              style={{ width: 100 }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <Typography.Text style={{ fontSize: 12 }}>Chi tiết</Typography.Text>
           <Tooltip title="Bấm vào đây để thêm thẻ màn chơi"><Switch 
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
              checked={showDetailCards}
              onChange={(checked) => setShowDetailCards(checked)}
           /></Tooltip>
        </div>
      </div>

      {/* MAP AREA */}
      <ChapterMap 
          levels={levels} 
          currentActiveLevelId={currentActiveLevelId} 
          onLevelClick={handleStartLevel}
          showDetailCards={showDetailCards}
      />
    </div>
  );
};

export default LevelsPage;
