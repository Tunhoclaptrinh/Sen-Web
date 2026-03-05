import React, { useState } from "react";
import { Button } from "antd";
import {
  TrophyOutlined,
  GiftOutlined,
  MessageOutlined,
  UserOutlined,
  BookOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { RootState } from "@/store";
import { setOverlayOpen } from "@/store/slices/aiSlice";
import { fetchProgress } from "@/store/slices/gameSlice";
import { SOUND_ASSETS } from "@/hooks/useSound";
import { getImageUrl } from "@/utils/image.helper";
import AudioSettingsPopover from "@/components/Game/AudioSettingsPopover";
import { useGameSounds } from "@/hooks/useSound";
import { SoundOutlined, MutedOutlined } from "@ant-design/icons";
import UnifiedLayout from "../UnifiedLayout";
import "./styles.less";
import { customerMenu } from "@/config/menu.config";
import NotificationPopover from "@/components/common/NotificationPopover";
import DailyRewardModal from "@/components/common/DailyRewardModal";

const CustomerLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { progress } = useSelector((state: RootState) => state.game);

  const [dailyRewardVisible, setDailyRewardVisible] = useState(false);
  const location = useLocation();
  const { playClick } = useGameSounds();

  // BGM Logic
  const { isMuted, bgmVolume, selectedBgmKey, isBgmAutoMuted } = useSelector((state: RootState) => state.audio);
  const { currentLevel } = useSelector((state: RootState) => state.game);
  const bgmAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const fadeRef = React.useRef<{ interval: NodeJS.Timeout | null, targetVolume: number }>({ interval: null, targetVolume: 0 });

  React.useEffect(() => {
    // Determine music path: Priority Level BGM > Selected BGM > Default BGM
    let musicPath = SOUND_ASSETS.BGM_HISTORICAL;

    // If a specific level has its own music, it takes top priority for atmosphere
    if (currentLevel?.backgroundMusic) {
      musicPath = currentLevel.backgroundMusic;
    } else if (selectedBgmKey && (SOUND_ASSETS as any)[selectedBgmKey]) {
      musicPath = (SOUND_ASSETS as any)[selectedBgmKey];
    }

    if (!musicPath) return;

    const bgmUrl = getImageUrl(musicPath);
    const fullUrl = new URL(bgmUrl, window.location.origin).href;
    const targetVolume = (isMuted || isBgmAutoMuted) ? 0 : bgmVolume;

    const fadeTo = (audio: HTMLAudioElement, target: number, onComplete?: () => void) => {
      if (fadeRef.current.interval) clearInterval(fadeRef.current.interval);

      const step = 0.05;
      const intervalTime = 50;

      fadeRef.current.interval = setInterval(() => {
        if (Math.abs(audio.volume - target) < step) {
          audio.volume = target;
          clearInterval(fadeRef.current.interval!);
          fadeRef.current.interval = null;
          if (onComplete) onComplete();
        } else {
          audio.volume += audio.volume < target ? step : -step;
        }
      }, intervalTime);
    };

    if (!bgmAudioRef.current) {
      bgmAudioRef.current = new Audio(fullUrl);
      bgmAudioRef.current.loop = true;
      bgmAudioRef.current.volume = 0;
      if (!isMuted) {
        bgmAudioRef.current.play().then(() => fadeTo(bgmAudioRef.current!, targetVolume)).catch(e => console.warn(e));
      }
    } else {
      const currentSrc = new URL(bgmAudioRef.current.src, window.location.origin).href;

      if (currentSrc !== fullUrl) {
        // Transition to new track: Fade Out -> Change Src -> Fade In
        fadeTo(bgmAudioRef.current, 0, () => {
          if (!bgmAudioRef.current) return;
          bgmAudioRef.current.src = fullUrl;
          if (!isMuted) {
            bgmAudioRef.current.play().then(() => fadeTo(bgmAudioRef.current!, targetVolume)).catch(e => console.warn(e));
          }
        });
      } else {
        // Same track, just adjust volume (with fade for smoothness)
        fadeTo(bgmAudioRef.current, targetVolume);
      }
    }

    return () => { };
  }, [currentLevel?.id, currentLevel?.backgroundMusic, isMuted, bgmVolume, selectedBgmKey]);

  // Stop BGM when unmounting layout
  React.useEffect(() => {
    return () => {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    dispatch(fetchProgress() as any);
  }, [dispatch, location.pathname]);

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate("/login");
  };

  const userMenuExtraItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
      onClick: () => navigate("/profile"),
    },
    {
      key: "collections",
      icon: <BookOutlined />,
      label: "Bộ sưu tập",
      onClick: () => navigate("/profile/library"),
    },
    {
      type: "divider",
    },
  ];

  return (
    <div className="customer-layout-wrapper sen-hoa-premium">
      <UnifiedLayout
        menu={{ request: async () => customerMenu }}
        user={user || undefined}
        onLogout={handleLogout}
        userMenuExtraItems={userMenuExtraItems}
        navTheme="light"
        actionsRender={() => [
          <div
            className="progress-stats"
            key="stats"
            style={{ display: "flex", gap: 16, alignItems: "center", marginRight: 12, pointerEvents: "none" }}
          >
            <div className="stat-item" style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <TrophyOutlined style={{ color: "#ffd700" }} />
              <span>{progress?.totalPoints || 0}</span>
            </div>
            <div className="stat-item" style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>🌸</span>
              <span>{progress?.totalSenPetals || 0}</span>
            </div>
            <div className="stat-item" style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <DollarOutlined style={{ fontSize: 16, color: "#ffd700" }} />
              <span>{progress?.coins || 0}</span>
            </div>
          </div>,
          <Button
            key="gift"
            type="text"
            className="header-action-btn"
            icon={<GiftOutlined />}
            onClick={() => {
              playClick();
              setDailyRewardVisible(true);
            }}
          />,
          <Button
            key="chat"
            type="text"
            className="header-action-btn"
            icon={<MessageOutlined />}
            onClick={() => {
              playClick();
              dispatch(setOverlayOpen({ open: true, mode: "fixed" }));
            }}
          />,
          <NotificationPopover key="bell" />,
          <AudioSettingsPopover key="audio">
            <Button
              type="text"
              className="header-action-btn"
              icon={isMuted ? <MutedOutlined /> : <SoundOutlined />}
              title="Cài đặt âm thanh"
            />
          </AudioSettingsPopover>,
        ]}
      >
        <Outlet />
      </UnifiedLayout>

      <DailyRewardModal visible={dailyRewardVisible} onClose={() => setDailyRewardVisible(false)} />
    </div>
  );
};

export default CustomerLayout;
