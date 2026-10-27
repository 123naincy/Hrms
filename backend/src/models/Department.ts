import mongoose, { Document, Schema } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDepartment>(
  "Department",
  DepartmentSchema
);
