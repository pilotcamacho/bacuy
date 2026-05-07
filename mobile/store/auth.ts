import { create } from 'zustand';
import type { User } from '@/types';
import { authSignOut } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: true, // true until first auth check completes (avoids flash to sign-in)
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: user !== null }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    await authSignOut();
    set({ user: null, isAuthenticated: false });
  },
}));
