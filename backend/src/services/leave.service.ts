import Leave, {
  LeaveType,
} from "../models/Leave";

import User from "../models/User";

export class LeaveService {
  async applyLeave(
    employeeId: string,
    data: {
      leaveType: LeaveType;
      startDate: string;
      endDate: string;
      reason: string;
    }
  ) {
    const employee = await User.findById(
      employeeId
    );

    if (!employee) {
      throw new Error("Employee not found");
    }

    if (!employee.isActive) {
      throw new Error(
        "Your account is inactive."
      );
    }

    const startDate = new Date(
      `${data.startDate}T00:00:00`
    );

    const endDate = new Date(
      `${data.endDate}T00:00:00`
    );

    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime())
    ) {
      throw new Error("Invalid leave dates");
    }

    if (startDate > endDate) {
      throw new Error(
        "Start date cannot be after end date."
      );
    }

    if (!data.reason?.trim()) {
      throw new Error(
        "Leave reason is required."
      );
    }

    // Calculate number of days
    const difference =
      endDate.getTime() -
      startDate.getTime();

    const totalDays =
      Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ) + 1;

    // Check overlapping leave
    const overlappingLeave =
      await Leave.findOne({
        employeeId,
        status: {
          $in: ["PENDING", "APPROVED"],
        },

        startDate: {
          $lte: endDate,
        },

        endDate: {
          $gte: startDate,
        },
      });

    if (overlappingLeave) {
      throw new Error(
        "You already have a leave request for this date range."
      );
    }

    const leave = await Leave.create({
      employeeId,

      leaveType: data.leaveType,

      startDate,

      endDate,

      totalDays,

      reason: data.reason.trim(),

      // Always PENDING
      status: "PENDING",

      appliedAt: new Date(),
    });

    return leave;
  }
}