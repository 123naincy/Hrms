import mongoose, {
  Document,
  Schema,
} from "mongoose";

export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LEAVE"
  | "WEEK_OFF"
  | "HOLIDAY";

export type AttendanceSource =
  | "PUNCH"
  | "LEAVE"
  | "SYSTEM"
  | "HR";

export type WorkMode =
  | "OFFICE"
  | "WORK_FROM_HOME"
  | "MEETING";

export interface IAttendance
  extends Document {

  employeeId: mongoose.Types.ObjectId;

  date: Date;

  status: AttendanceStatus;

  punchIn?: Date;

  punchOut?: Date;

  punchInLocation?: string;

  punchOutLocation?: string;

  punchInLatitude?: number;

  punchInLongitude?: number;

  punchOutLatitude?: number;

  punchOutLongitude?: number;

  workMode?: WorkMode;

  punchInSelfie?: string;

  punchOutSelfie?: string;

  totalMinutes: number;

  workingHours: number;

  leaveRequestId?: mongoose.Types.ObjectId;

  source: AttendanceSource;

  remarks?: string;

  createdAt: Date;

  updatedAt: Date;
}

const AttendanceSchema =
  new Schema<IAttendance>(
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
      // DATE
      // ==========================================

      date: {
        type: Date,
        required: true,
        index: true,
      },

      // ==========================================
      // STATUS
      // ==========================================

      status: {
        type: String,

        enum: [
          "PRESENT",
          "ABSENT",
          "HALF_DAY",
          "LEAVE",
          "WEEK_OFF",
          "HOLIDAY",
        ],

        required: true,

        default: "ABSENT",
      },

      // ==========================================
      // PUNCH IN
      // ==========================================

      punchIn: {
        type: Date,
      },

      punchInLocation: {
        type: String,
        trim: true,
      },

      punchInLatitude: {
        type: Number,
      },

      punchInLongitude: {
        type: Number,
      },

      workMode: {
        type: String,
        enum: ["OFFICE", "WORK_FROM_HOME", "MEETING"],
      },

      punchInSelfie: {
        type: String,
        trim: true,
      },

      // ==========================================
      // PUNCH OUT
      // ==========================================

      punchOut: {
        type: Date,
      },

      punchOutLocation: {
        type: String,
        trim: true,
      },

      punchOutLatitude: {
        type: Number,
      },

      punchOutLongitude: {
        type: Number,
      },

      punchOutSelfie: {
        type: String,
        trim: true,
      },

      // ==========================================
      // WORKING TIME
      // ==========================================

      totalMinutes: {
        type: Number,
        default: 0,
        min: 0,
      },

      workingHours: {
        type: Number,
        default: 0,
        min: 0,
      },

      // ==========================================
      // LEAVE REFERENCE
      // ==========================================

      leaveRequestId: {
        type: Schema.Types.ObjectId,
        ref: "LeaveRequest",
      },

      // ==========================================
      // SOURCE
      // ==========================================

      source: {
        type: String,

        enum: [
          "PUNCH",
          "LEAVE",
          "SYSTEM",
          "HR",
        ],

        default: "SYSTEM",
      },

      // ==========================================
      // REMARKS
      // ==========================================

      remarks: {
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
// UNIQUE DAILY ATTENDANCE
// ==========================================

AttendanceSchema.index(
  {
    employeeId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model<IAttendance>(
  "Attendance",
  AttendanceSchema
);