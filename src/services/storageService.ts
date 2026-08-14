import { ScheduledMeeting, MeetingHistory } from '../types/meeting';

const SCHEDULES_KEY = 'ai_bot_schedules';
const HISTORY_KEY = 'ai_bot_history';

export const storageService = {
  getSchedules(): ScheduledMeeting[] {
    const data = localStorage.getItem(SCHEDULES_KEY);
    if (!data) {
      // Default initial mock schedules
      const initial: ScheduledMeeting[] = [
        {
          id: 'sch-1',
          title: 'Sprint Planning Engineering Team',
          platform: 'gmeet',
          url: 'https://meet.google.com/abc-defg-hij',
          scheduledTime: new Date(Date.now() + 3600000 * 2).toISOString(),
          autoRecord: true,
          status: 'UPCOMING',
          createdAt: new Date().toISOString()
        },
        {
          id: 'sch-2',
          title: 'All Hands Business & Product Review',
          platform: 'zoom',
          url: 'https://zoom.us/j/9876543210',
          scheduledTime: new Date(Date.now() + 3600000 * 24).toISOString(),
          autoRecord: true,
          status: 'UPCOMING',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveSchedules(schedules: ScheduledMeeting[]): void {
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  },

  addSchedule(schedule: Omit<ScheduledMeeting, 'id' | 'createdAt'>): ScheduledMeeting {
    const list = this.getSchedules();
    const newItem: ScheduledMeeting = {
      ...schedule,
      id: `sch-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(newItem);
    this.saveSchedules(list);
    return newItem;
  },

  deleteSchedule(id: string): void {
    const list = this.getSchedules().filter((s) => s.id !== id);
    this.saveSchedules(list);
  },

  updateSchedule(id: string, updates: Partial<ScheduledMeeting>): void {
    const list = this.getSchedules().map((s) => s.id === id ? { ...s, ...updates } : s);
    this.saveSchedules(list);
  },

  getHistory(): MeetingHistory[] {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) {
      // Mock historical data
      const initial: MeetingHistory[] = [
        {
          id: 'hist-1',
          title: 'Weekly Standup & AI Engine Roadmap',
          platform: 'gmeet',
          url: 'https://meet.google.com/xyz-uvwx-rst',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          durationSeconds: 1640,
          totalWords: 1420,
          speakersCount: 3,
          languages: ['id', 'en', 'mixed'],
          transcriptSnippet: 'Kita sepakat untuk integrasi Deepgram Nova-2 selesai minggu ini...',
          transcripts: [
            {
              id: 't-1',
              speaker: 'Speaker 1 (Host)',
              timestamp: '00:00:15',
              text: 'Selamat pagi rekan-rekan sekalian, mari kita mulai weekly review hari ini.',
              language: 'id'
            },
            {
              id: 't-2',
              speaker: 'Speaker 2 (AI Engineer)',
              timestamp: '00:00:48',
              text: 'Good morning. Regarding the STT engine, we have implemented the Deepgram WebSocket with code-switching support.',
              language: 'en'
            },
            {
              id: 't-3',
              speaker: 'Speaker 3 (Product Manager)',
              timestamp: '00:01:20',
              text: 'Keren banget, tolong make sure fitur export ke Word .docx dan .txt sudah ada template resminya.',
              language: 'mixed'
            }
          ]
        }
      ];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveHistoryItem(historyItem: MeetingHistory): void {
    const list = this.getHistory();
    list.unshift(historyItem);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  },

  deleteHistoryItem(id: string): void {
    const list = this.getHistory().filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  }
};
