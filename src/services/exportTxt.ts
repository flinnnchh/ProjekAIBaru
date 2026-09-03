import saveAs from 'file-saver';
import { TranscriptItem } from '../types/transcript';
import { MeetingSession } from '../types/meeting';
import { formatMeetingDateTime, filterAndDeduplicateParticipants } from '../utils/historyHelper';

export function exportToTxt(session: Partial<MeetingSession>, transcripts: TranscriptItem[]) {
  const safeTitle = session.title?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Session';
  const fileDateStr = new Date().toISOString().slice(0, 10);
  const fileName = `MoM_${safeTitle}_${fileDateStr}.txt`;

  // Determine participants list
  const rawList: string[] = [];
  if (session.participants && Array.isArray(session.participants)) {
    session.participants.forEach((p) => {
      if (p?.trim()) rawList.push(p.trim());
    });
  }

  // If no room participants discovered, fallback to speaker names in transcripts
  if (rawList.length === 0) {
    transcripts.forEach((t) => {
      const spk = t.speaker?.trim();
      if (spk && !spk.toLowerCase().startsWith('speaker ')) {
        rawList.push(spk);
      }
    });
  }

  const participantList = filterAndDeduplicateParticipants(rawList);

  const minutes = Math.floor((session.elapsedSeconds || 0) / 60);
  const seconds = (session.elapsedSeconds || 0) % 60;
  const durationStr = `${minutes} menit ${seconds} detik`;

  const meetingDateFormatted = formatMeetingDateTime(
    session.recordStartTime || session.startTime || session.date || new Date()
  );

  let content = "MoM – Discussion & Decision (DD)\n\n";
  content += `Topic: ${session.title || 'Diskusi & Pembahasan'}\n`;
  content += `Date: ${meetingDateFormatted}\n`;
  content += `Participant: ${participantList.length} Peserta\n`;
  
  participantList.forEach((name) => {
    content += `    -   ${name}\n`;
  });

  content += `\nPlatform: ${session.platform?.toUpperCase() || 'GOOGLE MEET'} | Durasi: ${durationStr} | Total Entri: ${transcripts.length}\n`;
  content += "--------------------------------------------------------------------\n";
  content += "LOG PERCAKAPAN & TRANSKRIP LENGKAP:\n\n";


  transcripts.forEach((t) => {
    content += `[${t.timestamp}] ${t.speaker}: ${t.text}\n\n`;
  });

  content += "====================================================================\n";
  content += "                         AKHIR DOKUMEN                              \n";
  content += "====================================================================\n";

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
}

