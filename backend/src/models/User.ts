import mongoose, { Document, Schema } from "mongoose";
import { ROLES, UserRole } from "../constants/roles";

export interface IUser extends Document {
  employeeCode: string;
  fullName: string;
  email: string;
  mobile: string;
  password: string;

  role: UserRole;

  department?: string;
  designation?: string;
  managerId?: mongoose.Types.ObjectId;

  joiningDate?: Date;

  weeklyOffs?: number[];

  profileImage?: string;

  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.EMPLOYEE,
      required: true,
    },

    department: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    joiningDate: {
      type: Date,
    },

    weeklyOffs: {
      type: [Number],
      default: undefined,
    },

    profileImage: {
      type: String,
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

export default mongoose.model<IUser>("User", UserSchema);