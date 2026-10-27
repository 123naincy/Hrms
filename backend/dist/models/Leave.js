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
const LeaveSchema = new mongoose_1.Schema({
    employeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
LeaveSchema.index({
    employeeId: 1,
    startDate: 1,
    endDate: 1,
});
exports.default = mongoose_1.default.model("Leave", LeaveSchema);
