import Holiday from "../models/Holiday";
import LeaveRequest from "../models/LeaveRequest";

export class LeaveCalculationService {
  async calculateLeave(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ) {
    const from = new Date(startDate);
    const to = new Date(endDate);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new Error("Invalid leave dates");
    }

    if (from > to) {
      throw new Error("Start date cannot be after end date");
    }

    const totalCalendarDays =
      Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const weekendDates: Date[] = [];
    const holidayDates: Date[] = [];

    for (let current = new Date(from); current <= to; current.setDate(current.getDate() + 1)) {
      const day = current.getDay();

      if (day === 0 || day === 6) {
        weekendDates.push(new Date(current));
      }
    }

    const holidays = await Holiday.find({
      date: { $gte: from, $lte: to },
      isActive: true,
    });

    holidays.forEach((holiday: { date: Date }) => {
      holidayDates.push(new Date(holiday.date));
    });

    const excludedDates = new Set(
      [...weekendDates, ...holidayDates].map((date) => this.dateKey(date))
    );

    const workingDays = [] as Date[];

    for (let current = new Date(from); current <= to; current.setDate(current.getDate() + 1)) {
      const key = this.dateKey(current);
      if (!excludedDates.has(key)) {
        workingDays.push(new Date(current));
      }
    }

    const existingLeave = await LeaveRequest.find({
      employeeId,
      status: { $in: ["PENDING", "APPROVED"] },
      startDate: { $lte: to },
      endDate: { $gte: from },
    });

    const sandwichDates: Date[] = [];

    existingLeave.forEach((request) => {
      const rangeStart = new Date(request.startDate);
      const rangeEnd = new Date(request.endDate);

      for (let current = new Date(rangeStart); current <= rangeEnd; current.setDate(current.getDate() + 1)) {
        if (current >= from && current <= to) {
          sandwichDates.push(new Date(current));
        }
      }
    });

    const chargeableDays = workingDays.length;

    return {
      totalCalendarDays,
      workingLeaveDays: workingDays.length,
      sandwichDays: sandwichDates.length,
      chargeableDays,
      sandwichDates,
      weekOffDates: weekendDates,
      holidayDates,
    };
  }

  private dateKey(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
}
