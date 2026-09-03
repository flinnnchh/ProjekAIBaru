import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;        // Hashed dengan bcrypt
  displayName: string;
  role: 'user' | 'admin';
  googleDrive?: {
    connected: boolean;
    connectedEmail?: string;
    accessToken?: string;
    refreshToken?: string;
    expiryDate?: number;
  };
  createdAt: Date;
  lastLogin: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email wajib diisi'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid'],
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Password wajib diisi'],
    minlength: [6, 'Password minimal 6 karakter'],
  },
  displayName: {
    type: String,
    required: [true, 'Nama tampilan wajib diisi'],
    trim: true,
    minlength: [2, 'Nama minimal 2 karakter'],
    maxlength: [50, 'Nama maksimal 50 karakter'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  googleDrive: {
    connected: { type: Boolean, default: false },
    connectedEmail: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    expiryDate: { type: Number },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});


// Jangan pernah return password saat query (kecuali diminta eksplisit)
userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

export const User = mongoose.model<IUser>('User', userSchema);
