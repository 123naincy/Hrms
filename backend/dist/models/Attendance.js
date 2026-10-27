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
const AttendanceSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// ==========================================
// UNIQUE DAILY ATTENDANCE
// ==========================================
AttendanceSchema.index({
    employeeId: 1,
    date: 1,
}, {
    unique: true,
});
exports.default = mongoose_1.default.model("Attendance", AttendanceSchema);
