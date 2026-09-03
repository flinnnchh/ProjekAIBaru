import { Packer, Document, Paragraph, TextRun } from 'docx';
import { authService } from './authService';
import { MeetingSession } from '../types/meeting';
import { TranscriptItem } from '../types/transcript';
import { formatMeetingDateTime, filterAndDeduplicateParticipants } from '../utils/historyHelper';

export interface DriveStatus {
  connected: boolean;
  email?: string;
}

export interface DriveUploadResult {
  success: boolean;
  message?: string;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
}

class DriveService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /**
   * Get Google Drive connection status
   */
  async getStatus(): Promise<DriveStatus> {
    try {
      const res = await fetch('/api/drive/status', {
        headers: this.getHeaders(),
      });
      if (!res.ok) return { connected: false };
      const data = await res.json();
      return {
        connected: !!data.connected,
        email: data.email,
      };
    } catch {
      return { connected: false };
    }
  }

  /**
   * Connect Google Drive via OAuth Popup window
   */
  async connect(): Promise<{ success: boolean; email?: string; error?: string }> {
    try {
      const res = await fetch('/api/drive/auth-url', {
        headers: this.getHeaders(),
      });
      const data = await res.json();

      if (!data.success || !data.authUrl) {
        throw new Error(data.message || 'Gagal membuat Google Auth URL');
      }

      return new Promise((resolve) => {
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          data.authUrl,
          'ConnectGoogleDrive',
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
        );

        let resolved = false;

        const messageListener = (event: MessageEvent) => {
          if (event.data?.type === 'GOOGLE_DRIVE_CONNECTED') {
            resolved = true;
            window.removeEventListener('message', messageListener);
            resolve({ success: true, email: event.data.email });
          } else if (event.data?.type === 'GOOGLE_DRIVE_FAILED') {
            resolved = true;
            window.removeEventListener('message', messageListener);
            resolve({ success: false, error: event.data.message || 'Gagal menghubungkan Drive' });
          }
        };

        window.addEventListener('message', messageListener);

        // Fallback polling if popup is closed
        const timer = setInterval(async () => {
          if (popup?.closed && !resolved) {
            clearInterval(timer);
            window.removeEventListener('message', messageListener);

            // Recheck status once popup closes
            const status = await this.getStatus();
            if (status.connected) {
              resolve({ success: true, email: status.email });
            } else {
              resolve({ success: false, error: 'Popup otorisasi ditutup' });
            }
          }
        }, 1000);
      });
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal memulai koneksi Google Drive' };
    }
  }

  /**
   * Disconnect Google Drive
   */
  async disconnect(): Promise<boolean> {
    try {
      const res = await fetch('/api/drive/disconnect', {
        method: 'POST',
        headers: this.getHeaders(),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }

  /**
   * Upload Meeting Document (.docx or .txt) directly to user's Google Drive
   */
  async uploadMeetingDocument(
    session: Partial<MeetingSession>,
    transcripts: TranscriptItem[],
    format: 'docx' | 'txt' = 'docx'
  ): Promise<DriveUploadResult> {
    const safeTitle = session.title?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Session';
    const fileDateStr = new Date().toISOString().slice(0, 10);
    const fileName = `MoM_${safeTitle}_${fileDateStr}.${format}`;

    // Determine participants
    const rawList: string[] = [];
    if (session.participants && Array.isArray(session.participants)) {
      session.participants.forEach((p) => {
        if (p?.trim()) rawList.push(p.trim());
      });
    }
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

    if (format === 'txt') {
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
        const langTag = t.language === 'mixed' ? '[MIXED]' : `[${(t.language || 'ID').toUpperCase()}]`;
        content += `[${t.timestamp}] ${t.speaker} ${langTag}:\n`;
        content += `${t.text}\n\n`;
      });

      content += "====================================================================\n";
      content += "                         AKHIR DOKUMEN                              \n";
      content += "====================================================================\n";

      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          fileName,
          mimeType: 'text/plain;charset=utf-8',
          textContent: content,
        }),
      });

      return await res.json();
    } else {
      // DOCX Generation
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
              },
            },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 240 },
                children: [
                  new TextRun({
                    text: "MoM – Discussion & Decision (DD)",
                    bold: true,
                    size: 36,
                    color: "000000",
                    font: "Calibri",
                  }),
                ],
              }),

              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: "Topic: ", bold: true, size: 24, font: "Calibri", color: "000000" }),
                  new TextRun({ text: session.title || "Diskusi & Pembahasan", size: 24, font: "Calibri", color: "111827" }),
                ],
              }),

              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: "Date: ", bold: true, size: 24, font: "Calibri", color: "000000" }),
                  new TextRun({ text: meetingDateFormatted, size: 24, font: "Calibri", color: "111827" }),
                ],
              }),

              new Paragraph({
                spacing: { after: participantList.length > 0 ? 80 : 200 },
                children: [
                  new TextRun({ text: "Participant: ", bold: true, size: 24, font: "Calibri", color: "000000" }),
                  new TextRun({ text: `${participantList.length} Peserta`, size: 24, font: "Calibri", color: "111827" }),
                ],
              }),

              ...participantList.map((name) => {
                return new Paragraph({
                  indent: { left: 720 },
                  spacing: { after: 60 },
                  children: [
                    new TextRun({ text: `-   ${name}`, size: 24, font: "Calibri", color: "111827" }),
                  ],
                });
              }),

              new Paragraph({
                spacing: { before: 120, after: 300 },
                children: [
                  new TextRun({
                    text: `Platform: ${session.platform?.toUpperCase() || 'GOOGLE MEET'} | Durasi: ${durationStr} | Total Entri: ${transcripts.length}`,
                    size: 20,
                    color: "6B7280",
                    italics: true,
                    font: "Calibri",
                  }),
                ],
              }),

              new Paragraph({
                spacing: { before: 200, after: 160 },
                children: [
                  new TextRun({
                    text: "Discussion & Transcripts Log",
                    bold: true,
                    size: 26,
                    color: "1E3A8A",
                    font: "Calibri",
                  }),
                ],
              }),

              ...transcripts.map((t) => {
                const langLabel = t.language === 'mixed' ? '[MIXED]' : `[${(t.language || 'ID').toUpperCase()}]`;
                return new Paragraph({
                  spacing: { after: 120 },
                  children: [
                    new TextRun({ text: `[${t.timestamp}] `, bold: true, size: 20, color: "6B7280", font: "Calibri" }),
                    new TextRun({ text: `${t.speaker} `, bold: true, size: 22, color: "111827", font: "Calibri" }),
                    new TextRun({ text: `${langLabel}: `, size: 18, color: "3B82F6", font: "Calibri" }),
                    new TextRun({ text: t.text, size: 22, color: "1F2937", font: "Calibri" }),
                  ],
                });
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const arrayBuffer = await blob.arrayBuffer();
      
      // Convert buffer to base64
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);

      const res = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          fileName,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          base64Data,
        }),
      });

      return await res.json();
    }
  }
}

export const driveService = new DriveService();
