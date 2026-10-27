import mongoose, { Document, Schema } from "mongoose";

export type LeavePolicyType =
  | "EL"
  | "CSL"
  | "MATERNITY"
  | "BEREAVEMENT";

export interface ILeavePolicy extends Document {
  code: LeavePolicyType;

  name: string;

  description?: string;

  annualEntitlement?: number;

  monthlyAccrual?: number;

  maxCarryForward: number;

  encashmentAllowed: boolean;

  halfDayAllowed: boolean;

  requiresMedicalCertificate: boolean;

  medicalCertificateAfterDays?: number;

  // Maternity
  maternityWeeks?: number;

  maternityChildLimit?: number;

  maternityWeeksAfterChildLimit?: number;

  maternityBeforeDeliveryWeeks?: number;

  minimumServiceDays?: number;

  // Bereavement
  bereavementDays?: number;

  eligibleRelationships?: string[];

  isActive: boolean;

  effectiveFrom: Date;

  effectiveTo?: Date;
}

const LeavePolicySchema =
  new Schema<ILeavePolicy>(
    {
      code: {
        type: String,
        enum: [
          "EL",
          "CSL",
          "MATERNITY",
          "BEREAVEMENT",
        ],
        required: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
      },

      annualEntitlement: {
        type: Number,
        min: 0,
      },

      monthlyAccrual: {
        type: Number,
        min: 0,
      },

      maxCarryForward: {
        type: Number,
        default: 0,
        min: 0,
      },

      encashmentAllowed: {
        type: Boolean,
        default: false,
      },

      halfDayAllowed: {
        type: Boolean,
        default: false,
      },

      requiresMedicalCertificate: {
        type: Boolean,
        default: false,
      },

      medicalCertificateAfterDays: {
        type: Number,
        min: 1,
      },

      // =========================
      // MATERNITY
      // =========================

      maternityWeeks: {
        type: Number,
        min: 0,
      },

      maternityChildLimit: {
        type: Number,
        min: 1,
      },

      maternityWeeksAfterChildLimit: {
        type: Number,
        min: 0,
      },

      maternityBeforeDeliveryWeeks: {
        type: Number,
        min: 0,
      },

      minimumServiceDays: {
        type: Number,
        min: 0,
      },

      // =========================
      // BEREAVEMENT
      // =========================

      bereavementDays: {
        type: Number,
        min: 0,
      },

      eligibleRelationships: {
        type: [String],
        default: [],
      },

      // =========================
      // POLICY STATUS
      // =========================

      isActive: {
        type: Boolean,
        default: true,
      },

      effectiveFrom: {
        type: Date,
        required: true,
      },

      effectiveTo: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

// ==========================================
// INDEX
// ==========================================

// Same leave type can exist for different
// policy years, but the same policy version
// should not be duplicated.

LeavePolicySchema.index(
  {
    code: 1,
    effectiveFrom: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model<ILeavePolicy>(
  "LeavePolicy",
  LeavePolicySchema
);