import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IWeekOff extends Document {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  reason?: string;
  createdBy: mongoose.Types.ObjectId;
}

const WeekOffSchema = new Schema<IWeekOff>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 250,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One week-off per employee for a particular date
WeekOffSchema.index(
  {
    employeeId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model<IWeekOff>(
  "WeekOff",
  WeekOffSchema
);