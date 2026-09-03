import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  ShadingType
} from 'docx';
import saveAs from 'file-saver';
import { TranscriptItem } from '../types/transcript';
import { MeetingSession } from '../types/meeting';
import { formatMeetingDateTime, filterAndDeduplicateParticipants } from '../utils/historyHelper';

export async function exportToDocx(session: Partial<MeetingSession>, transcripts: TranscriptItem[]) {
  const safeTitle = session.title?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Session';
  const fileDateStr = new Date().toISOString().slice(0, 10);
  const fileName = `MoM_${safeTitle}_${fileDateStr}.docx`;

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
  const participantText = participantList.length > 0
    ? `${participantList.length} Peserta (${participantList.join(', ')})`
    : '1 Peserta';


  // Format realtime date (WIB)
  const meetingDateFormatted = formatMeetingDateTime(
    session.recordStartTime || session.startTime || session.date || new Date()
  );

  // Format durasi
  const minutes = Math.floor((session.elapsedSeconds || 0) / 60);
  const seconds = (session.elapsedSeconds || 0) % 60;
  const durationStr = `${minutes} menit ${seconds} detik`;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // 1. Header Judul MoM
          new Paragraph({
            spacing: { before: 0, after: 240 },
            children: [
              new TextRun({
                text: "MoM – Discussion & Decision (DD)",
                bold: true,
                size: 36, // 18pt
                color: "000000",
                font: "Calibri",
              }),
            ],
          }),

          // 2. Metadata Section (Topic, Date, Participant)
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: "Topic: ",
                bold: true,
                size: 24, // 12pt
                font: "Calibri",
                color: "000000",
              }),
              new TextRun({
                text: session.title || "Diskusi & Pembahasan",
                size: 24,
                font: "Calibri",
                color: "111827",
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: "Date: ",
                bold: true,
                size: 24,
                font: "Calibri",
                color: "000000",
              }),
              new TextRun({
                text: meetingDateFormatted,
                size: 24,
                font: "Calibri",
                color: "111827",
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: participantList.length > 0 ? 80 : 200 },
            children: [
              new TextRun({
                text: "Participant: ",
                bold: true,
                size: 24,
                font: "Calibri",
                color: "000000",
              }),
              new TextRun({
                text: `${participantList.length} Peserta`,
                size: 24,
                font: "Calibri",
                color: "111827",
              }),
            ],
          }),

          // Daftar nama peserta dalam bentuk list item berinden
          ...participantList.map((name) => {
            return new Paragraph({
              indent: { left: 720 }, // Indentasi ke dalam
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: `-   ${name}`,
                  size: 24,
                  font: "Calibri",
                  color: "111827",
                }),
              ],
            });
          }),

          // Metadata Tambahan (Platform & Durasi)
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


          // 3. Section Transkrip Percakapan / Discussion Log
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

          // Isi Percakapan
          ...transcripts.map((t) => {
            const langLabel = t.language === 'mixed' ? '[MIXED]' : `[${(t.language || 'ID').toUpperCase()}]`;
            return new Paragraph({
              spacing: { after: 120 },
              children: [
                new TextRun({
                  text: `[${t.timestamp}] `,
                  font: "Consolas",
                  bold: true,
                  color: "4B5563",
                  size: 20,
                }),
                new TextRun({
                  text: `${t.speaker} `,
                  bold: true,
                  color: "1E40AF",
                  size: 22,
                  font: "Calibri",
                }),
                new TextRun({
                  text: `${langLabel}: `,
                  italics: true,
                  color: "9CA3AF",
                  size: 18,
                  font: "Calibri",
                }),
                new TextRun({
                  text: t.text,
                  size: 22,
                  color: "1F2937",
                  font: "Calibri",
                }),
              ],
            });
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}

