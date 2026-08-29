import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser, UserRole, UserStatus } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema: Schema = new Schema<IUserDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    pinHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER', index: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'DENIED', 'SUSPENDED'], default: 'PENDING', index: true },
    lastLoginAt: { type: Date },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    deniedAt: { type: Date },
    deniedBy: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ status: 1, role: 1 });
UserSchema.index({ fullName: 'text', employeeId: 'text', email: 'text' });

const User: Model<IUserDocument> = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
