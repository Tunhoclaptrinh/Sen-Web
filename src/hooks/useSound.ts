import useSoundLib from 'use-sound';
import { useAppSelector } from '@/store/hooks';
import { useLocation } from 'react-router-dom';

// Central mapping of sound names to file paths
// - UI Sounds from: /sounds/kenney_ui-audio/
// - Game SFX from: /sounds/kenney_digital-audio/
// - BGM from: /sounds/bgm/

export const SOUND_ASSETS = {
  // 1. UI Actions (Kenney UI Audio)
  CLICK: '/sounds/kenney_ui-audio/Audio/click1.ogg',

  // 2. Game Feedback (Kenney Digital Audio)
  SUCCESS: '/sounds/kenney_digital-audio/Audio/powerUp7.ogg',
  ERROR: '/sounds/kenney_digital-audio/Audio/laser1.ogg',
  COLLECT: '/sounds/kenney_digital-audio/Audio/powerUp1.ogg',
  LEVEL_WIN: '/sounds/kenney_digital-audio/Audio/powerUpC.ogg',

  // 3. Background Music (Tabletop Audio - Managed in /public/sounds/bgm/)
  BGM_HISTORICAL: '/sounds/bgm/73_Medieval_Library.mp3', // Default theme
  BGM_VILLAGE: '/sounds/bgm/500_Village_Festival.mp3',
  BGM_ANCIENT: '/sounds/bgm/42_Rise_of_the_Ancients.mp3',
  BGM_STONE: '/sounds/bgm/490_Stone_Barrow.mp3',
};

export type SoundName = keyof typeof SOUND_ASSETS;

export const useSound = (soundName: SoundName) => {
  const { isMuted, sfxVolume, isEmbeddedZoneActive } = useAppSelector((state) => state.audio);
  const { pathname } = useLocation();
  const isGamePath = pathname.startsWith('/game/');
  const shouldPlaySound = isGamePath || isEmbeddedZoneActive;

  const [play] = useSoundLib(SOUND_ASSETS[soundName], {
    volume: (isMuted || !shouldPlaySound) ? 0 : sfxVolume,
  });


  return { play };
};

/**
 * A more flexible hook that allows playing multiple sounds
 */
export const useGameSounds = () => {
  const { isMuted, sfxVolume, isEmbeddedZoneActive } = useAppSelector((state) => state.audio);
  const { pathname } = useLocation();
  const isGamePath = pathname.startsWith('/game/');
  const shouldPlaySound = isGamePath || isEmbeddedZoneActive;

  const volume = (isMuted || !shouldPlaySound) ? 0 : sfxVolume;


  const [playClick] = useSoundLib(SOUND_ASSETS.CLICK, { volume });
  const [playSuccess] = useSoundLib(SOUND_ASSETS.SUCCESS, { volume });
  const [playError] = useSoundLib(SOUND_ASSETS.ERROR, { volume });
  const [playCollect] = useSoundLib(SOUND_ASSETS.COLLECT, { volume });
  const [playWin] = useSoundLib(SOUND_ASSETS.LEVEL_WIN, { volume });

  return {
    playClick,
    playSuccess,
    playError,
    playCollect,
    playWin
  };
};
