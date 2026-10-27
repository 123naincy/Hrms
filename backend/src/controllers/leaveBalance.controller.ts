import { Request, Response } from "express";
import { LeaveBalanceService } from "../services/leaveBalance.service";

const leaveBalanceService =
  new LeaveBalanceService();

export class LeaveBalanceController {

  // ==========================================
  // INITIALIZE BALANCE
  // ==========================================

  async initialize(
    req: Request,
    res: Response
  ) {
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

      const balances =
        await leaveBalanceService.initializeEmployeeBalances(
          employeeId
        );

      return res.status(201).json({
        success: true,
        message:
          "Leave balances initialized successfully",
        data: balances,
      });
    } catch (error: any) {
      console.error(
        "Initialize Leave Balance Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to initialize leave balances",
      });
    }
  }

  // ==========================================
  // MY BALANCE
  // ==========================================

  async getMyBalance(
    req: Request,
    res: Response
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const balances =
        await leaveBalanceService.getEmployeeBalances(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        message:
          "Leave balances fetched successfully",
        data: balances,
      });
    } catch (error: any) {
      console.error(
        "Get Leave Balance Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch leave balances",
      });
    }
  }
}