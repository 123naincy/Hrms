import mongoose, { Document, Schema } from "mongoose";

export interface IDesignation extends Document {
  title: string;
  code: string;
  department?: string;
  level: number;
  isActive: boolean;
}

const DesignationSchema = new Schema<IDesignation>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    department: {
      type: String,
      trim: true,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDesignation>(
  "Designation",
  DesignationSchema
);
