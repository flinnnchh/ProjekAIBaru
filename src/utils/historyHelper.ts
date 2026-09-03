import { MeetingHistory, MeetingPlatform } from '../types/meeting';
import { TranscriptItem } from '../types/transcript';

export interface CreateHistoryParams {
  id?: string;
  title?: string;
  platform: MeetingPlatform;
  url: string;
  date?: string;
  elapsedSeconds: number;
  transcripts: TranscriptItem[];
  participants?: string[];
}

/**
 * Format timestamp / Date string into clean Indonesian Realtime display (WIB).
 * Example output: "Selasa, 1 September 2026 pukul 13:21 WIB"
 */
export function formatMeetingDateTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) {
    return formatMeetingDateTime(new Date());
  }

  const d = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(d.getTime())) {
    return formatMeetingDateTime(new Date());
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  };

  try {
    const formattedDate = new Intl.DateTimeFormat('id-ID', dateOptions).format(d);
    const formattedTime = new Intl.DateTimeFormat('id-ID', timeOptions).format(d).replace(/\./g, ':');
    return `${formattedDate} pukul ${formattedTime} WIB`;
  } catch (e) {
    return `${d.toLocaleDateString('id-ID')} pukul ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;
  }
}


/**
 * Filter out bot names and deduplicate truncated participant names.
 * Example: ["botnotul...", "Samuel Ti...", "Eflin Hut...", "Eflin Hutapea"]
 * -> Returns: ["Eflin Hutapea", "Samuel Ti"] (Total 2 orang)
 */
export function filterAndDeduplicateParticipants(rawNames: string[]): string[] {
  if (!rawNames || !Array.isArray(rawNames)) return [];

  const isBot = (name: string) => {
    const lower = name.toLowerCase().trim();
    if (!lower || lower === 'you' || lower === 'anda') return true;
    if (
      lower.startsWith('botnotul') ||
      lower.includes('botnotulen') ||
      lower.includes('ai note-taker') ||
      lower.includes('notetaker') ||
      lower === 'bot' ||
      lower === 'ai bot'
    ) {
      return true;
    }
    return false;
  };

  // 1. Clean annotations and filter bots
  const cleanedList = rawNames
    .map((n) => {
      let s = (n || '').trim();
      s = s.replace(/\s*\((?:You|Anda|Presenting|Mempresentasikan|Presentation|Host|Penyelenggara|annot[^\)]*)\)/gi, '').trim();
      s = s.replace(/[\r\n\t]+/g, ' ').trim();
      return s;
    })
    .filter((n) => n.length > 1 && !isBot(n));

  // 2. Sort descending by length to prioritize full names over truncated ones
  const sorted = Array.from(new Set(cleanedList)).sort((a, b) => b.length - a.length);
  const result: string[] = [];

  for (const candidate of sorted) {
    const cleanCand = candidate.replace(/\.{2,}$/, '').trim().toLowerCase();
    if (!cleanCand) continue;

    const alreadyCovered = result.some((existing) => {
      const cleanExisting = existing.toLowerCase();
      return cleanExisting.startsWith(cleanCand) || cleanExisting.includes(cleanCand);
    });

    if (!alreadyCovered) {
      result.push(candidate.replace(/\.{2,}$/, '').trim());
    }
  }

  return result;
}

/**
 * Creates a clean MeetingHistory data object from transcript items, participants, and meeting metadata.
 * Calculates word counts, unique speaker counts, and formats transcript records.
 */
export function createMeetingHistoryItem(params: CreateHistoryParams): MeetingHistory {
  const { id, title, platform, url, date, elapsedSeconds, transcripts, participants } = params;

  const totalWords = transcripts.reduce((acc, curr) => {
    if (!curr.text) return acc;
    return acc + curr.text.split(/\s+/).filter(Boolean).length;
  }, 0);

  // Combine discovered participants with speakers found in transcripts
  const rawList: string[] = [];
  if (participants && Array.isArray(participants)) {
    participants.forEach((p) => {
      if (p?.trim()) rawList.push(p.trim());
    });
  }

  transcripts.forEach((t) => {
    const spk = t.speaker?.trim();
    if (spk && !spk.toLowerCase().startsWith('speaker ')) {
      rawList.push(spk);
    }
  });

  const finalParticipants = filterAndDeduplicateParticipants(rawList);
  const speakersCount = finalParticipants.length || 1;

  return {
    id: id || `hist-${Date.now()}`,
    title: title || 'Sesi Meeting Live',
    platform,
    url,
    date: date || new Date().toISOString(),
    durationSeconds: elapsedSeconds,
    totalWords,
    speakersCount,
    participants: finalParticipants,
    languages: ['id', 'en', 'mixed'],
    transcriptSnippet: transcripts[0]?.text || 'Sesi transkrip meeting tersimpan.',
    transcripts: transcripts.map((t) => ({
      id: t.id,
      speaker: t.speaker,
      timestamp: t.timestamp,
      text: t.text,
      language: t.language || 'id',
    })),
  };
}


