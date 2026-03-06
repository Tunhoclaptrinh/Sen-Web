import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AudioPlatform } from '@/utils/audioUrlUtils';

export interface CustomBgmTrack {
  id: string;
  label: string;
  url: string;         // embed URL (already converted)
  type: AudioPlatform;
  isIframe: boolean;
}

const MAX_CUSTOM_TRACKS = 10;

const loadCustomTracks = (): CustomBgmTrack[] => {
  try {
    return JSON.parse(localStorage.getItem('customBgmTracks') || '[]');
  } catch {
    return [];
  }
};

interface AudioState {
  isMuted: boolean;
  bgmVolume: number;
  sfxVolume: number;
  selectedBgmKey: string | null;
  isBgmAutoMuted: boolean;
  userInteracted: boolean;
  customBgmTracks: CustomBgmTrack[];
}

const initialState: AudioState = {
  isMuted: localStorage.getItem('isMuted') === 'true',
  bgmVolume: parseFloat(localStorage.getItem('bgmVolume') || '0.5'),
  sfxVolume: parseFloat(localStorage.getItem('sfxVolume') || '1.0'),
  selectedBgmKey: localStorage.getItem('selectedBgmKey') || null,
  isBgmAutoMuted: false,
  userInteracted: false,
  customBgmTracks: loadCustomTracks(),
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setMuted: (state, action: PayloadAction<boolean>) => {
      state.isMuted = action.payload;
      localStorage.setItem('isMuted', String(action.payload));
    },
    setBgmVolume: (state, action: PayloadAction<number>) => {
      state.bgmVolume = action.payload;
      localStorage.setItem('bgmVolume', String(action.payload));
    },
    setSfxVolume: (state, action: PayloadAction<number>) => {
      state.sfxVolume = action.payload;
      localStorage.setItem('sfxVolume', String(action.payload));
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
      localStorage.setItem('isMuted', String(state.isMuted));
    },
    setBgmAutoMuted: (state, action: PayloadAction<boolean>) => {
      state.isBgmAutoMuted = action.payload;
    },
    setUserInteracted: (state) => {
      state.userInteracted = true;
    },
    setSelectedBgmKey: (state, action: PayloadAction<string | null>) => {
      state.selectedBgmKey = action.payload;
      if (action.payload) {
        localStorage.setItem('selectedBgmKey', action.payload);
      } else {
        localStorage.removeItem('selectedBgmKey');
      }
    },
    addCustomBgmTrack: (state, action: PayloadAction<CustomBgmTrack>) => {
      if (state.customBgmTracks.length >= MAX_CUSTOM_TRACKS) {
        // Remove oldest to stay within limit
        state.customBgmTracks.shift();
      }
      state.customBgmTracks.push(action.payload);
      localStorage.setItem('customBgmTracks', JSON.stringify(state.customBgmTracks));
    },
    removeCustomBgmTrack: (state, action: PayloadAction<string>) => {
      state.customBgmTracks = state.customBgmTracks.filter(t => t.id !== action.payload);
      localStorage.setItem('customBgmTracks', JSON.stringify(state.customBgmTracks));
      // Deselect if currently selected
      if (state.selectedBgmKey === `CUSTOM_${action.payload}`) {
        state.selectedBgmKey = null;
        localStorage.removeItem('selectedBgmKey');
      }
    },
  },
});

export const {
  setMuted,
  setBgmVolume,
  setSfxVolume,
  toggleMute,
  setSelectedBgmKey,
  setBgmAutoMuted,
  setUserInteracted,
  addCustomBgmTrack,
  removeCustomBgmTrack,
} = audioSlice.actions;

export default audioSlice.reducer;
