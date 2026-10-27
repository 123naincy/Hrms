import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface ILeaveBalance extends Document {
  employeeId: mongoose.Types.ObjectId;

  leaveType: string;

  leaveYear: string;

  openingBalance: number;

  accrued: number;

  carryForward: number;

  used: number;

  pending: number;

  available: number;

  lastAccrualDate?: Date;
}

const LeaveBalanceSchema =
  new Schema<ILeaveBalance>(
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

      leaveYear: {
        type: String,
        required: true,
      },

      openingBalance: {
        type: Number,
        default: 0,
        min: 0,
      },

      accrued: {
        type: Number,
        default: 0,
        min: 0,
      },

      carryForward: {
        type: Number,
        default: 0,
        min: 0,
      },

      used: {
        type: Number,
        default: 0,
        min: 0,
      },

      pending: {
        type: Number,
        default: 0,
        min: 0,
      },

      available: {
        type: Number,
        default: 0,
        min: 0,
      },

      lastAccrualDate: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

LeaveBalanceSchema.index(
  {
    employeeId: 1,
    leaveType: 1,
    leaveYear: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model<ILeaveBalance>(
  "LeaveBalance",
  LeaveBalanceSchema
);