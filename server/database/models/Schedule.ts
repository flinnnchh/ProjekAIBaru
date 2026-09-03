import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;  // Referensi ke User → ISOLASI DATA
  title: string;
  platform: 'gmeet' | 'zoom' | 'teams' | '';
  url: string;
  scheduledTime: Date;
  autoRecord: boolean;
  language: 'id' | 'en' | '';
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  createdAt: Date;
}

const scheduleSchema = new Schema<ISchedule>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'userId wajib diisi'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Judul meeting wajib diisi'],
    trim: true,
  },
  platform: {
    type: String,
    enum: ['gmeet', 'zoom', 'teams', ''],
    default: '',
  },
  url: {
    type: String,
    required: [true, 'URL meeting wajib diisi'],
    trim: true,
  },
  scheduledTime: {
    type: Date,
    required: [true, 'Waktu jadwal wajib diisi'],
    index: true,
  },
  autoRecord: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    enum: ['id', 'en', ''],
    default: '',
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'MISSED'],
    default: 'UPCOMING',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index: cari jadwal upcoming milik user tertentu
scheduleSchema.index({ userId: 1, status: 1, scheduledTime: 1 });

export const Schedule = mongoose.model<ISchedule>('Schedule', scheduleSchema);
