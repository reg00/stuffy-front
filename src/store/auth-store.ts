import { create } from 'zustand';
import { authService } from '../services/auth-service';
import { GetUserEntry } from '@/api';
import { apiClient } from '../services/api-client';

const USER_STORAGE_KEY = 'user';

const loadUserFromStorage = (): GetUserEntry | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GetUserEntry;
  } catch {
    return null;
  }
};

interface AuthState {
  user: GetUserEntry | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: GetUserEntry | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialUser = loadUserFromStorage();
  const hasToken = authService.isAuthenticated();

  return {
    user: initialUser,
    isAuthenticated: hasToken && !!initialUser,
    isLoading: false,
    error: null,

    setUser: (user) => {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
      set({
        user,
        isAuthenticated: !!user && authService.isAuthenticated(),
      });
    },

    setError: (error) => set({ error }),

    setLoading: (loading) => set({ isLoading: loading }),

    // login: получаем только token, user берём ИЗ ОТВЕТА login, а не делаем отдельный account
    login: async (username, password) => {
      set({ isLoading: true, error: null });
      try {
        const token = await authService.login(username, password);
        apiClient.setToken(token!);
        
        const user = await authService.getAccount();
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Ошибка при логине';
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },

    // register: после регистрации сразу логинимся, без отдельного account
    register: async (username, email, password) => {
      set({ isLoading: true, error: null });
      try {
        await authService.register(username, email, password);

        const token = await authService.login(username, password);
        apiClient.setToken(token!);

        const user = await authService.getAccount();
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Ошибка при регистрации';
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },

    logout: () => {
      authService.logout();
      localStorage.removeItem(USER_STORAGE_KEY);
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    },
  };
});
