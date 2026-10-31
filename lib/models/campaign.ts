import mongoose, { Schema, type Model } from "mongoose";

export interface CampaignDocument {
  _id: mongoose.Types.ObjectId;
  campaign: string;
  date?: string;
  budget?: number;
  link?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CampaignSchema = new Schema<CampaignDocument>(
  {
    campaign: { type: String, required: true, trim: true },
    date: { type: String, default: "" },
    budget: { type: Number, default: 0 },
    link: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { collection: "campaigns", strict: false, timestamps: true },
);

export const Campaign: Model<CampaignDocument> =
  (mongoose.models.Campaign as Model<CampaignDocument>) ??
  mongoose.model<CampaignDocument>("Campaign", CampaignSchema);
