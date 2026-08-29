import mongoose, { Schema, Document, Model } from 'mongoose';
import { ILoginHistory } from '../types';

export interface ILoginHistoryDocument extends Omit<ILoginHistory, '_id'>, Document {}

const LoginHistorySchema: Schema = new Schema<ILoginHistoryDocument>(
  {
    userId: { type: String },
    employeeId: { type: String, required: true, index: true },
    loginAt: { type: Date, default: Date.now, index: true },
    logoutAt: { type: Date },
    ipAddress: { type: String },
    userAgent: { type: String },
    success: { type: Boolean, required: true },
    failureReason: { type: String },
  },
  { timestamps: false }
);

const LoginHistory: Model<ILoginHistoryDocument> =
  mongoose.models.LoginHistory || mongoose.model<ILoginHistoryDocument>('LoginHistory', LoginHistorySchema);

export default LoginHistory;
