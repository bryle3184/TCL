import mongoose, { Schema, type Model } from "mongoose";

/**
 * Accounts collection created by the original Express app.
 * Legacy passwords may still be plaintext; they are upgraded to bcrypt
 * hashes on the next successful login. `strict: false` keeps any extra
 * legacy fields intact.
 */
export interface AccountDocument {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  name: string;
  birthday?: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AccountSchema = new Schema<AccountDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    birthday: { type: String, default: "" },
    role: { type: String, required: true },
  },
  {
    collection: "accounts",
    strict: false,
    timestamps: true,
  },
);

export const Account: Model<AccountDocument> =
  (mongoose.models.Account as Model<AccountDocument>) ??
  mongoose.model<AccountDocument>("Account", AccountSchema);
