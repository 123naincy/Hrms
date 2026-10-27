import mongoose, { Document, Schema } from "mongoose";

export interface IPayslip extends Document {
  employeeId: mongoose.Types.ObjectId;
  year: number;
  month: number;
  presentDays: number;
  leaveDays: number;
  absentDays: number;
  gross: number;
  lop: number;
  deductions: number;
  net: number;
  status: "GENERATED" | "PAID";
}

const PayslipSchema = new Schema<IPayslip>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    presentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    gross: { type: Number, required: true },
    lop: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    net: { type: Number, required: true },
    status: {
      type: String,
      enum: ["GENERATED", "PAID"],
      default: "GENERATED",
    },
  },
  { timestamps: true }
);

PayslipSchema.index(
  { employeeId: 1, year: 1, month: 1 },
  { unique: true }
);

export default mongoose.model<IPayslip>("Payslip", PayslipSchema);
