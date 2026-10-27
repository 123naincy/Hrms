"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveCalculationService = void 0;
const Holiday_1 = __importDefault(require("../models/Holiday"));
const LeaveRequest_1 = __importDefault(require("../models/LeaveRequest"));
class LeaveCalculationService {
    async calculateLeave(employeeId, startDate, endDate) {
        const from = new Date(startDate);
        const to = new Date(endDate);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            throw new Error("Invalid leave dates");
        }
        if (from > to) {
            throw new Error("Start date cannot be after end date");
        }
        const totalCalendarDays = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const weekendDates = [];
        const holidayDates = [];
        for (let current = new Date(from); current <= to; current.setDate(current.getDate() + 1)) {
            const day = current.getDay();
            if (day === 0 || day === 6) {
                weekendDates.push(new Date(current));
            }
        }
        const holidays = await Holiday_1.default.find({
            date: { $gte: from, $lte: to },
            isActive: true,
        });
        holidays.forEach((holiday) => {
            holidayDates.push(new Date(holiday.date));
        });
        const excludedDates = new Set([...weekendDates, ...holidayDates].map((date) => this.dateKey(date)));
        const workingDays = [];
        for (let current = new Date(from); current <= to; current.setDate(current.getDate() + 1)) {
            const key = this.dateKey(current);
            if (!excludedDates.has(key)) {
                workingDays.push(new Date(current));
            }
        }
        const existingLeave = await LeaveRequest_1.default.find({
            employeeId,
            status: { $in: ["PENDING", "APPROVED"] },
            startDate: { $lte: to },
            endDate: { $gte: from },
        });
        const sandwichDates = [];
        existingLeave.forEach((request) => {
            const rangeStart = new Date(request.startDate);
            const rangeEnd = new Date(request.endDate);
            for (let current = new Date(rangeStart); current <= rangeEnd; current.setDate(current.getDate() + 1)) {
                if (current >= from && current <= to) {
                    sandwichDates.push(new Date(current));
                }
            }
        });
        const chargeableDays = workingDays.length;
        return {
            totalCalendarDays,
            workingLeaveDays: workingDays.length,
            sandwichDays: sandwichDates.length,
            chargeableDays,
            sandwichDates,
            weekOffDates: weekendDates,
            holidayDates,
        };
    }
    dateKey(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
}
exports.LeaveCalculationService = LeaveCalculationService;
