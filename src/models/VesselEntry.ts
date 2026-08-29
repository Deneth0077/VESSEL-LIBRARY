import mongoose, { Schema, Document, Model } from 'mongoose';
import { IVesselEntry } from '../types';

export interface IVesselEntryDocument extends Omit<IVesselEntry, '_id'>, Document {}

const PhotographSchema = new Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    uploadedByName: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    caption: { type: String, default: '' },
  },
  { _id: true }
);

const VesselEntrySchema: Schema = new Schema<IVesselEntryDocument>(
  {
    vesselId: { type: String, ref: 'Vessel', required: true, index: true },
    section: {
      type: String,
      enum: ['STRUCTURE', 'STRUCTURAL_DAMAGE', 'OPERATIONAL_CHALLENGE', 'SPECIAL_NOTE', 'REMARK'],
      required: true,
      index: true,
    },
    text: { type: String, required: true, trim: true },
    photographs: [PhotographSchema],
    createdBy: { type: String, required: true },
    createdByName: { type: String, required: true },
    updatedBy: { type: String, required: true },
    updatedByName: { type: String, required: true },
  },
  { timestamps: true }
);

VesselEntrySchema.index({ vesselId: 1, section: 1, createdAt: -1 });

const VesselEntry: Model<IVesselEntryDocument> =
  mongoose.models.VesselEntry || mongoose.model<IVesselEntryDocument>('VesselEntry', VesselEntrySchema);

export default VesselEntry;
