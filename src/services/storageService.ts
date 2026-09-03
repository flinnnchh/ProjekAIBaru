import { ScheduledMeeting, MeetingHistory } from '../types/meeting';
import { authService } from './authService';

const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api'
    : '/api';

let cachedSchedules: ScheduledMeeting[] = [];
let cachedHistory: MeetingHistory[] = [];

/**
 * Generates standard headers with JWT authorization token for API requests.
 */
function getAuthHeaders(): HeadersInit {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Transforms raw backend schedule payload into strongly-typed ScheduledMeeting.
 */
function mapRawSchedule(raw: any): ScheduledMeeting {
  return {
    id: raw._id || raw.id,
    title: raw.title,
    platform: raw.platform,
    url: raw.url,
    scheduledTime: raw.scheduledTime,
    autoRecord: Boolean(raw.autoRecord),
    language: raw.language,
    status: raw.status,
    createdAt: raw.createdAt,
  };
}

/**
 * Transforms raw backend history payload into strongly-typed MeetingHistory.
 */
function mapRawHistory(raw: any): MeetingHistory {
  return {
    id: raw._id || raw.id,
    title: raw.title,
    platform: raw.platform,
    url: raw.url,
    date: raw.date,
    durationSeconds: raw.durationSeconds || 0,
    totalWords: raw.totalWords || 0,
    speakersCount: raw.speakersCount || (raw.participants?.length || 1),
    participants: Array.isArray(raw.participants) ? raw.participants : [],
    languages: raw.languages || ['id', 'en', 'mixed'],
    transcriptSnippet: raw.transcriptSnippet || '',
    audioFileUrl: raw.audioFileUrl,
    transcripts: (raw.transcripts || []).map((t: any, idx: number) => ({
      id: t.id || `t-${idx}`,
      speaker: t.speaker,
      timestamp: t.timestamp,
      text: t.text,
      language: t.language || 'id',
    })),
  };
}


export const storageService = {
  // ==========================================
  // SCHEDULES (MongoDB)
  // ==========================================
  getSchedules(): ScheduledMeeting[] {
    return cachedSchedules;
  },

  async fetchSchedules(): Promise<ScheduledMeeting[]> {
    try {
      const res = await fetch(`${API_BASE}/schedules`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.schedules)) {
        cachedSchedules = data.schedules.map(mapRawSchedule);
      }
    } catch (err) {
      console.warn('[Storage] Gagal mengambil jadwal dari MongoDB:', err);
    }
    return cachedSchedules;
  },

  async addSchedule(schedule: Omit<ScheduledMeeting, 'id' | 'createdAt'>): Promise<ScheduledMeeting> {
    try {
      const res = await fetch(`${API_BASE}/schedules`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(schedule),
      });
      const data = await res.json();
      if (data.success && data.schedule) {
        const newItem = mapRawSchedule(data.schedule);
        cachedSchedules.unshift(newItem);
        return newItem;
      }
    } catch (err) {
      console.warn('[Storage] Gagal menambah jadwal ke MongoDB:', err);
    }

    // Local fallback
    const fallback: ScheduledMeeting = {
      ...schedule,
      id: `sch-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    cachedSchedules.unshift(fallback);
    return fallback;
  },

  async updateSchedule(id: string, updates: Partial<ScheduledMeeting>): Promise<void> {
    cachedSchedules = cachedSchedules.map((s) => (s.id === id ? { ...s, ...updates } : s));

    try {
      await fetch(`${API_BASE}/schedules/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('[Storage] Gagal update jadwal di MongoDB:', err);
    }
  },

  async deleteSchedule(id: string): Promise<void> {
    cachedSchedules = cachedSchedules.filter((s) => s.id !== id);

    try {
      await fetch(`${API_BASE}/schedules/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn('[Storage] Gagal hapus jadwal di MongoDB:', err);
    }
  },

  // ==========================================
  // HISTORY (MongoDB)
  // ==========================================
  getHistory(): MeetingHistory[] {
    return cachedHistory;
  },

  async fetchHistory(): Promise<MeetingHistory[]> {
    try {
      const res = await fetch(`${API_BASE}/history`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        cachedHistory = data.history.map(mapRawHistory);
      }
    } catch (err) {
      console.warn('[Storage] Gagal mengambil riwayat dari MongoDB:', err);
    }
    return cachedHistory;
  },

  async saveHistoryItem(historyItem: MeetingHistory): Promise<void> {
    cachedHistory.unshift(historyItem);

    try {
      await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(historyItem),
      });
    } catch (err) {
      console.warn('[Storage] Gagal menyimpan riwayat ke MongoDB:', err);
    }
  },

  async deleteHistoryItem(id: string): Promise<void> {
    cachedHistory = cachedHistory.filter((h) => h.id !== id);

    try {
      await fetch(`${API_BASE}/history/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn('[Storage] Gagal hapus riwayat di MongoDB:', err);
    }
  },
};
