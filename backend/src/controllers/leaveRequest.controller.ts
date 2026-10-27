import { Request, Response } from "express";

import {
  LeaveRequestService,
} from "../services/leaveRequest.service";

const leaveRequestService =
  new LeaveRequestService();

export class LeaveRequestController {

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
        dayType,
        reason,
        attachment,
        relationship,
        childNumber,
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
            "Leave type, start date, end date and reason are required",
        });
      }

      const leaveRequest =
        await leaveRequestService.applyLeave(
          req.user.id,
          {
            leaveType,
            startDate,
            endDate,

            dayType:
              dayType || "FULL_DAY",

            reason,

            attachment,

            relationship,

            childNumber,
          }
        );

      return res.status(201).json({
        success: true,
        message:
          "Leave applied successfully",
        data: leaveRequest,
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

  async getMyLeaves(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await leaveRequestService.getMyLeaves(req.user.id);

      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch leave",
      });
    }
  }

  async getLeaves(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const status =
        typeof req.query.status === "string"
          ? req.query.status
          : undefined;

      const managerId =
        req.user.role === "MANAGER" ? req.user.id : undefined;

      const data = await leaveRequestService.getLeaves(
        status,
        managerId
      );

      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch leave",
      });
    }
  }

  async cancelLeave(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await leaveRequestService.cancelLeave(
        String(req.params.id),
        req.user.id
      );

      return res.json({
        success: true,
        message: "Leave cancelled",
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to cancel leave",
      });
    }
  }
}