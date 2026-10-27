"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const LeavePolicySchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
// ==========================================
// INDEX
// ==========================================
// Same leave type can exist for different
// policy years, but the same policy version
// should not be duplicated.
LeavePolicySchema.index({
    code: 1,
    effectiveFrom: 1,
}, {
    unique: true,
});
exports.default = mongoose_1.default.model("LeavePolicy", LeavePolicySchema);
