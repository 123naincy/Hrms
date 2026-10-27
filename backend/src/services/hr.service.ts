import Department from "../models/Department";
import Designation from "../models/Designation";
import Salary from "../models/Salary";
import Payslip from "../models/Payslip";
import AuditLog from "../models/AuditLog";
import CompanySetting from "../models/CompanySetting";
import User from "../models/User";
import Attendance from "../models/Attendance";
import LeaveRequest from "../models/LeaveRequest";
import LeaveBalance from "../models/LeaveBalance";
import { ROLES } from "../constants/roles";
import { AttendanceService } from "./attendance.service";
import { HolidayService } from "./holiday.service";

const ROLE_CATALOG = [
  {
    role: ROLES.SUPER_ADMIN,
    description: "Full control of the HRMS, including roles, payroll, and audit.",
    permissions: [
      "Manage all employees and roles",
      "Payroll and company settings",
      "Audit logs and analytics",
      "Approve leave",
    ],
  },
  {
    role: ROLES.ADMIN,
    description: "Runs day-to-day HR operations except role administration.",
    permissions: [
      "Employees, departments, and designations",
      "Payroll and settings",
      "Leave and attendance oversight",
    ],
  },
  {
    role: ROLES.HR,
    description: "Maintains employee records, attendance, and leave.",
    permissions: [
      "Create and update employees",
      "Departments and designations",
      "Leave approvals",
    ],
  },
  {
    role: ROLES.MANAGER,
    description: "Manages a direct team.",
    permissions: [
      "View team and team attendance",
      "Approve team leave",
      "Personal attendance and leave",
    ],
  },
  {
    role: ROLES.EMPLOYEE,
    description: "Self-service for attendance, leave, and profile.",
    permissions: [
      "Punch in and punch out",
      "Apply for leave",
      "View profile",
    ],
  },
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
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

function describeActivity(method: string, rawPath: string) {
  const path = rawPath.split("?")[0].replace(/\/api/, "");

  const rules: Array<{
    test: RegExp;
    title: string;
    icon: string;
  }> = [
    { test: /\/attendance\/punch-in$/, title: "Punched in", icon: "✓" },
    { test: /\/attendance\/punch-out$/, title: "Punched out", icon: "✓" },
    { test: /\/leave-requests\/[^/]+\/approve$/, title: "Approved leave", icon: "▤" },
    { test: /\/leave-requests\/[^/]+\/reject$/, title: "Rejected leave", icon: "▤" },
    { test: /\/leave-requests\/[^/]+\/cancel$/, title: "Cancelled leave", icon: "▤" },
    { test: /\/leave-requests$/, title: "Applied for leave", icon: "▤" },
    { test: /\/leave-balances\/initialize$/, title: "Initialized leave balances", icon: "▤" },
    { test: /\/employees\/[^/]+\/status$/, title: "Changed employee status", icon: "👤" },
    { test: /\/employees\/[^/]+\/password$/, title: "Reset a password", icon: "🔐" },
    { test: /\/employees$/, title: method === "POST" ? "Added an employee" : "Updated employees", icon: "👤" },
    { test: /\/employees\/[^/]+$/, title: method === "DELETE" ? "Removed an employee" : "Updated an employee", icon: "👤" },
    { test: /\/departments$/, title: method === "POST" ? "Added a department" : "Updated departments", icon: "▦" },
    { test: /\/departments\/[^/]+$/, title: "Updated a department", icon: "▦" },
    { test: /\/designations$/, title: method === "POST" ? "Added a designation" : "Updated designations", icon: "💼" },
    { test: /\/designations\/[^/]+$/, title: "Updated a designation", icon: "💼" },
    { test: /\/payroll\/payslips\/generate$/, title: "Generated payslips", icon: "₹" },
    { test: /\/payroll\/payslips\/[^/]+\/pay$/, title: "Marked a payslip paid", icon: "₹" },
    { test: /\/payroll\/salaries$/, title: "Saved a salary", icon: "₹" },
    { test: /\/settings$/, title: "Updated company settings", icon: "⚙" },
    { test: /\/holidays$/, title: "Added a holiday", icon: "📅" },
    { test: /\/holidays\/[^/]+$/, title: "Removed a holiday", icon: "📅" },
    { test: /\/auth\/profile$/, title: "Updated profile", icon: "◉" },
    { test: /\/auth\/password$/, title: "Changed password", icon: "🔐" },
    { test: /\/week-offs$/, title: "Added a week off", icon: "◷" },
  ];

  const match = rules.find((rule) => rule.test.test(path));

  if (match) {
    return match;
  }

  const action =
    method === "POST"
      ? "Created"
      : method === "DELETE"
        ? "Removed"
        : "Updated";
  const area = path.split("/").filter(Boolean)[0]?.replaceAll("-", " ") || "a record";

  return {
    title: `${action} ${area}`,
    icon: method === "DELETE" ? "✕" : "⚙",
  };
}

export class HrService {
  private holidays = new HolidayService();
  private attendance = new AttendanceService();

  async listDepartments() {
    return Department.find().sort({ name: 1 });
  }

  async createDepartment(data: {
    name: string;
    code: string;
    description?: string;
  }) {
    if (!data.name?.trim() || !data.code?.trim()) {
      throw new Error("Department name and code are required");
    }

    return Department.create({
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      description: data.description?.trim(),
      isActive: true,
    });
  }

  async updateDepartment(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    const department = await Department.findById(id);

    if (!department) {
      throw new Error("Department not found");
    }

    if (data.name !== undefined) {
      department.name = data.name.trim();
    }
    if (data.code !== undefined) {
      department.code = data.code.trim().toUpperCase();
    }
    if (data.description !== undefined) {
      department.description = data.description.trim();
    }
    if (data.isActive !== undefined) {
      department.isActive = data.isActive;
    }

    await department.save();
    return department;
  }

  async listDesignations() {
    return Designation.find().sort({ level: 1, title: 1 });
  }

  async createDesignation(data: {
    title: string;
    code: string;
    department?: string;
    level?: number;
  }) {
    if (!data.title?.trim() || !data.code?.trim()) {
      throw new Error("Designation title and code are required");
    }

    return Designation.create({
      title: data.title.trim(),
      code: data.code.trim().toUpperCase(),
      department: data.department?.trim(),
      level: Number(data.level) || 1,
      isActive: true,
    });
  }

  async updateDesignation(
    id: string,
    data: {
      title?: string;
      code?: string;
      department?: string;
      level?: number;
      isActive?: boolean;
    }
  ) {
    const designation = await Designation.findById(id);

    if (!designation) {
      throw new Error("Designation not found");
    }

    if (data.title !== undefined) {
      designation.title = data.title.trim();
    }
    if (data.code !== undefined) {
      designation.code = data.code.trim().toUpperCase();
    }
    if (data.department !== undefined) {
      designation.department = data.department.trim();
    }
    if (data.level !== undefined) {
      designation.level = Number(data.level) || 1;
    }
    if (data.isActive !== undefined) {
      designation.isActive = data.isActive;
    }

    await designation.save();
    return designation;
  }

  listHolidays() {
    return this.holidays.list();
  }

  createHoliday(data: { name: string; date: string }) {
    return this.holidays.create(data);
  }

  removeHoliday(id: string) {
    return this.holidays.remove(id);
  }

  async getSettings() {
    let settings = await CompanySetting.findOne({ key: "default" });

    if (!settings) {
      settings = await CompanySetting.create({
        key: "default",
        companyName: "BHL Group",
      });
    }

    return settings;
  }

  async updateSettings(data: {
    companyName?: string;
    email?: string;
    phone?: string;
    address?: string;
    workStart?: string;
    workEnd?: string;
    weeklyOffs?: number[];
  }) {
    const settings = await this.getSettings();

    if (data.companyName !== undefined) {
      settings.companyName = data.companyName.trim() || "BHL Group";
    }
    if (data.email !== undefined) settings.email = data.email.trim();
    if (data.phone !== undefined) settings.phone = data.phone.trim();
    if (data.address !== undefined) settings.address = data.address.trim();
    if (data.workStart !== undefined) settings.workStart = data.workStart;
    if (data.workEnd !== undefined) settings.workEnd = data.workEnd;
    if (data.weeklyOffs !== undefined) {
      settings.weeklyOffs = data.weeklyOffs;
    }

    await settings.save();
    return settings;
  }

  async listAudit(limit = 100) {
    return AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 300))
      .populate("userId", "fullName employeeCode");
  }

  async getRoles() {
    const counts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      counts.map((item) => [item._id, item.count])
    );

    return ROLE_CATALOG.map((item) => ({
      ...item,
      userCount: countMap.get(item.role) || 0,
    }));
  }

  async getDashboard(userId: string, role: string) {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    const isSelfService =
      role === ROLES.EMPLOYEE || role === ROLES.MANAGER;

    const recentActivity = await this.buildRecentActivity(userId, role);

    if (role === ROLES.EMPLOYEE) {
      const [attendance, balances, leaves] = await Promise.all([
        Attendance.findOne({
          employeeId: userId,
          date: { $gte: start, $lte: end },
        }),
        LeaveBalance.find({ employeeId: userId }),
        LeaveRequest.find({ employeeId: userId })
          .sort({ appliedAt: -1 })
          .limit(5),
      ]);

      const available = balances.reduce(
        (sum, item) => sum + (item.available || 0),
        0
      );

      const presentToday = attendance?.status === "PRESENT" ? 1 : 0;
      const onLeave = attendance?.status === "LEAVE" ? 1 : 0;
      const absentToday = attendance?.status === "ABSENT" ? 1 : 0;

      return {
      scope: "self",
      recentActivity,
        totalEmployees: 1,
        activeEmployees: 1,
        presentToday,
        onLeave,
        absentToday,
        notMarkedToday: attendance ? 0 : 1,
        pendingLeaves: leaves.filter((item) => item.status === "PENDING")
          .length,
        attendanceTrend: [
          {
            day: today.toLocaleDateString("en-IN", { weekday: "short" }),
            present: presentToday,
            absent: absentToday,
            leave: onLeave,
          },
        ],
        departmentData: [],
        leaveData: balances.map((item) => ({
          type: item.leaveType,
          used: item.used,
          available: item.available,
        })),
        employeeGrowth: [],
        availableLeave: available,
        recentLeaves: leaves,
      };
    }

    const employeeFilter =
      role === ROLES.MANAGER
        ? { managerId: userId, isActive: true }
        : { isActive: true };

    const employees = await User.find(
      role === ROLES.MANAGER ? employeeFilter : {}
    ).select("_id department createdAt isActive");

    const ids = employees
      .filter((item) =>
        role === ROLES.MANAGER ? item.isActive : true
      )
      .map((item) => item._id);

    const activeEmployees = employees.filter((item) => item.isActive).length;

    const todayRecords = await Attendance.find({
      employeeId: { $in: ids },
      date: { $gte: start, $lte: end },
    });

    const pendingLeaves = await LeaveRequest.countDocuments({
      employeeId: { $in: ids },
      status: "PENDING",
    });

    const attendanceTrend = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - offset);
      const records = await Attendance.find({
        employeeId: { $in: ids },
        date: { $gte: startOfDay(day), $lte: endOfDay(day) },
      });

      attendanceTrend.push({
        day: day.toLocaleDateString("en-IN", { weekday: "short" }),
        present: records.filter(
          (item) =>
            item.status === "PRESENT" || item.status === "HALF_DAY"
        ).length,
        absent: records.filter((item) => item.status === "ABSENT").length,
        leave: records.filter((item) => item.status === "LEAVE").length,
      });
    }

    const departmentMap = new Map<string, number>();
    employees
      .filter((item) => item.isActive)
      .forEach((item) => {
        const name = item.department || "Unassigned";
        departmentMap.set(name, (departmentMap.get(name) || 0) + 1);
      });

    const year = String(today.getFullYear());
    const balances = await LeaveBalance.aggregate([
      {
        $match: {
          leaveYear: year,
          employeeId: { $in: ids },
        },
      },
      {
        $group: {
          _id: "$leaveType",
          used: { $sum: "$used" },
          available: { $sum: "$available" },
        },
      },
    ]);

    const employeeGrowth = [];

    for (let offset = 5; offset >= 0; offset -= 1) {
      const monthDate = new Date(
        today.getFullYear(),
        today.getMonth() - offset + 1,
        0,
        23,
        59,
        59,
        999
      );

      employeeGrowth.push({
        month: monthDate.toLocaleDateString("en-IN", { month: "short" }),
        employees: employees.filter((item) => {
          const createdAt = item.get("createdAt") as Date | undefined;
          return createdAt && new Date(createdAt) <= monthDate;
        }).length,
      });
    }

    const presentToday = todayRecords.filter(
      (item) => item.status === "PRESENT" || item.status === "HALF_DAY"
    ).length;
    const onLeave = todayRecords.filter((item) => item.status === "LEAVE")
      .length;
    const absentToday = todayRecords.filter((item) => item.status === "ABSENT")
      .length;
    const notMarkedToday = Math.max(
      0,
      activeEmployees - presentToday - onLeave - absentToday
    );

    return {
      scope: isSelfService ? "team" : "organization",
      totalEmployees: employees.length,
      activeEmployees,
      presentToday,
      onLeave,
      absentToday,
      notMarkedToday,
      pendingLeaves,
      attendanceTrend,
      departmentData: Array.from(departmentMap.entries()).map(
        ([name, value]) => ({ name, value })
      ),
      leaveData: balances.map((item) => ({
        type: item._id,
        used: item.used,
        available: item.available,
      })),
      employeeGrowth,
      availableLeave: 0,
      recentLeaves: [],
      recentActivity,
    };
  }

  private async buildRecentActivity(userId: string, role: string) {
    const filter =
      role === ROLES.SUPER_ADMIN ? {} : { userId };

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName");

    return logs.map((log) => {
      const createdAt = log.get("createdAt") as Date | undefined;
      const actor =
        log.userId &&
        typeof log.userId === "object" &&
        "fullName" in log.userId
          ? String(log.userId.fullName)
          : "System";
      const activity = describeActivity(log.method, log.path);

      return {
        id: String(log._id),
        icon: activity.icon,
        title: activity.title,
        description: actor,
        time: createdAt
          ? new Date(createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      };
    });
  }

  async listSalaries() {
    return Salary.find()
      .populate(
        "employeeId",
        "fullName employeeCode department designation"
      )
      .sort({ updatedAt: -1 });
  }

  async saveSalary(data: {
    employeeId: string;
    basic: number;
    hra?: number;
    allowances?: number;
    deductions?: number;
  }) {
    if (!data.employeeId) {
      throw new Error("Employee is required");
    }

    const basic = Number(data.basic);

    if (Number.isNaN(basic) || basic < 0) {
      throw new Error("Basic salary must be a valid amount");
    }

    const employee = await User.findById(data.employeeId);

    if (!employee) {
      throw new Error("Employee not found");
    }

    return Salary.findOneAndUpdate(
      { employeeId: data.employeeId },
      {
        employeeId: data.employeeId,
        basic,
        hra: Number(data.hra) || 0,
        allowances: Number(data.allowances) || 0,
        deductions: Number(data.deductions) || 0,
      },
      { upsert: true, new: true }
    ).populate(
      "employeeId",
      "fullName employeeCode department designation"
    );
  }

  async listPayslips(year?: number, month?: number) {
    const filter: Record<string, number> = {};

    if (year) filter.year = year;
    if (month) filter.month = month;

    return Payslip.find(filter)
      .populate(
        "employeeId",
        "fullName employeeCode department designation"
      )
      .sort({ year: -1, month: -1 });
  }

  async listMyPayslips(employeeId: string) {
    return Payslip.find({ employeeId })
      .sort({ year: -1, month: -1 });
  }

  async generatePayslip(
    employeeId: string,
    year: number,
    month: number
  ) {
    const salary = await Salary.findOne({ employeeId });

    if (!salary) {
      throw new Error("Save a salary structure before generating payroll");
    }

    const monthly = await this.attendance.getMonthlyAttendance(
      employeeId,
      year,
      month
    );

    const gross = salary.basic + salary.hra + salary.allowances;
    const perDay = monthly.totalDays > 0 ? gross / monthly.totalDays : 0;
    const absentDays = monthly.summary.absent || 0;
    const lop = Math.round(perDay * absentDays);
    const deductions = salary.deductions;
    const net = Math.max(0, Math.round(gross - deductions - lop));

    return Payslip.findOneAndUpdate(
      { employeeId, year, month },
      {
        employeeId,
        year,
        month,
        presentDays: monthly.summary.present || 0,
        leaveDays: monthly.summary.leave || 0,
        absentDays,
        gross,
        lop,
        deductions,
        net,
        status: "GENERATED",
      },
      { upsert: true, new: true }
    ).populate(
      "employeeId",
      "fullName employeeCode department designation"
    );
  }

  async generateAll(year: number, month: number) {
    const salaries = await Salary.find();
    const results = [];

    for (const salary of salaries) {
      const payslip = await this.generatePayslip(
        String(salary.employeeId),
        year,
        month
      );
      results.push(payslip);
    }

    return results;
  }

  async markPayslipPaid(id: string) {
    const payslip = await Payslip.findById(id);

    if (!payslip) {
      throw new Error("Payslip not found");
    }

    payslip.status = "PAID";
    await payslip.save();
    return payslip;
  }
}
