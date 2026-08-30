import mongoose, { Schema, Document, Model } from 'mongoose';
import { IVessel } from '../types';

export interface IVesselDocument extends Omit<IVessel, '_id'>, Document {}

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

const VesselSchema: Schema = new Schema<IVesselDocument>(
  {
    vesselName: { type: String, required: true, trim: true, index: true },
    vesselType: { type: String, required: true, trim: true },
    imoNumber: { type: String, default: '', trim: true, index: true },
    flag: { type: String, default: '', trim: true },
    ownerOperator: { type: String, default: '', trim: true },
    callSign: { type: String, default: '', trim: true },
    yearBuilt: { type: Number, default: new Date().getFullYear() },
    loa: { type: String, default: '' },
    beam: { type: String, default: '' },
    keelToDeck: { type: String, default: '' },
    numberOfBays: { type: String, default: '' },
    numberOfRows: { type: String, default: '' },
    lashingBridges: { type: String, default: '' },
    lashingBridgeHeight: { type: String, default: '' },
    basicInformation: { type: String, default: '' },
    reeferMotorConfig: { type: Schema.Types.Mixed, default: {} },
    mainPhotographs: [PhotographSchema],
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
  },
  { timestamps: true }
);

VesselSchema.index({ vesselName: 'text', imoNumber: 'text', vesselType: 'text', flag: 'text' });

const Vessel: Model<IVesselDocument> = mongoose.models.Vessel || mongoose.model<IVesselDocument>('Vessel', VesselSchema);

export default Vessel;
