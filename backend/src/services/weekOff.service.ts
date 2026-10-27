import mongoose from "mongoose";
import WeekOff from "../models/WeekOff";
import User from "../models/User";

export class WeekOffService {

  async createWeekOff(
    employeeId: string,
    date: string,
    reason: string | undefined,
    createdBy: string
  ) {
    // Check employee
    const employee = await User.findById(employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    if (!employee.isActive) {
      throw new Error(
        "Cannot apply week-off to an inactive employee."
      );
    }

    // Convert date
    const weekOffDate = new Date(`${date}T00:00:00`);

    if (isNaN(weekOffDate.getTime())) {
      throw new Error("Invalid date");
    }

    // Check duplicate
    const existing = await WeekOff.findOne({
      employeeId: new mongoose.Types.ObjectId(
        employeeId
      ),
      date: weekOffDate,
    });

    if (existing) {
      throw new Error(
        "Week-off is already applied for this date."
      );
    }

    // Create
    const weekOff = await WeekOff.create({
      employeeId,
      date: weekOffDate,
      reason,
      createdBy,
    });

    return weekOff;
  }

  async getWeekOffs() {
    return WeekOff.find()
      .populate(
        "employeeId",
        "employeeCode fullName department designation"
      )
      .populate(
        "createdBy",
        "employeeCode fullName"
      )
      .sort({ date: -1 });
  }
}