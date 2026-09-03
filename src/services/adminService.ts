import { authService } from './authService';

const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api/admin'
    : '/api/admin';

export interface WhitelistItem {
  _id: string;
  email: string;
  note?: string;
  addedBy?: string;
  addedAt: string;
}

export interface ParallelSessionSummary {
  userId: string;
  displayName: string;
  email: string;
  state: string;
  meetingTitle?: string;
  meetingUrl?: string;
  platform?: string;
  language?: string;
  createdAt?: string;
  elapsedSeconds?: number;
}

export interface SessionsResponse {
  success: boolean;
  activeCount: number;
  maxCapacity: number;
  sessions: ParallelSessionSummary[];
  message?: string;
}

export interface WhitelistResponse {
  success: boolean;
  whitelist: WhitelistItem[];
  message?: string;
}

export const adminService = {
  getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  },

  async getWhitelist(): Promise<WhitelistResponse> {
    try {
      const res = await fetch(`${API_BASE}/whitelist`, {
        headers: this.getHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, whitelist: [], message: err.message };
    }
  },

  async addWhitelist(email: string, note?: string): Promise<{ success: boolean; message: string; item?: WhitelistItem }> {
    try {
      const res = await fetch(`${API_BASE}/whitelist`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, note }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  async deleteWhitelist(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/whitelist/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  async getSessions(): Promise<SessionsResponse> {
    try {
      const res = await fetch(`${API_BASE}/sessions`, {
        headers: this.getHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        activeCount: 0,
        maxCapacity: 5,
        sessions: [],
        message: err.message,
      };
    }
  },
};
