"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRequestController = void 0;
const leaveRequest_service_1 = require("../services/leaveRequest.service");
const leaveRequestService = new leaveRequest_service_1.LeaveRequestService();
class LeaveRequestController {
    async applyLeave(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { leaveType, startDate, endDate, dayType, reason, attachment, relationship, childNumber, } = req.body;
            if (!leaveType ||
                !startDate ||
                !endDate ||
                !reason) {
                return res.status(400).json({
                    success: false,
                    message: "Leave type, start date, end date and reason are required",
                });
            }
            const leaveRequest = await leaveRequestService.applyLeave(req.user.id, {
                leaveType,
                startDate,
                endDate,
                dayType: dayType || "FULL_DAY",
                reason,
                attachment,
                relationship,
                childNumber,
            });
            return res.status(201).json({
                success: true,
                message: "Leave applied successfully",
                data: leaveRequest,
            });
        }
        catch (error) {
            console.error("Apply Leave Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to apply leave",
            });
        }
    }
}
exports.LeaveRequestController = LeaveRequestController;
