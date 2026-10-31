import mongoose, { Schema, type Model } from "mongoose";

export interface PayoutDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  campaign: string;
  date?: string;
  status?: string;
  link?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PayoutSchema = new Schema<PayoutDocument>(
  {
    name: { type: String, required: true, trim: true },
    campaign: { type: String, required: true, trim: true },
    date: { type: String, default: "" },
    status: { type: String, default: "Ongoing Creation" },
    link: { type: String, default: "" },
  },
  { collection: "payouts", strict: false, timestamps: true },
);

export const Payout: Model<PayoutDocument> =
  (mongoose.models.Payout as Model<PayoutDocument>) ??
  mongoose.model<PayoutDocument>("Payout", PayoutSchema);
