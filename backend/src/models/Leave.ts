import mongoose, {
  Document,
  Schema,
} from "mongoose";

export type LeaveType =
  | "EL"
  | "CSL"
  | "MATERNITY"
  | "BEREAVEMENT";

export type LeaveStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type LeaveDayType =
  | "FULL_DAY"
  | "HALF_DAY";

export interface ILeave extends Document {
  employeeId: mongoose.Types.ObjectId;

  leaveType: LeaveType;

  startDate: Date;

  endDate: Date;

  totalDays: number;

  chargeableDays: number;

  dayType: LeaveDayType;

  reason: string;

  status: LeaveStatus;

  sandwichDays: number;

  sandwichDates: Date[];

  medicalCertificate?: string;

  relationship?: string;

  childNumber?: number;

  appliedAt: Date;

  approvedBy?: mongoose.Types.ObjectId;

  approvedAt?: Date;

  rejectionReason?: string;

  cancelledAt?: Date;
}

const LeaveSchema =
  new Schema<ILeave>(
    {
      employeeId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      leaveType: {
        type: String,
        enum: [
          "EL",
          "CSL",
          "MATERNITY",
          "BEREAVEMENT",
        ],
        required: true,
      },

      startDate: {
        type: Date,
        required: true,
      },

      endDate: {
        type: Date,
        required: true,
      },

      totalDays: {
        type: Number,
        required: true,
        min: 0.5,
      },

      chargeableDays: {
        type: Number,
        required: true,
        min: 0,
      },

      dayType: {
        type: String,
        enum: ["FULL_DAY", "HALF_DAY"],
        default: "FULL_DAY",
      },

      reason: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
      },

      status: {
        type: String,
        enum: [
          "PENDING",
          "APPROVED",
          "REJECTED",
          "CANCELLED",
        ],
        default: "PENDING",
        index: true,
      },

      sandwichDays: {
        type: Number,
        default: 0,
        min: 0,
      },

      sandwichDates: {
        type: [Date],
        default: [],
      },

      medicalCertificate: {
        type: String,
      },

      relationship: {
        type: String,
      },

      childNumber: {
        type: Number,
        min: 1,
      },

      appliedAt: {
        type: Date,
        default: Date.now,
      },

      approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      approvedAt: {
        type: Date,
      },

      rejectionReason: {
        type: String,
        trim: true,
      },

      cancelledAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

LeaveSchema.index({
  employeeId: 1,
  startDate: 1,
  endDate: 1,
});

export default mongoose.model<ILeave>(
  "Leave",
  LeaveSchema
);