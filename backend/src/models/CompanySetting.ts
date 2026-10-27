import mongoose, { Document, Schema } from "mongoose";

export interface ICompanySetting extends Document {
  key: string;
  companyName: string;
  email?: string;
  phone?: string;
  address?: string;
  workStart: string;
  workEnd: string;
  weeklyOffs: number[];
}

const CompanySettingSchema = new Schema<ICompanySetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
    },
    companyName: {
      type: String,
      required: true,
      default: "BHL Group",
    },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    workStart: { type: String, default: "09:30" },
    workEnd: { type: String, default: "18:30" },
    weeklyOffs: {
      type: [Number],
      default: [0],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICompanySetting>(
  "CompanySetting",
  CompanySettingSchema
);
