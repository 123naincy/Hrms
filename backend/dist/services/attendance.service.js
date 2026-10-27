"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Holiday_1 = __importDefault(require("../models/Holiday"));
const LeaveRequest_1 = __importDefault(require("../models/LeaveRequest"));
const User_1 = __importDefault(require("../models/User"));
const WeekOff_1 = __importDefault(require("../models/WeekOff"));
const attendanceStatus_service_1 = require("./attendanceStatus.service");
class AttendanceService {
    statusService = new attendanceStatus_service_1.AttendanceStatusService();
    // =====================================================
    // HELPER
    // =====================================================
    startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    endOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    }
    dateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
    // =====================================================
    // PUNCH IN
    // =====================================================
    async punchIn(employeeId, data) {
        // ==========================================
        // 1. FIND EMPLOYEE
        // ==========================================
        const employee = await User_1.default.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (!employee.isActive) {
            throw new Error("Employee account is inactive");
        }
        const now = new Date();
        const today = this.startOfDay(now);
        const todayEnd = this.endOfDay(now);
        // ==========================================
        // 2. CHECK DAY STATUS
        // ==========================================
        const dayStatus = await this.statusService.getDayStatus(employeeId, now);
        if (dayStatus.status === "LEAVE") {
            throw new Error("You are on approved leave today. Punch-In is not allowed.");
        }
        if (dayStatus.status === "WEEK_OFF") {
            throw new Error("Today is your Week-Off. Punch-In is not allowed.");
        }
        if (dayStatus.status === "HOLIDAY") {
            throw new Error("Today is a holiday. Punch-In is not allowed.");
        }
        // ==========================================
        // 3. CHECK EXISTING ATTENDANCE
        // ==========================================
        const existing = await Attendance_1.default.findOne({
            employeeId,
            date: {
                $gte: today,
                $lte: todayEnd,
            },
        });
        if (existing?.punchIn) {
            throw new Error("You have already punched in today.");
        }
        // ==========================================
        // 4. CREATE / UPDATE ATTENDANCE
        // ==========================================
        const attendance = await Attendance_1.default.findOneAndUpdate({
            employeeId,
            date: today,
        }, {
            $set: {
                status: "PRESENT",
                punchIn: now,
                punchInLocation: data?.location,
                punchInSelfie: data?.selfie,
                source: "PUNCH",
            },
        }, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        });
        return attendance;
    }
    // =====================================================
    // PUNCH OUT
    // =====================================================
    async punchOut(employeeId, data) {
        // ==========================================
        // 1. FIND EMPLOYEE
        // ==========================================
        const employee = await User_1.default.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (!employee.isActive) {
            throw new Error("Employee account is inactive");
        }
        const now = new Date();
        const today = this.startOfDay(now);
        const todayEnd = this.endOfDay(now);
        // ==========================================
        // 2. FIND TODAY'S ATTENDANCE
        // ==========================================
        const attendance = await Attendance_1.default.findOne({
            employeeId,
            date: {
                $gte: today,
                $lte: todayEnd,
            },
        });
        if (!attendance) {
            throw new Error("Punch-In not found. Please Punch-In first.");
        }
        // ==========================================
        // 3. CHECK PUNCH-IN
        // ==========================================
        if (!attendance.punchIn) {
            throw new Error("Punch-In not found. Please Punch-In first.");
        }
        // ==========================================
        // 4. PREVENT DUPLICATE PUNCH-OUT
        // ==========================================
        if (attendance.punchOut) {
            throw new Error("You have already punched out today.");
        }
        // ==========================================
        // 5. VALIDATE TIME
        // ==========================================
        if (now.getTime() <=
            attendance.punchIn.getTime()) {
            throw new Error("Punch-Out time must be after Punch-In time.");
        }
        // ==========================================
        // 6. CALCULATE WORKING MINUTES
        // ==========================================
        const difference = now.getTime() -
            attendance.punchIn.getTime();
        const totalMinutes = Math.floor(difference /
            (1000 * 60));
        const workingHours = Number((totalMinutes / 60).toFixed(2));
        // ==========================================
        // 7. UPDATE ATTENDANCE
        // ==========================================
        attendance.punchOut =
            now;
        attendance.punchOutLocation =
            data?.location;
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
    async getTodayAttendance(employeeId) {
        // ==========================================
        // 1. VERIFY EMPLOYEE
        // ==========================================
        const employee = await User_1.default.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (!employee.isActive) {
            throw new Error("Employee account is inactive");
        }
        // ==========================================
        // 2. TODAY
        // ==========================================
        const now = new Date();
        const today = this.startOfDay(now);
        const todayEnd = this.endOfDay(now);
        // ==========================================
        // 3. GET DAY STATUS
        // ==========================================
        const dayStatus = await this.statusService.getDayStatus(employeeId, now);
        // ==========================================
        // 4. GET ATTENDANCE RECORD
        // ==========================================
        const attendance = await Attendance_1.default.findOne({
            employeeId,
            date: {
                $gte: today,
                $lte: todayEnd,
            },
        });
        // ==========================================
        // 5. SPECIAL DAY
        // ==========================================
        if (dayStatus.status === "LEAVE") {
            return {
                date: today,
                status: "LEAVE",
                leaveType: dayStatus.leaveType,
                leaveRequestId: dayStatus.leaveRequestId,
                punchIn: null,
                punchOut: null,
                totalMinutes: 0,
                workingHours: 0,
                canPunchIn: false,
                canPunchOut: false,
            };
        }
        if (dayStatus.status === "WEEK_OFF") {
            return {
                date: today,
                status: "WEEK_OFF",
                punchIn: null,
                punchOut: null,
                totalMinutes: 0,
                workingHours: 0,
                canPunchIn: false,
                canPunchOut: false,
            };
        }
        if (dayStatus.status === "HOLIDAY") {
            return {
                date: today,
                status: "HOLIDAY",
                punchIn: null,
                punchOut: null,
                totalMinutes: 0,
                workingHours: 0,
                canPunchIn: false,
                canPunchOut: false,
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
            };
        }
        // ==========================================
        // 7. PUNCHED IN BUT NOT OUT
        // ==========================================
        if (attendance.punchIn &&
            !attendance.punchOut) {
            return {
                date: today,
                status: "PRESENT",
                punchIn: attendance.punchIn,
                punchOut: null,
                totalMinutes: attendance.totalMinutes,
                workingHours: attendance.workingHours,
                canPunchIn: false,
                canPunchOut: true,
            };
        }
        // ==========================================
        // 8. PUNCHED IN + PUNCHED OUT
        // ==========================================
        return {
            date: today,
            status: attendance.status,
            punchIn: attendance.punchIn,
            punchOut: attendance.punchOut,
            totalMinutes: attendance.totalMinutes,
            workingHours: attendance.workingHours,
            canPunchIn: false,
            canPunchOut: false,
        };
    }
    // =====================================================
    // GET MY ATTENDANCE HISTORY
    // =====================================================
    async getMyAttendance(employeeId, fromDate, toDate) {
        const employee = await User_1.default.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (!employee.isActive) {
            throw new Error("Employee account is inactive");
        }
        const now = new Date();
        const start = fromDate
            ? this.startOfDay(fromDate)
            : new Date(now.getFullYear(), now.getMonth(), 1);
        const end = toDate
            ? this.endOfDay(toDate)
            : this.endOfDay(now);
        const records = await Attendance_1.default.find({
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
    async getMonthlyAttendance(employeeId, year, month) {
        // ==========================================
        // VALIDATE MONTH
        // ==========================================
        if (month < 1 ||
            month > 12) {
            throw new Error("Month must be between 1 and 12");
        }
        if (year < 2000 ||
            year > 2100) {
            throw new Error("Invalid year");
        }
        // ==========================================
        // FIND EMPLOYEE
        // ==========================================
        const employee = await User_1.default.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        // ==========================================
        // MONTH RANGE
        // ==========================================
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
        // ==========================================
        // ATTENDANCE RECORDS
        // ==========================================
        const attendanceRecords = await Attendance_1.default.find({
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
        const leaveRecords = await LeaveRequest_1.default.find({
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
        const weekOffRecords = await WeekOff_1.default.find({
            employeeId,
            date: {
                $gte: monthStart,
                $lte: monthEnd,
            },
        });
        // ==========================================
        // HOLIDAYS
        // ==========================================
        const holidayRecords = await Holiday_1.default.find({
            date: {
                $gte: monthStart,
                $lte: monthEnd,
            },
            isActive: true,
        });
        // ==========================================
        // MAP DATA
        // ==========================================
        const attendanceMap = new Map();
        attendanceRecords.forEach((record) => {
            attendanceMap.set(this.dateKey(record.date), record);
        });
        const weekOffMap = new Map();
        weekOffRecords.forEach((record) => {
            weekOffMap.set(this.dateKey(record.date), record);
        });
        const holidayMap = new Map();
        holidayRecords.forEach((record) => {
            holidayMap.set(this.dateKey(record.date), record);
        });
        // ==========================================
        // CREATE LEAVE MAP
        // ==========================================
        const leaveMap = new Map();
        for (const leave of leaveRecords) {
            let current = this.startOfDay(leave.startDate);
            const end = this.startOfDay(leave.endDate);
            while (current <= end) {
                if (current >= monthStart &&
                    current <= monthEnd) {
                    leaveMap.set(this.dateKey(current), leave);
                }
                current =
                    new Date(current);
                current.setDate(current.getDate() + 1);
            }
        }
        // ==========================================
        // BUILD MONTH DAYS
        // ==========================================
        const days = [];
        const totalDays = new Date(year, month, 0).getDate();
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
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month - 1, day);
            const key = this.dateKey(date);
            const attendance = attendanceMap.get(key);
            const leaveRecord = leaveMap.get(key);
            const weekOffRecord = weekOffMap.get(key);
            const holidayRecord = holidayMap.get(key);
            // ========================================
            // ATTENDANCE TAKES PRIORITY
            // ========================================
            if (attendance) {
                if (attendance.status ===
                    "PRESENT") {
                    present++;
                }
                if (attendance.status ===
                    "HALF_DAY") {
                    halfDay++;
                }
                if (attendance.status ===
                    "ABSENT") {
                    absent++;
                }
                if (attendance.status ===
                    "LEAVE") {
                    leave++;
                }
                if (attendance.status ===
                    "WEEK_OFF") {
                    weekOff++;
                }
                if (attendance.status ===
                    "HOLIDAY") {
                    holiday++;
                }
                totalWorkingMinutes +=
                    attendance.totalMinutes || 0;
                days.push({
                    date,
                    status: attendance.status,
                    punchIn: attendance.punchIn || null,
                    punchOut: attendance.punchOut || null,
                    totalMinutes: attendance.totalMinutes || 0,
                    workingHours: attendance.workingHours || 0,
                    leaveType: leaveRecord?.leaveType ||
                        null,
                    leaveRequestId: leaveRecord?._id ||
                        null,
                    source: attendance.source,
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
                    leaveType: leaveRecord.leaveType,
                    leaveRequestId: leaveRecord._id,
                    source: "LEAVE",
                });
                continue;
            }
            // ========================================
            // WEEK-OFF
            // ========================================
            if (weekOffRecord) {
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
                    holidayName: holidayRecord.name,
                    leaveType: null,
                    leaveRequestId: null,
                    source: "SYSTEM",
                });
                continue;
            }
            // ========================================
            // FUTURE DATE
            // ========================================
            const today = this.startOfDay(new Date());
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
                totalWorkingHours: Number((totalWorkingMinutes / 60).toFixed(2)),
            },
            days,
        };
    }
}
exports.AttendanceService = AttendanceService;
