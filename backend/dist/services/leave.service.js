"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveService = void 0;
const Leave_1 = __importDefault(require("../models/Leave"));
const User_1 = __importDefault(require("../models/User"));
class LeaveService {
    async applyLeave(employeeId, data) {
        const employee = await User_1.default.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (!employee.isActive) {
            throw new Error("Your account is inactive.");
        }
        const startDate = new Date(`${data.startDate}T00:00:00`);
        const endDate = new Date(`${data.endDate}T00:00:00`);
        if (isNaN(startDate.getTime()) ||
            isNaN(endDate.getTime())) {
            throw new Error("Invalid leave dates");
        }
        if (startDate > endDate) {
            throw new Error("Start date cannot be after end date.");
        }
        if (!data.reason?.trim()) {
            throw new Error("Leave reason is required.");
        }
        // Calculate number of days
        const difference = endDate.getTime() -
            startDate.getTime();
        const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
        // Check overlapping leave
        const overlappingLeave = await Leave_1.default.findOne({
            employeeId,
            status: {
                $in: ["PENDING", "APPROVED"],
            },
            startDate: {
                $lte: endDate,
            },
            endDate: {
                $gte: startDate,
            },
        });
        if (overlappingLeave) {
            throw new Error("You already have a leave request for this date range.");
        }
        const leave = await Leave_1.default.create({
            employeeId,
            leaveType: data.leaveType,
            startDate,
            endDate,
            totalDays,
            reason: data.reason.trim(),
            // Always PENDING
            status: "PENDING",
            appliedAt: new Date(),
        });
        return leave;
    }
}
exports.LeaveService = LeaveService;
