import mongoose, {
  Document,
  Schema,
} from "mongoose";

export type LeaveRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type LeaveDayType =
  | "FULL_DAY"
  | "FIRST_HALF"
  | "SECOND_HALF";

export interface ILeaveRequest
  extends Document {

  employeeId: mongoose.Types.ObjectId;

  leaveType:
    | "EL"
    | "CSL"
    | "MATERNITY"
    | "BEREAVEMENT";

  startDate: Date;

  endDate: Date;

  dayType: LeaveDayType;

  totalCalendarDays: number;

  workingLeaveDays: number;

  sandwichDays: number;

  chargeableDays: number;

  sandwichDates: Date[];

  weekOffDates: Date[];

  holidayDates: Date[];

  reason: string;

  attachment?: string;

  status: LeaveRequestStatus;

  appliedAt: Date;

  approvedBy?: mongoose.Types.ObjectId;

  approvedAt?: Date;

  rejectedBy?: mongoose.Types.ObjectId;

  rejectedAt?: Date;

  cancelledAt?: Date;

  hrRemarks?: string;
}

const LeaveRequestSchema =
  new Schema<ILeaveRequest>(
    {
      // ==========================================
      // EMPLOYEE
      // ==========================================

      employeeId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      // ==========================================
      // LEAVE TYPE
      // ==========================================

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

      // ==========================================
      // DATES
      // ==========================================

      startDate: {
        type: Date,
        required: true,
      },

      endDate: {
        type: Date,
        required: true,
      },

      // ==========================================
      // DAY TYPE
      // ==========================================

      dayType: {
        type: String,

        enum: [
          "FULL_DAY",
          "FIRST_HALF",
          "SECOND_HALF",
        ],

        default: "FULL_DAY",
      },

      // ==========================================
      // CALCULATION
      // ==========================================

      totalCalendarDays: {
        type: Number,
        required: true,
        min: 1,
      },

      workingLeaveDays: {
        type: Number,
        required: true,
        min: 0,
      },

      sandwichDays: {
        type: Number,
        required: true,
        min: 0,
      },

      chargeableDays: {
        type: Number,
        required: true,
        min: 0,
      },

      sandwichDates: {
        type: [Date],
        default: [],
      },

      weekOffDates: {
        type: [Date],
        default: [],
      },

      holidayDates: {
        type: [Date],
        default: [],
      },

      // ==========================================
      // REASON
      // ==========================================

      reason: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 500,
      },

      // ==========================================
      // ATTACHMENT
      // ==========================================

      attachment: {
        type: String,
        trim: true,
      },

      // ==========================================
      // STATUS
      // ==========================================

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

      // ==========================================
      // APPLICATION
      // ==========================================

      appliedAt: {
        type: Date,
        default: Date.now,
      },

      // ==========================================
      // APPROVAL
      // ==========================================

      approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      approvedAt: {
        type: Date,
      },

      // ==========================================
      // REJECTION
      // ==========================================

      rejectedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      rejectedAt: {
        type: Date,
      },

      // ==========================================
      // CANCELLATION
      // ==========================================

      cancelledAt: {
        type: Date,
      },

      // ==========================================
      // HR REMARKS
      // ==========================================

      hrRemarks: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },

    {
      timestamps: true,
    }
  );

// ==========================================
// INDEXES
// ==========================================

LeaveRequestSchema.index({
  employeeId: 1,
  startDate: 1,
  endDate: 1,
});

LeaveRequestSchema.index({
  employeeId: 1,
  status: 1,
});

LeaveRequestSchema.index({
  status: 1,
  appliedAt: -1,
});

export default mongoose.model<ILeaveRequest>(
  "LeaveRequest",
  LeaveRequestSchema
);