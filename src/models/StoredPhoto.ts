import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoredPhoto extends Document {
  filename: string;
  contentType: string;
  data: Buffer;
  size: number;
  uploadedBy?: string;
  createdAt: Date;
}

const StoredPhotoSchema = new Schema<IStoredPhoto>(
  {
    filename: { type: String, required: true, unique: true, index: true },
    contentType: { type: String, default: 'image/jpeg' },
    data: { type: Buffer, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: String, default: 'SYSTEM' },
  },
  { timestamps: true }
);

const StoredPhoto: Model<IStoredPhoto> =
  mongoose.models.StoredPhoto || mongoose.model<IStoredPhoto>('StoredPhoto', StoredPhotoSchema);

export default StoredPhoto;

