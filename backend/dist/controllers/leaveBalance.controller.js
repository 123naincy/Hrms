"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveBalanceController = void 0;
const leaveBalance_service_1 = require("../services/leaveBalance.service");
const leaveBalanceService = new leaveBalance_service_1.LeaveBalanceService();
class LeaveBalanceController {
    // ==========================================
    // INITIALIZE BALANCE
    // ==========================================
    async initialize(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { employeeId } = req.body;
            if (!employeeId) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID is required",
                });
            }
            const balances = await leaveBalanceService.initializeEmployeeBalances(employeeId);
            return res.status(201).json({
                success: true,
                message: "Leave balances initialized successfully",
                data: balances,
            });
        }
        catch (error) {
            console.error("Initialize Leave Balance Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to initialize leave balances",
            });
        }
    }
    // ==========================================
    // MY BALANCE
    // ==========================================
    async getMyBalance(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const balances = await leaveBalanceService.getEmployeeBalances(req.user.id);
            return res.status(200).json({
                success: true,
                message: "Leave balances fetched successfully",
                data: balances,
            });
        }
        catch (error) {
            console.error("Get Leave Balance Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to fetch leave balances",
            });
        }
    }
}
exports.LeaveBalanceController = LeaveBalanceController;
