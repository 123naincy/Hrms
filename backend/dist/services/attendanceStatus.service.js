"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceStatusService = void 0;
const LeaveRequest_1 = __importDefault(require("../models/LeaveRequest"));
const WeekOff_1 = __importDefault(require("../models/WeekOff"));
const Holiday_1 = __importDefault(require("../models/Holiday"));
class AttendanceStatusService {
    startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    endOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    }
    async getDayStatus(employeeId, date) {
        const start = this.startOfDay(date);
        const end = this.endOfDay(date);
        // ==========================================
        // 1. APPROVED LEAVE
        // ==========================================
        const leave = await LeaveRequest_1.default.findOne({
            employeeId,
            status: "APPROVED",
            startDate: {
                $lte: end,
            },
            endDate: {
                $gte: start,
            },
        });
        if (leave) {
            return {
                status: "LEAVE",
                leaveRequestId: leave._id,
                leaveType: leave.leaveType,
                chargeableDays: leave.chargeableDays,
            };
        }
        // ==========================================
        // 2. MANUAL WEEK-OFF
        // ==========================================
        const weekOff = await WeekOff_1.default.findOne({
            employeeId,
            date: {
                $gte: start,
                $lte: end,
            },
        });
        if (weekOff) {
            return {
                status: "WEEK_OFF",
            };
        }
        // ==========================================
        // 3. HOLIDAY
        // ==========================================
        const holiday = await Holiday_1.default.findOne({
            date: {
                $gte: start,
                $lte: end,
            },
            isActive: true,
        });
        if (holiday) {
            return {
                status: "HOLIDAY",
                holidayId: holiday._id,
                holidayName: holiday.name,
            };
        }
        // ==========================================
        // 4. NORMAL WORKING DAY
        // ==========================================
        return {
            status: "WORKING_DAY",
        };
    }
}
exports.AttendanceStatusService = AttendanceStatusService;
