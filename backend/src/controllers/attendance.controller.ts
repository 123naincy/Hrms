import { Request, Response } from "express";

import {
  AttendanceService,
} from "../services/attendance.service";
import { ROLES } from "../constants/roles";

const attendanceService =
  new AttendanceService();

export class AttendanceController {

  // ==========================================
  // PUNCH IN
  // ==========================================

  async punchIn(
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
        location,
        selfie,
        workMode,
        latitude,
        longitude,
      } = req.body;

      const attendance =
        await attendanceService.punchIn(
          req.user.id,
          {
            location,
            selfie,
            workMode,
            latitude,
            longitude,
          }
        );

      return res.status(201).json({
        success: true,
        message:
          "Punch-In successful",
        data: attendance,
      });

    } catch (error: any) {

      console.error(
        "Punch-In Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Punch-In failed",
      });
    }
  }

  // ==========================================
  // PUNCH OUT
  // ==========================================

  async punchOut(
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
        location,
        selfie,
        latitude,
        longitude,
      } = req.body;

      const attendance =
        await attendanceService.punchOut(
          req.user.id,
          {
            location,
            selfie,
            latitude,
            longitude,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Punch-Out successful",
        data: attendance,
      });

    } catch (error: any) {

      console.error(
        "Punch-Out Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Punch-Out failed",
      });
    }
  }
  // ==========================================
// TODAY'S ATTENDANCE
// ==========================================

async getToday(
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

    const attendance =
      await attendanceService.getTodayAttendance(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message:
        "Today's attendance fetched successfully",
      data: attendance,
    });

  } catch (error: any) {

    console.error(
      "Today's Attendance Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch today's attendance",
    });
  }
}
// ==========================================
// MY ATTENDANCE HISTORY
// ==========================================

async getMyAttendance(
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
      fromDate,
      toDate,
    } = req.query;

    const records =
      await attendanceService.getMyAttendance(
        req.user.id,

        fromDate
          ? new Date(
              fromDate as string
            )
          : undefined,

        toDate
          ? new Date(
              toDate as string
            )
          : undefined
      );

    return res.status(200).json({
      success: true,

      message:
        "Attendance history fetched successfully",

      data: records,
    });

  } catch (error: any) {

    console.error(
      "Attendance History Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch attendance history",
    });
  }
}


// ==========================================
// MONTHLY ATTENDANCE
// ==========================================

async getMonthlyAttendance(
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

    const currentDate =
      new Date();

    const year = Number(
      req.query.year ||
      currentDate.getFullYear()
    );

    const month = Number(
      req.query.month ||
      currentDate.getMonth() + 1
    );

    const result =
      await attendanceService.getMonthlyAttendance(
        req.user.id,
        year,
        month
      );

    return res.status(200).json({
      success: true,

      message:
        "Monthly attendance fetched successfully",

      data: result,
    });

  } catch (error: any) {

    console.error(
      "Monthly Attendance Error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch monthly attendance",
    });
  }
}

  async getOrgAttendance(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const allowed = [
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.HR,
      ];

      if (!allowed.includes(req.user.role as typeof ROLES.HR)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to view organization attendance",
        });
      }

      const date =
        typeof req.query.date === "string"
          ? req.query.date
          : undefined;

      const data = await attendanceService.getOrgAttendance(date);

      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch attendance",
      });
    }
  }

  async getTeamAttendance(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const allowed = [
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.HR,
        ROLES.MANAGER,
      ];

      if (!allowed.includes(req.user.role as typeof ROLES.MANAGER)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to view team attendance",
        });
      }

      const date =
        typeof req.query.date === "string"
          ? req.query.date
          : undefined;

      const data = await attendanceService.getTeamAttendance(
        req.user.id,
        date
      );

      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to fetch team attendance",
      });
    }
  }
}