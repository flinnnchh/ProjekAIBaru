import mongoose, { Schema, Document } from 'mongoose';

/**
 * Sub-document schema untuk item transkrip di dalam history
 */
const transcriptEntrySchema = new Schema({
  speaker: { type: String, required: true },
  timestamp: { type: String, required: true },
  text: { type: String, required: true },
  language: { type: String, enum: ['id', 'en', 'mixed'], default: 'id' },
}, { _id: false });

export interface ITranscriptEntry {
  speaker: string;
  timestamp: string;
  text: string;
  language: 'id' | 'en' | 'mixed';
}

export interface IMeetingHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;  // Referensi ke User → ISOLASI DATA
  title: string;
  platform: 'gmeet' | 'zoom' | 'teams' | '';
  url: string;
  date: Date;
  durationSeconds: number;
  totalWords: number;
  speakersCount: number;
  participants: string[];
  languages: ('id' | 'en' | 'mixed')[];
  transcriptSnippet: string;
  audioFileUrl?: string;
  transcripts: ITranscriptEntry[];
  createdAt: Date;
}

const meetingHistorySchema = new Schema<IMeetingHistory>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'userId wajib diisi'],
    index: true,  // Index untuk query cepat per-user
  },
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Sesi Meeting',
  },
  platform: {
    type: String,
    enum: ['gmeet', 'zoom', 'teams', ''],
    default: '',
  },
  url: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,  // Index untuk sorting by date
  },
  durationSeconds: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalWords: {
    type: Number,
    default: 0,
    min: 0,
  },
  speakersCount: {
    type: Number,
    default: 1,
    min: 1,
  },
  participants: [{
    type: String,
    trim: true,
  }],
  languages: [{
    type: String,
    enum: ['id', 'en', 'mixed'],
  }],
  transcriptSnippet: {
    type: String,
    default: '',
    maxlength: 500,
  },
  audioFileUrl: {
    type: String,
    trim: true,
  },
  transcripts: [transcriptEntrySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index: user + date untuk query "history saya, urutkan terbaru"
meetingHistorySchema.index({ userId: 1, date: -1 });

export const MeetingHistory = mongoose.model<IMeetingHistory>('MeetingHistory', meetingHistorySchema);
