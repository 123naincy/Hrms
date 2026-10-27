import { Request, Response } from "express";
import { LeaveService } from "../services/leave.service";

const leaveService = new LeaveService();

export class LeaveController {
  async applyLeave(
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

      const {
        leaveType,
        startDate,
        endDate,
        reason,
      } = req.body;

      if (
        !leaveType ||
        !startDate ||
        !endDate ||
        !reason
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Leave type, start date, end date and reason are required.",
        });
      }

      const leave =
        await leaveService.applyLeave(
          req.user.id,
          {
            leaveType,
            startDate,
            endDate,
            reason,
          }
        );

      return res.status(201).json({
        success: true,
        message:
          "Leave applied successfully",
        data: leave,
      });
    } catch (error: any) {
      console.error(
        "Apply Leave Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to apply leave",
      });
    }
  }
}