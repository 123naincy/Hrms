"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveApprovalController = void 0;
const leaveRequest_service_1 = require("../services/leaveRequest.service");
const leaveRequestService = new leaveRequest_service_1.LeaveRequestService();
class LeaveApprovalController {
    // ==========================================
    // APPROVE
    // ==========================================
    async approve(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const { hrRemarks, } = req.body;
            const leaveRequest = await leaveRequestService.approveLeave(id, req.user.id, hrRemarks);
            return res.status(200).json({
                success: true,
                message: "Leave approved successfully",
                data: leaveRequest,
            });
        }
        catch (error) {
            console.error("Approve Leave Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to approve leave",
            });
        }
    }
    // ==========================================
    // REJECT
    // ==========================================
    async reject(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const { rejectionReason, } = req.body;
            if (!rejectionReason?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Rejection reason is required",
                });
            }
            const leaveRequest = await leaveRequestService.rejectLeave(id, req.user.id, rejectionReason);
            return res.status(200).json({
                success: true,
                message: "Leave rejected successfully",
                data: leaveRequest,
            });
        }
        catch (error) {
            console.error("Reject Leave Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to reject leave",
            });
        }
    }
}
exports.LeaveApprovalController = LeaveApprovalController;
