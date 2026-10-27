import mongoose from "mongoose";

import Attendance from "../models/Attendance";
import Holiday from "../models/Holiday";
import LeaveRequest from "../models/LeaveRequest";
import User from "../models/User";
import WeekOff from "../models/WeekOff";

import {
  AttendanceStatusService,
} from "./attendanceStatus.service";
import {
  resolveWeeklyOffs,
  weeklyOffLabel,
} from "../utils/weekOff";
import { assertInsideOffice } from "../utils/officeGeofence";

export class AttendanceService {
  private statusService =
    new AttendanceStatusService();

  // =====================================================
  // HELPER
  // =====================================================

  private startOfDay(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  private endOfDay(date: Date): Date {
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

  private dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  // =====================================================
  // PUNCH IN
  // =====================================================

  private readWorkMode(value?: string) {
    const workMode = value || "OFFICE";

    if (
      workMode !== "OFFICE" &&
      workMode !== "WORK_FROM_HOME" &&
      workMode !== "MEETING"
    ) {
      throw new Error(
        "Choose Office, Work from home, or Meeting."
      );
    }

    return workMode;
  }

  private readGps(data?: {
    latitude?: number;
    longitude?: number;
  }) {
    const latitude = Number(data?.latitude);
    const longitude = Number(data?.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error(
        "GPS location is required. Allow location and try again."
      );
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error("GPS location is not valid.");
    }

    return {
      latitude,
      longitude,
      location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
    };
  }

  private readSelfie(value?: string) {
    const selfie = String(value || "").replace(/\s/g, "");

    if (!/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(selfie)) {
      throw new Error("Take a selfie before punching in.");
    }

    if (selfie.length < 2000) {
      throw new Error("Selfie is not clear. Retake the photo and try again.");
    }

    if (selfie.length > 1_800_000) {
      throw new Error("Selfie is too large. Retake a smaller photo.");
    }

    return selfie;
  }

  private async weekSchedule(weeklyOffs?: number[]) {
    const days = await resolveWeeklyOffs(weeklyOffs);

    return {
      weeklyOffs: days,
      weeklyOffLabel: weeklyOffLabel(days),
    };
  }

  async punchIn(
    employeeId: string,
    data?: {
      location?: string;
      selfie?: string;
      workMode?: string;
      latitude?: number;
      longitude?: number;
    }
  ) {

    // ==========================================
    // 1. FIND EMPLOYEE
    // ==========================================

    const employee =
      await User.findById(employeeId);

    if (!employee) {
      throw new Error(
        "Employee not found"
      );
    }

    if (!employee.isActive) {
      throw new Error(
        "Employee account is inactive"
      );
    }

    const now = new Date();

    const today =
      this.startOfDay(now);

    const todayEnd =
      this.endOfDay(now);

    // ==========================================
    // 2. CHECK DAY STATUS
    // ==========================================

    const dayStatus =
      await this.statusService.getDayStatus(
        employeeId,
        now
      );

    if (
      dayStatus.status === "LEAVE"
    ) {
      throw new Error(
        "You are on approved leave today. Punch-In is not allowed."
      );
    }

    if (
      dayStatus.status === "WEEK_OFF"
    ) {
      throw new Error(
        "Today is your Week-Off. Punch-In is not allowed."
      );
    }

    if (
      dayStatus.status === "HOLIDAY"
    ) {
      throw new Error(
        "Today is a holiday. Punch-In is not allowed."
      );
    }

    // ==========================================
    // 3. CHECK EXISTING ATTENDANCE
    // ==========================================

    const existing =
      await Attendance.findOne({
        employeeId,

        date: {
          $gte: today,
          $lte: todayEnd,
        },
      });

    if (existing?.punchIn) {
      throw new Error(
        "You have already punched in today."
      );
    }

    // ==========================================
    // 4. CREATE / UPDATE ATTENDANCE
    // ==========================================

    const gps = this.readGps(data);
    const workMode = this.readWorkMode(data?.workMode);
    const selfie = this.readSelfie(data?.selfie);

    if (workMode === "OFFICE") {
      assertInsideOffice(gps.latitude, gps.longitude);
    }

    const attendance =
      await Attendance.findOneAndUpdate(
        {
          employeeId,

          date: today,
        },

        {
          $set: {
            status: "PRESENT",

            punchIn: now,

            punchInLocation: gps.location,

            punchInLatitude: gps.latitude,

            punchInLongitude: gps.longitude,

            workMode,

            punchInSelfie: selfie,

            source: "PUNCH",
          },
        },

        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    return attendance;
  }

  // =====================================================
  // PUNCH OUT
  // =====================================================

  async punchOut(
    employeeId: string,
    data?: {
      location?: string;
      selfie?: string;
      latitude?: number;
      longitude?: number;
    }
  ) {

    // ==========================================
    // 1. FIND EMPLOYEE
    // ==========================================

    const employee =
      await User.findById(employeeId);

    if (!employee) {
      throw new Error(
        "Employee not found"
      );
    }

    if (!employee.isActive) {
      throw new Error(
        "Employee account is inactive"
      );
    }

    const now = new Date();

    const today =
      this.startOfDay(now);

    const todayEnd =
      this.endOfDay(now);

    // ==========================================
    // 2. FIND TODAY'S ATTENDANCE
    // ==========================================

    const attendance =
      await Attendance.findOne({
        employeeId,

        date: {
          $gte: today,
          $lte: todayEnd,
        },
      });

    if (!attendance) {
      throw new Error(
        "Punch-In not found. Please Punch-In first."
      );
    }

    // ==========================================
    // 3. CHECK PUNCH-IN
    // ==========================================

    if (!attendance.punchIn) {
      throw new Error(
        "Punch-In not found. Please Punch-In first."
      );
    }

    // ==========================================
    // 4. PREVENT DUPLICATE PUNCH-OUT
    // ==========================================

    if (attendance.punchOut) {
      throw new Error(
        "You have already punched out today."
      );
    }

    // ==========================================
    // 5. VALIDATE TIME
    // ==========================================

    if (
      now.getTime() <=
      attendance.punchIn.getTime()
    ) {
      throw new Error(
        "Punch-Out time must be after Punch-In time."
      );
    }

    // ==========================================
    // 6. CALCULATE WORKING MINUTES
    // ==========================================

    const difference =
      now.getTime() -
      attendance.punchIn.getTime();

    const totalMinutes = Math.floor(
      difference /
        (1000 * 60)
    );

    const workingHours =
      Number(
        (
          totalMinutes / 60
        ).toFixed(2)
      );

    // ==========================================
    // 7. UPDATE ATTENDANCE
    // ==========================================

    const gps = this.readGps(data);

    attendance.punchOut =
      now;

    attendance.punchOutLocation =
      gps.location;

    attendance.punchOutLatitude =
      gps.latitude;

    attendance.punchOutLongitude =
      gps.longitude;

    attendance.punchOutSelfie =
      data?.selfie;

    attendance.totalMinutes =
      totalMinutes;

    attendance.workingHours =
      workingHours;

    attendance.status =
      "PRESENT";

    attendance.source =
      "PUNCH";

    await attendance.save();

    return attendance;
  }
  // =====================================================
// GET TODAY'S ATTENDANCE
// =====================================================

async getTodayAttendance(
  employeeId: string
) {
  // ==========================================
  // 1. VERIFY EMPLOYEE
  // ==========================================

  const employee =
    await User.findById(employeeId);

  if (!employee) {
    throw new Error(
      "Employee not found"
    );
  }

  if (!employee.isActive) {
    throw new Error(
      "Employee account is inactive"
    );
  }

  const schedule = await this.weekSchedule(employee.weeklyOffs);

  // ==========================================
  // 2. TODAY
  // ==========================================

  const now = new Date();

  const today =
    this.startOfDay(now);

  const todayEnd =
    this.endOfDay(now);

  // ==========================================
  // 3. GET DAY STATUS
  // ==========================================

  const dayStatus =
    await this.statusService.getDayStatus(
      employeeId,
      now
    );

  // ==========================================
  // 4. GET ATTENDANCE RECORD
  // ==========================================

  const attendance =
    await Attendance.findOne({
      employeeId,

      date: {
        $gte: today,
        $lte: todayEnd,
      },
    });

  // ==========================================
  // 5. SPECIAL DAY
  // ==========================================

  if (
    dayStatus.status === "LEAVE"
  ) {
    return {
      date: today,

      status: "LEAVE",

      leaveType:
        dayStatus.leaveType,

      leaveRequestId:
        dayStatus.leaveRequestId,

      punchIn: null,

      punchOut: null,

      totalMinutes: 0,

      workingHours: 0,

      canPunchIn: false,

      canPunchOut: false,

      ...schedule,
    };
  }

  if (
    dayStatus.status === "WEEK_OFF"
  ) {
    return {
      date: today,

      status: "WEEK_OFF",

      punchIn: null,

      punchOut: null,

      totalMinutes: 0,

      workingHours: 0,

      canPunchIn: false,

      canPunchOut: false,

      ...schedule,
    };
  }

  if (
    dayStatus.status === "HOLIDAY"
  ) {
    return {
      date: today,

      status: "HOLIDAY",

      punchIn: null,

      punchOut: null,

      totalMinutes: 0,

      workingHours: 0,

      canPunchIn: false,

      canPunchOut: false,

      ...schedule,
    };
  }

  // ==========================================
  // 6. NORMAL WORKING DAY
  // ==========================================

  if (!attendance) {
    return {
      date: today,

      status: "NOT_PUNCHED",

      punchIn: null,

      punchOut: null,

      totalMinutes: 0,

      workingHours: 0,

      canPunchIn: true,

      canPunchOut: false,

      workMode: null,

      punchInLocation: null,

      punchOutLocation: null,

      ...schedule,
    };
  }

  // ==========================================
  // 7. PUNCHED IN BUT NOT OUT
  // ==========================================

  if (
    attendance.punchIn &&
    !attendance.punchOut
  ) {
    return {
      date: today,

      status: "PRESENT",

      punchIn:
        attendance.punchIn,

      punchOut: null,

      totalMinutes:
        attendance.totalMinutes,

      workingHours:
        attendance.workingHours,

      canPunchIn: false,

      canPunchOut: true,

      workMode: attendance.workMode || "OFFICE",

      punchInLocation: attendance.punchInLocation || null,

      punchInLatitude: attendance.punchInLatitude ?? null,

      punchInLongitude: attendance.punchInLongitude ?? null,

      punchInSelfie: attendance.punchInSelfie || null,

      punchOutLocation: null,

      ...schedule,
    };
  }

  // ==========================================
  // 8. PUNCHED IN + PUNCHED OUT
  // ==========================================

  return {
    date: today,

    status:
      attendance.status,

    punchIn:
      attendance.punchIn,

    punchOut:
      attendance.punchOut,

    totalMinutes:
      attendance.totalMinutes,

    workingHours:
      attendance.workingHours,

    canPunchIn: false,

    canPunchOut: false,

    workMode: attendance.workMode || "OFFICE",

    punchInLocation: attendance.punchInLocation || null,

    punchInLatitude: attendance.punchInLatitude ?? null,

    punchInLongitude: attendance.punchInLongitude ?? null,

    punchInSelfie: attendance.punchInSelfie || null,

    punchOutLocation: attendance.punchOutLocation || null,

    punchOutLatitude: attendance.punchOutLatitude ?? null,

    punchOutLongitude: attendance.punchOutLongitude ?? null,

    ...schedule,
  };
}
// =====================================================
// GET MY ATTENDANCE HISTORY
// =====================================================

async getMyAttendance(
  employeeId: string,
  fromDate?: Date,
  toDate?: Date
) {
  const employee =
    await User.findById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (!employee.isActive) {
    throw new Error(
      "Employee account is inactive"
    );
  }

  const now = new Date();

  const start =
    fromDate
      ? this.startOfDay(fromDate)
      : new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

  const end =
    toDate
      ? this.endOfDay(toDate)
      : this.endOfDay(now);

  const records =
    await Attendance.find({
      employeeId,

      date: {
        $gte: start,
        $lte: end,
      },
    })
      .sort({
        date: 1,
      });

  return records;
}
// =====================================================
// GET MONTHLY ATTENDANCE
// =====================================================

async getMonthlyAttendance(
  employeeId: string,
  year: number,
  month: number
) {
  // ==========================================
  // VALIDATE MONTH
  // ==========================================

  if (
    month < 1 ||
    month > 12
  ) {
    throw new Error(
      "Month must be between 1 and 12"
    );
  }

  if (
    year < 2000 ||
    year > 2100
  ) {
    throw new Error(
      "Invalid year"
    );
  }

  // ==========================================
  // FIND EMPLOYEE
  // ==========================================

  const employee =
    await User.findById(employeeId);

  if (!employee) {
    throw new Error(
      "Employee not found"
    );
  }

  const personalOffs = await resolveWeeklyOffs(employee.weeklyOffs);

  // ==========================================
  // MONTH RANGE
  // ==========================================

  const monthStart =
    new Date(
      year,
      month - 1,
      1
    );

  const monthEnd =
    new Date(
      year,
      month,
      0,
      23,
      59,
      59,
      999
    );

  // ==========================================
  // ATTENDANCE RECORDS
  // ==========================================

  const attendanceRecords =
    await Attendance.find({
      employeeId,

      date: {
        $gte: monthStart,
        $lte: monthEnd,
      },
    }).sort({
      date: 1,
    });

  // ==========================================
  // LEAVE RECORDS
  // ==========================================

  const leaveRecords =
    await LeaveRequest.find({
      employeeId,

      status: "APPROVED",

      startDate: {
        $lte: monthEnd,
      },

      endDate: {
        $gte: monthStart,
      },
    }).sort({
      startDate: 1,
    });

  // ==========================================
  // WEEK-OFF RECORDS
  // ==========================================

  const weekOffRecords =
    await WeekOff.find({
      employeeId,

      date: {
        $gte: monthStart,
        $lte: monthEnd,
      },
    });

  // ==========================================
  // HOLIDAYS
  // ==========================================

  const holidayRecords =
    await Holiday.find({
      date: {
        $gte: monthStart,
        $lte: monthEnd,
      },

      isActive: true,
    });

  // ==========================================
  // MAP DATA
  // ==========================================

  const attendanceMap =
    new Map<string, any>();

  attendanceRecords.forEach((record: { date: Date }) => {
      attendanceMap.set(
        this.dateKey(record.date),
        record
      );
    }
  );

  const weekOffMap =
    new Map<string, any>();

  weekOffRecords.forEach((record: { date: Date }) => {
      weekOffMap.set(
        this.dateKey(record.date),
        record
      );
    }
  );

  const holidayMap =
    new Map<string, any>();

  holidayRecords.forEach((record: { date: Date }) => {
      holidayMap.set(
        this.dateKey(record.date),
        record
      );
    }
  );

  // ==========================================
  // CREATE LEAVE MAP
  // ==========================================

  const leaveMap =
    new Map<string, any>();

  for (
    const leave of leaveRecords
  ) {

    let current =
      this.startOfDay(
        leave.startDate
      );

    const end =
      this.startOfDay(
        leave.endDate
      );

    while (
      current <= end
    ) {

      if (
        current >= monthStart &&
        current <= monthEnd
      ) {

        leaveMap.set(
          this.dateKey(current),
          leave
        );
      }

      current =
        new Date(
          current
        );

      current.setDate(
        current.getDate() + 1
      );
    }
  }

  // ==========================================
  // BUILD MONTH DAYS
  // ==========================================

  const days: any[] = [];

  const totalDays =
    new Date(
      year,
      month,
      0
    ).getDate();

  // ==========================================
  // SUMMARY
  // ==========================================

  let present = 0;

  let absent = 0;

  let halfDay = 0;

  let leave = 0;

  let weekOff = 0;

  let holiday = 0;

  let totalWorkingMinutes = 0;

  // ==========================================
  // LOOP EACH DAY
  // ==========================================

  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {

    const date =
      new Date(
        year,
        month - 1,
        day
      );

    const key =
      this.dateKey(date);

    const attendance =
      attendanceMap.get(key);

    const leaveRecord =
      leaveMap.get(key);

    const weekOffRecord =
      weekOffMap.get(key);

    const holidayRecord =
      holidayMap.get(key);

    // ========================================
    // ATTENDANCE TAKES PRIORITY
    // ========================================

    if (attendance) {

      if (
        attendance.status ===
        "PRESENT"
      ) {
        present++;
      }

      if (
        attendance.status ===
        "HALF_DAY"
      ) {
        halfDay++;
      }

      if (
        attendance.status ===
        "ABSENT"
      ) {
        absent++;
      }

      if (
        attendance.status ===
        "LEAVE"
      ) {
        leave++;
      }

      if (
        attendance.status ===
        "WEEK_OFF"
      ) {
        weekOff++;
      }

      if (
        attendance.status ===
        "HOLIDAY"
      ) {
        holiday++;
      }

      totalWorkingMinutes +=
        attendance.totalMinutes || 0;

      days.push({
        date,

        status:
          attendance.status,

        punchIn:
          attendance.punchIn || null,

        punchOut:
          attendance.punchOut || null,

        totalMinutes:
          attendance.totalMinutes || 0,

        workingHours:
          attendance.workingHours || 0,

        leaveType:
          leaveRecord?.leaveType ||
          null,

        leaveRequestId:
          leaveRecord?._id ||
          null,

        source:
          attendance.source,
      });

      continue;
    }

    // ========================================
    // APPROVED LEAVE
    // ========================================

    if (leaveRecord) {

      leave++;

      days.push({
        date,

        status: "LEAVE",

        punchIn: null,

        punchOut: null,

        totalMinutes: 0,

        workingHours: 0,

        leaveType:
          leaveRecord.leaveType,

        leaveRequestId:
          leaveRecord._id,

        source: "LEAVE",
      });

      continue;
    }

    // ========================================
    // WEEK-OFF
    // ========================================

    if (weekOffRecord || personalOffs.includes(date.getDay())) {

      weekOff++;

      days.push({
        date,

        status: "WEEK_OFF",

        punchIn: null,

        punchOut: null,

        totalMinutes: 0,

        workingHours: 0,

        leaveType: null,

        leaveRequestId: null,

        source: "SYSTEM",
      });

      continue;
    }

    // ========================================
    // HOLIDAY
    // ========================================

    if (holidayRecord) {

      holiday++;

      days.push({
        date,

        status: "HOLIDAY",

        punchIn: null,

        punchOut: null,

        totalMinutes: 0,

        workingHours: 0,

        holidayName:
          holidayRecord.name,

        leaveType: null,

        leaveRequestId: null,

        source: "SYSTEM",
      });

      continue;
    }

    // ========================================
    // FUTURE DATE
    // ========================================

    const today =
      this.startOfDay(
        new Date()
      );

    if (date > today) {

      days.push({
        date,

        status: "UPCOMING",

        punchIn: null,

        punchOut: null,

        totalMinutes: 0,

        workingHours: 0,

        leaveType: null,

        leaveRequestId: null,

        source: "SYSTEM",
      });

      continue;
    }

    // ========================================
    // NO ATTENDANCE = ABSENT
    // ========================================

    absent++;

    days.push({
      date,

      status: "ABSENT",

      punchIn: null,

      punchOut: null,

      totalMinutes: 0,

      workingHours: 0,

      leaveType: null,

      leaveRequestId: null,

      source: "SYSTEM",
    });
  }

  // ==========================================
  // RETURN
  // ==========================================

  return {
    year,

    month,

    totalDays,

    summary: {
      present,
      absent,
      halfDay,
      leave,
      weekOff,
      holiday,

      totalWorkingMinutes,

      totalWorkingHours:
        Number(
          (
            totalWorkingMinutes / 60
          ).toFixed(2)
        ),
    },

    days,
  };
}

  async getOrgAttendance(dateInput?: string) {
    return this.attendanceForEmployees(undefined, dateInput);
  }

  async getTeamAttendance(
    managerId: string,
    dateInput?: string
  ) {
    return this.attendanceForEmployees(managerId, dateInput);
  }

  private async attendanceForEmployees(
    managerId: string | undefined,
    dateInput?: string
  ) {
    const day = dateInput ? new Date(dateInput) : new Date();

    if (Number.isNaN(day.getTime())) {
      throw new Error("Invalid date");
    }

    const start = this.startOfDay(day);
    const end = this.endOfDay(day);

    const employeeFilter: Record<string, unknown> = {
      isActive: true,
    };

    if (managerId) {
      employeeFilter.managerId = managerId;
    }

    const employees = await User.find(employeeFilter)
      .select("fullName employeeCode department designation role weeklyOffs")
      .sort({ fullName: 1 });

    const records = await Attendance.find({
      employeeId: { $in: employees.map((item) => item._id) },
      date: { $gte: start, $lte: end },
    });

    const recordMap = new Map(
      records.map((record) => [String(record.employeeId), record])
    );

    const datedOffs = await WeekOff.find({
      employeeId: { $in: employees.map((item) => item._id) },
      date: { $gte: start, $lte: end },
    });
    const datedOffSet = new Set(
      datedOffs.map((item) => String(item.employeeId))
    );
    const companyOffs = await resolveWeeklyOffs();

    const rows = await Promise.all(employees.map(async (employee) => {
      const record = recordMap.get(String(employee._id));
      const offs = employee.weeklyOffs?.length
        ? employee.weeklyOffs
        : companyOffs;
      const scheduledOff =
        datedOffSet.has(String(employee._id)) ||
        offs.includes(day.getDay());

      return {
        employeeId: employee._id,
        fullName: employee.fullName,
        employeeCode: employee.employeeCode,
        department: employee.department,
        designation: employee.designation,
        status: record?.status || (scheduledOff ? "WEEK_OFF" : "NOT_MARKED"),
        workMode: record?.workMode || null,
        punchIn: record?.punchIn || null,
        punchOut: record?.punchOut || null,
        punchInLocation: record?.punchInLocation || null,
        punchOutLocation: record?.punchOutLocation || null,
        workingHours: record?.workingHours || 0,
      };
    }));

    return {
      date: start,
      summary: {
        total: rows.length,
        present: rows.filter(
          (row) =>
            row.status === "PRESENT" || row.status === "HALF_DAY"
        ).length,
        leave: rows.filter((row) => row.status === "LEAVE").length,
        absent: rows.filter((row) => row.status === "ABSENT").length,
        notMarked: rows.filter((row) => row.status === "NOT_MARKED")
          .length,
        weekOff: rows.filter((row) => row.status === "WEEK_OFF").length,
        workFromHome: rows.filter((row) => row.workMode === "WORK_FROM_HOME")
          .length,
        meeting: rows.filter((row) => row.workMode === "MEETING").length,
      },
      rows,
    };
  }
}