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

export async function exportToDocx(session: Partial<MeetingSession>, transcripts: TranscriptItem[]) {
  const fileName = `Transkrip_Meeting_${session.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Session'}_${new Date().toISOString().slice(0, 10)}.docx`;

  const totalWords = transcripts.reduce((acc, curr) => acc + curr.text.split(/\s+/).length, 0);
  const uniqueSpeakers = Array.from(new Set(transcripts.map((t) => t.speaker))).join(', ') || 'N/A';

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
              right: 1440
            }
          }
        },
        children: [
          // Header Judul
          new Paragraph({
            text: "TRANSKRIP RESMI SESI MEETING OTOMATIS",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 }
          }),
          new Paragraph({
            text: "Dihasilkan secara otomatis oleh AI Meeting Bot Controller (Deepgram Nova-2 Multilingual)",
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "Dihasilkan secara otomatis oleh AI Meeting Bot Controller (Deepgram Nova-2 Multilingual)",
                italics: true,
                color: "666666",
                size: 20
              })
            ]
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Topik Meeting:", bold: true })] })]
                  }),
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ text: session.title || "Meeting Tanpa Judul" })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Platform & URL:", bold: true })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: `${session.platform?.toUpperCase() || 'GOOGLE MEET'} - ${session.url || '-'}` })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Tanggal & Durasi:", bold: true })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: `${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })} (${durationStr})` })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Partisipan Terdeteksi:", bold: true })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: uniqueSpeakers })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: "F3F4F6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "Total Kata / Status VPN:", bold: true })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: `${totalWords} kata | VPN Terenkripsi (${session.vpnIp || '10.24.0.12'})` })]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          new Paragraph({
            text: "LOG PERCAKAPAN REAL-TIME",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 }
          }),

          // Isi Transkrip
          ...transcripts.map((t) => {
            const langLabel = t.language === 'mixed' ? '[MIXED/ID-EN]' : `[${t.language.toUpperCase()}]`;
            return new Paragraph({
              spacing: { after: 160 },
              children: [
                new TextRun({
                  text: `[${t.timestamp}] `,
                  font: "Courier New",
                  bold: true,
                  color: "4B5563",
                  size: 20
                }),
                new TextRun({
                  text: `${t.speaker} `,
                  bold: true,
                  color: "1E40AF",
                  size: 22
                }),
                new TextRun({
                  text: `${langLabel}: `,
                  italics: true,
                  color: "6B7280",
                  size: 18
                }),
                new TextRun({
                  text: t.text,
                  size: 22
                })
              ]
            });
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
