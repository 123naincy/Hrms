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
const LeaveRequestSchema = new mongoose_1.Schema({
    // ==========================================
    // EMPLOYEE
    // ==========================================
    employeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    approvedAt: {
        type: Date,
    },
    // ==========================================
    // REJECTION
    // ==========================================
    rejectedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
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
exports.default = mongoose_1.default.model("LeaveRequest", LeaveRequestSchema);
