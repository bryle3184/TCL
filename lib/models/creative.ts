import mongoose, { Schema, type Model } from "mongoose";

export interface CreativeAssetDocument {
  _id: mongoose.Types.ObjectId;
  campaign: string;
  platform: string;
  status: string;
  file?: string;
  link?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CreativeAssetSchema = new Schema<CreativeAssetDocument>(
  {
    campaign: { type: String, required: true, trim: true },
    platform: { type: String, required: true },
    status: { type: String, default: "Pending" },
    file: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { collection: "creative_assets", strict: false, timestamps: true },
);

export const CreativeAsset: Model<CreativeAssetDocument> =
  (mongoose.models.CreativeAsset as Model<CreativeAssetDocument>) ??
  mongoose.model<CreativeAssetDocument>("CreativeAsset", CreativeAssetSchema);
