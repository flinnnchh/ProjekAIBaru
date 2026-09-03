import { AuthUser, AuthResponse } from '../types/auth';

const TOKEN_KEY = 'ai_bot_auth_token';
const USER_KEY = 'ai_bot_auth_user';

const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api/auth'
    : '/api/auth';

export const authService = {
  /**
   * Retrieves active auth token from sessionStorage (default) or localStorage (if Remember Me was checked).
   */
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Saves authentication session.
   * If rememberMe is false (default), uses sessionStorage so closing the tab/browser automatically logs out.
   */
  setSession(token: string, user: AuthUser, rememberMe: boolean = false): void {
    // Clear both storages first to prevent stale credentials
    this.logout();

    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Retrieves current logged in user from active session.
   */
  getUser(): AuthUser | null {
    const userStr = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Clears auth session completely from both sessionStorage and localStorage.
   */
  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data: AuthResponse = await res.json();
      if (data.success && data.token && data.user) {
        this.setSession(data.token, data.user, rememberMe);
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: 'Gagal terhubung ke server autentikasi. Pastikan backend berjalan.',
        error: err.message,
      };
    }
  },

  async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });
      const data: AuthResponse = await res.json();
      if (data.success && data.token && data.user) {
        this.setSession(data.token, data.user, false);
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: 'Gagal terhubung ke server autentikasi.',
        error: err.message,
      };
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const token = this.getToken();
    if (!token) {
      return { success: false, message: 'Tidak ada token.' };
    }
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.user) {
        // Keep updated user info in the corresponding storage
        if (localStorage.getItem(TOKEN_KEY)) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        } else {
          sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      }
      return data;
    } catch (err: any) {
      return { success: false, message: 'Gagal validasi token.', error: err.message };
    }
  },
};
