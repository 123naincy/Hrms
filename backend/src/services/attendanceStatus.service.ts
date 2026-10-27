import LeaveRequest from "../models/LeaveRequest";
import WeekOff from "../models/WeekOff";
import Holiday from "../models/Holiday";
import User from "../models/User";
import { resolveWeeklyOffs } from "../utils/weekOff";

export class AttendanceStatusService {

  private startOfDay(
    date: Date
  ): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  private endOfDay(
    date: Date
  ): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    );
  }

  async getDayStatus(
    employeeId: string,
    date: Date
  ) {

    const start =
      this.startOfDay(date);

    const end =
      this.endOfDay(date);

    // ==========================================
    // 1. APPROVED LEAVE
    // ==========================================

    const leave =
      await LeaveRequest.findOne({
        employeeId,

        status: "APPROVED",

        startDate: {
          $lte: end,
        },

        endDate: {
          $gte: start,
        },
      });

    if (leave) {

      return {
        status: "LEAVE" as const,

        leaveRequestId:
          leave._id,

        leaveType:
          leave.leaveType,

        chargeableDays:
          leave.chargeableDays,
      };
    }

    // ==========================================
    // 2. MANUAL WEEK-OFF
    // ==========================================

    const weekOff =
      await WeekOff.findOne({
        employeeId,

        date: {
          $gte: start,
          $lte: end,
        },
      });

    if (weekOff) {

      return {
        status: "WEEK_OFF" as const,
      };
    }

    const employee = await User.findById(employeeId).select("weeklyOffs");
    const weeklyOffs = await resolveWeeklyOffs(employee?.weeklyOffs);

    if (weeklyOffs.includes(date.getDay())) {
      return {
        status: "WEEK_OFF" as const,
      };
    }

    // ==========================================
    // 3. HOLIDAY
    // ==========================================

    const holiday =
      await Holiday.findOne({
        date: {
          $gte: start,
          $lte: end,
        },

        isActive: true,
      });

    if (holiday) {

      return {
        status: "HOLIDAY" as const,

        holidayId:
          holiday._id,

        holidayName:
          holiday.name,
      };
    }

    // ==========================================
    // 4. NORMAL WORKING DAY
    // ==========================================

    return {
      status: "WORKING_DAY" as const,
    };
  }
}