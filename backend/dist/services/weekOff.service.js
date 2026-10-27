"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeekOffService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const WeekOff_1 = __importDefault(require("../models/WeekOff"));
const User_1 = __importDefault(require("../models/User"));
class WeekOffService {
    async createWeekOff(employeeId, date, reason, createdBy) {
        // Check employee
        const employee = await User_1.default.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (!employee.isActive) {
            throw new Error("Cannot apply week-off to an inactive employee.");
        }
        // Convert date
        const weekOffDate = new Date(`${date}T00:00:00`);
        if (isNaN(weekOffDate.getTime())) {
            throw new Error("Invalid date");
        }
        // Check duplicate
        const existing = await WeekOff_1.default.findOne({
            employeeId: new mongoose_1.default.Types.ObjectId(employeeId),
            date: weekOffDate,
        });
        if (existing) {
            throw new Error("Week-off is already applied for this date.");
        }
        // Create
        const weekOff = await WeekOff_1.default.create({
            employeeId,
            date: weekOffDate,
            reason,
            createdBy,
        });
        return weekOff;
    }
    async getWeekOffs() {
        return WeekOff_1.default.find()
            .populate("employeeId", "employeeCode fullName department designation")
            .populate("createdBy", "employeeCode fullName")
            .sort({ date: -1 });
    }
}
exports.WeekOffService = WeekOffService;
