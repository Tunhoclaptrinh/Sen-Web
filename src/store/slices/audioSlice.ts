import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AudioState {
  isMuted: boolean;
  bgmVolume: number;
  sfxVolume: number;
  selectedBgmKey: string | null;
  isBgmAutoMuted: boolean;
  userInteracted: boolean;
}

const initialState: AudioState = {
  isMuted: localStorage.getItem('isMuted') === 'true',
  bgmVolume: parseFloat(localStorage.getItem('bgmVolume') || '0.5'),
  sfxVolume: parseFloat(localStorage.getItem('sfxVolume') || '1.0'),
  selectedBgmKey: localStorage.getItem('selectedBgmKey') || null,
  isBgmAutoMuted: false,
  userInteracted: false,
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
  },
});

export const {
  setMuted,
  setBgmVolume,
  setSfxVolume,
  toggleMute,
  setSelectedBgmKey,
  setBgmAutoMuted,
  setUserInteracted
} = audioSlice.actions;

export default audioSlice.reducer;
