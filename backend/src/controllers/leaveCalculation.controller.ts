import { Request, Response } from "express";
import { LeaveCalculationService } from "../services/leaveCalculation.service";

const leaveCalculationService =
  new LeaveCalculationService();

export class LeaveCalculationController {

  async calculate(
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
        startDate,
        endDate,
      } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message:
            "Start date and end date are required",
        });
      }

      const result =
        await leaveCalculationService.calculateLeave(
          req.user.id,
          new Date(startDate),
          new Date(endDate)
        );

      return res.status(200).json({
        success: true,
        message:
          "Leave calculation completed",
        data: result,
      });

    } catch (error: any) {
      console.error(
        "Leave Calculation Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Failed to calculate leave",
      });
    }
  }
}