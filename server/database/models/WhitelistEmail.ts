import mongoose, { Schema, Document } from 'mongoose';

export interface IWhitelistEmail extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  addedBy: string;      // Nama/email admin yang menambahkan
  note?: string;        // Catatan opsional (mis: "Tim Engineering")
  addedAt: Date;
}

const whitelistEmailSchema = new Schema<IWhitelistEmail>({
  email: {
    type: String,
    required: [true, 'Email wajib diisi'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
    index: true,
  },
  addedBy: {
    type: String,
    required: true,
    default: 'system',
  },
  note: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

export const WhitelistEmail = mongoose.model<IWhitelistEmail>('WhitelistEmail', whitelistEmailSchema);
