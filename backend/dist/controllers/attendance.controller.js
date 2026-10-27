"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendance_service_1 = require("../services/attendance.service");
const attendanceService = new attendance_service_1.AttendanceService();
class AttendanceController {
    // ==========================================
    // PUNCH IN
    // ==========================================
    async punchIn(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { location, selfie, } = req.body;
            const attendance = await attendanceService.punchIn(req.user.id, {
                location,
                selfie,
            });
            return res.status(201).json({
                success: true,
                message: "Punch-In successful",
                data: attendance,
            });
        }
        catch (error) {
            console.error("Punch-In Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Punch-In failed",
            });
        }
    }
    // ==========================================
    // PUNCH OUT
    // ==========================================
    async punchOut(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { location, selfie, } = req.body;
            const attendance = await attendanceService.punchOut(req.user.id, {
                location,
                selfie,
            });
            return res.status(200).json({
                success: true,
                message: "Punch-Out successful",
                data: attendance,
            });
        }
        catch (error) {
            console.error("Punch-Out Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Punch-Out failed",
            });
        }
    }
    // ==========================================
    // TODAY'S ATTENDANCE
    // ==========================================
    async getToday(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const attendance = await attendanceService.getTodayAttendance(req.user.id);
            return res.status(200).json({
                success: true,
                message: "Today's attendance fetched successfully",
                data: attendance,
            });
        }
        catch (error) {
            console.error("Today's Attendance Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to fetch today's attendance",
            });
        }
    }
    // ==========================================
    // MY ATTENDANCE HISTORY
    // ==========================================
    async getMyAttendance(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { fromDate, toDate, } = req.query;
            const records = await attendanceService.getMyAttendance(req.user.id, fromDate
                ? new Date(fromDate)
                : undefined, toDate
                ? new Date(toDate)
                : undefined);
            return res.status(200).json({
                success: true,
                message: "Attendance history fetched successfully",
                data: records,
            });
        }
        catch (error) {
            console.error("Attendance History Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to fetch attendance history",
            });
        }
    }
    // ==========================================
    // MONTHLY ATTENDANCE
    // ==========================================
    async getMonthlyAttendance(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const currentDate = new Date();
            const year = Number(req.query.year ||
                currentDate.getFullYear());
            const month = Number(req.query.month ||
                currentDate.getMonth() + 1);
            const result = await attendanceService.getMonthlyAttendance(req.user.id, year, month);
            return res.status(200).json({
                success: true,
                message: "Monthly attendance fetched successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Monthly Attendance Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to fetch monthly attendance",
            });
        }
    }
}
exports.AttendanceController = AttendanceController;
