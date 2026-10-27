"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeekOffController = void 0;
const weekOff_service_1 = require("../services/weekOff.service");
const weekOffService = new weekOff_service_1.WeekOffService();
class WeekOffController {
    async createWeekOff(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { employeeId, date, reason, } = req.body;
            if (!employeeId || !date) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID and date are required.",
                });
            }
            const weekOff = await weekOffService.createWeekOff(employeeId, date, reason, req.user.id);
            return res.status(201).json({
                success: true,
                message: "Week-off applied successfully",
                data: weekOff,
            });
        }
        catch (error) {
            console.error("Create Week-Off Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to apply week-off",
            });
        }
    }
    async getWeekOffs(req, res) {
        try {
            const weekOffs = await weekOffService.getWeekOffs();
            return res.status(200).json({
                success: true,
                message: "Week-offs fetched successfully",
                data: weekOffs,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message ||
                    "Failed to fetch week-offs",
            });
        }
    }
}
exports.WeekOffController = WeekOffController;
