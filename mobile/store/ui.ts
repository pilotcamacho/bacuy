import { create } from 'zustand';

type ColorScheme = 'light' | 'dark' | 'auto';
type Language = 'en' | 'es';

interface UIState {
  language: Language;
  colorScheme: ColorScheme;
  setLanguage: (language: Language) => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  language: 'en',
  colorScheme: 'auto',
  setLanguage: (language) => set({ language }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
}));
