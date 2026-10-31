import mongoose, { Schema, type Model } from "mongoose";

export interface CustomerServiceDocument {
  _id: mongoose.Types.ObjectId;
  customer: string;
  concern: string;
  date?: string;
  status?: string;
  chatlink?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerServiceSchema = new Schema<CustomerServiceDocument>(
  {
    customer: { type: String, required: true, trim: true },
    concern: { type: String, required: true, trim: true },
    date: { type: String, default: "" },
    status: { type: String, default: "Open" },
    chatlink: { type: String, default: "" },
  },
  { collection: "customer_services", strict: false, timestamps: true },
);

export const CustomerService: Model<CustomerServiceDocument> =
  (mongoose.models.CustomerService as Model<CustomerServiceDocument>) ??
  mongoose.model<CustomerServiceDocument>(
    "CustomerService",
    CustomerServiceSchema,
  );
