import mongoose, { Document, Schema } from "mongoose";

export interface IHoliday extends Document {
  name: string;
  date: Date;
  isActive: boolean;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IHoliday>("Holiday", HolidaySchema);
