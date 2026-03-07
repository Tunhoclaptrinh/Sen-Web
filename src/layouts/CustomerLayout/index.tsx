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
import GameLanguageSwitcher from "@/components/Game/GameLanguageSwitcher";
import { useTranslation } from "react-i18next";

const CustomerLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { progress } = useSelector((state: RootState) => state.game);

  const [dailyRewardVisible, setDailyRewardVisible] = useState(false);
  const location = useLocation();
  const { playClick } = useGameSounds();

  // BGM Logic
  const { isMuted, bgmVolume, selectedBgmKey, isBgmAutoMuted, userInteracted } = useSelector((state: RootState) => state.audio);
  const { currentLevel } = useSelector((state: RootState) => state.game);
  const bgmAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const fadeRef = React.useRef<{ interval: NodeJS.Timeout | null, targetVolume: number }>({ interval: null, targetVolume: 0 });

  // Handle User Interaction for Autoplay
  React.useEffect(() => {
    const handleInteraction = () => {
      if (!userInteracted) {
        dispatch({ type: 'audio/setUserInteracted' });
      }
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [userInteracted, dispatch]);

  React.useEffect(() => {
    // 1. Resolve level music if it exists (check keys first, then assume path)
    const levelBgmRaw = currentLevel?.backgroundMusic;
    const levelBgmResolved = levelBgmRaw ? ((SOUND_ASSETS as any)[levelBgmRaw] || levelBgmRaw) : null;
    const hasLevelMusic = !!levelBgmResolved;

    // 2. Synchronize auto-mute state for CustomBgmPlayer
    // We only set it to true if there's actual level music playing
    if (isBgmAutoMuted !== hasLevelMusic) {
      dispatch({ type: 'audio/setBgmAutoMuted', payload: hasLevelMusic });
    }

    // 3. Determine if we should let CustomBgmPlayer take control
    // If we have a custom track and NO level music is forcing priority
    if (selectedBgmKey?.startsWith("CUSTOM_") && !hasLevelMusic) {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
        bgmAudioRef.current.volume = 0;
      }
      return;
    }

    // 4. Fallback chain for built-in audio
    const musicPath =
      levelBgmResolved ||
      (selectedBgmKey && (SOUND_ASSETS as any)[selectedBgmKey]) ||
      SOUND_ASSETS.BGM_HISTORICAL;

    if (!musicPath) return;

    const bgmUrl = getImageUrl(musicPath);
    const fullUrl = new URL(bgmUrl, window.location.origin).href;
    const targetVolume = (isMuted || (hasLevelMusic ? false : isBgmAutoMuted)) ? 0 : bgmVolume;

    const fadeTo = (audio: HTMLAudioElement, target: number, onComplete?: () => void) => {
      if (fadeRef.current.interval) clearInterval(fadeRef.current.interval);

      const safeTarget = Math.max(0, Math.min(1, target));
      const step = 0.05;
      const intervalTime = 50;

      fadeRef.current.interval = setInterval(() => {
        if (!audio) {
          clearInterval(fadeRef.current.interval!);
          return;
        }

        const diff = safeTarget - audio.volume;
        if (Math.abs(diff) < step) {
          audio.volume = safeTarget;
          clearInterval(fadeRef.current.interval!);
          fadeRef.current.interval = null;
          if (onComplete) onComplete();
        } else {
          audio.volume += diff > 0 ? step : -step;
        }
      }, intervalTime);
    };

    const startPlayback = (audio: HTMLAudioElement) => {
      if (!userInteracted) return;

      audio.play().then(() => {
        fadeTo(audio, targetVolume);
      }).catch(e => {
        console.warn("BGM Play failed:", e);
        // Retry once on interaction if it failed due to some transient issue
      });
    };

    if (!bgmAudioRef.current) {
      bgmAudioRef.current = new Audio(fullUrl);
      bgmAudioRef.current.loop = true;
      bgmAudioRef.current.volume = 0;
      startPlayback(bgmAudioRef.current);
    } else {
      const currentSrc = new URL(bgmAudioRef.current.src, window.location.origin).href;

      if (currentSrc !== fullUrl) {
        // Transition: Fade Out -> Load New -> Play & Fade In
        fadeTo(bgmAudioRef.current, 0, () => {
          if (!bgmAudioRef.current) return;
          bgmAudioRef.current.src = fullUrl;
          bgmAudioRef.current.load(); // Explicitly load new source
          startPlayback(bgmAudioRef.current);
        });
      } else {
        // Same track: just sync volume or start if interaction just happened
        if (userInteracted && (bgmAudioRef.current.paused || bgmAudioRef.current.volume === 0)) {
          startPlayback(bgmAudioRef.current);
        } else {
          fadeTo(bgmAudioRef.current, targetVolume);
        }
      }
    }

    return () => { };
  }, [currentLevel?.id, currentLevel?.backgroundMusic, isMuted, bgmVolume, selectedBgmKey, isBgmAutoMuted, userInteracted]);

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
      label: t('nav.profile'),
      onClick: () => navigate("/profile"),
    },
    {
      key: "collections",
      icon: <BookOutlined />,
      label: t('nav.library'),
      onClick: () => navigate("/profile/library"),
    },
    {
      type: "divider",
    },
  ];

  return (
    <div className="customer-layout-wrapper sen-hoa-premium">
      <UnifiedLayout
        menu={{
          request: async () => customerMenu.map(item => ({
            ...item,
            name: item.disabled && item.key?.startsWith('group-')
              ? t(`gameMenu.groups.${item.key.replace('group-', '')}`)
              : t(`gameMenu.items.${item.key}`)
          }))
        }}
        user={user || undefined}
        onLogout={handleLogout}
        userMenuExtraItems={userMenuExtraItems}
        navTheme="light"
        actionsRender={() => [
          <GameLanguageSwitcher key="lang" />,

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
              title={t('header.audioSettings')}
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
