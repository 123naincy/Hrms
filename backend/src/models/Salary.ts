import mongoose, { Document, Schema } from "mongoose";

export interface ISalary extends Document {
  employeeId: mongoose.Types.ObjectId;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
}

const SalarySchema = new Schema<ISalary>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    basic: { type: Number, required: true, min: 0 },
    hra: { type: Number, default: 0, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ISalary>("Salary", SalarySchema);
