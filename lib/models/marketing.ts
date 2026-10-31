import mongoose, { Schema, type Model } from "mongoose";

export interface MarketingContentDocument {
  _id: mongoose.Types.ObjectId;
  id?: string;
  schedule?: string;
  account?: string;
  platform?: string;
  event?: string;
  visual?: string;
  header?: string;
  subheader?: string;
  caption?: string;
  hashtags?: string;
  creatives?: string;
  campaign?: string;
  notes?: string;
  status?: string;
  archive?: string;
  file?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MarketingContentSchema = new Schema<MarketingContentDocument>(
  {
    id: { type: String, default: "" },
    schedule: { type: String, default: "" },
    account: { type: String, default: "" },
    platform: { type: String, default: "" },
    event: { type: String, default: "" },
    visual: { type: String, default: "" },
    header: { type: String, default: "" },
    subheader: { type: String, default: "" },
    caption: { type: String, default: "" },
    hashtags: { type: String, default: "" },
    creatives: { type: String, default: "" },
    campaign: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: { type: String, default: "Pending" },
    archive: { type: String, default: "" },
    file: { type: String, default: "" },
  },
  { collection: "digital_marketings", strict: false, timestamps: true },
);

export const MarketingContent: Model<MarketingContentDocument> =
  (mongoose.models.MarketingContent as Model<MarketingContentDocument>) ??
  mongoose.model<MarketingContentDocument>(
    "MarketingContent",
    MarketingContentSchema,
  );

export interface MarketingArchiveDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  createdAt?: Date;
}

const MarketingArchiveSchema = new Schema<MarketingArchiveDocument>(
  {
    name: { type: String, required: true, trim: true },
  },
  { collection: "digitalMarketArchives", strict: false, timestamps: true },
);

export const MarketingArchive: Model<MarketingArchiveDocument> =
  (mongoose.models.MarketingArchive as Model<MarketingArchiveDocument>) ??
  mongoose.model<MarketingArchiveDocument>(
    "MarketingArchive",
    MarketingArchiveSchema,
  );
