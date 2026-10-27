import mongoose from "mongoose";
import User from "../models/User";
import { hashPassword } from "../utils/password";
import { ROLES } from "../constants/roles";
import { LeaveBalanceService } from "./leaveBalance.service";
import { normalizeWeeklyOffs } from "../utils/weekOff";

export class EmployeeService {
  async createEmployee(data: {
    fullName: string;
    email: string;
    mobile: string;
    department?: string;
    designation?: string;
    role?: string;
    joiningDate?: string;
    password?: string;
    managerId?: string;
    weeklyOffs?: number[];
  }) {
    const {
      fullName,
      email,
      mobile,
      department,
      designation,
      role,
      joiningDate,
      password,
      managerId,
      weeklyOffs,
    } = data;

    // Check duplicate email
    const existingEmail = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Check duplicate mobile
    const existingMobile = await User.findOne({
      mobile: mobile.trim(),
    });

    if (existingMobile) {
      throw new Error("Mobile number already exists");
    }

    // Generate employee code
    const lastEmployee = await User.findOne(
      {
        employeeCode: /^EMP\d+$/,
      },
      {},
      {
        sort: {
          employeeCode: -1,
        },
      }
    );

    let nextNumber = 1;

    if (lastEmployee) {
      const lastNumber = parseInt(
        lastEmployee.employeeCode.replace("EMP", ""),
        10
      );

      nextNumber = lastNumber + 1;
    }

    const employeeCode = `EMP${String(nextNumber).padStart(4, "0")}`;

    // Default password
    const plainPassword =
      password || "Welcome@123";

    const hashedPassword =
      await hashPassword(plainPassword);

    // Create employee
    const employee = await User.create({
      employeeCode,

      fullName: fullName.trim(),

      email: email.toLowerCase().trim(),

      mobile: mobile.trim(),

      password: hashedPassword,

      role: role || ROLES.EMPLOYEE,

      department,

      designation,

      joiningDate: joiningDate || new Date(),

      weeklyOffs: normalizeWeeklyOffs(weeklyOffs),

      managerId: managerId || undefined,

      isActive: true,
    });

    try {
      await new LeaveBalanceService().initializeEmployeeBalances(
        String(employee._id)
      );
    } catch (error) {
      console.error("Leave balance init skipped:", error);
    }

    return {
      id: employee._id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      email: employee.email,
      mobile: employee.mobile,
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      joiningDate: employee.joiningDate,
      isActive: employee.isActive,

      // Temporary — later we'll handle credentials differently
      temporaryPassword: plainPassword,
    };
  }
  async getEmployees() {
  const employees = await User.find()
    .select("-password")
    .populate("managerId", "fullName employeeCode")
    .sort({ createdAt: -1 });

  return employees;
}
async getEmployeeById(employeeId: string) {
  const employee = await User.findById(employeeId)
    .select("-password");

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
}
async updateEmployee(
  employeeId: string,
  data: {
    fullName?: string;
    email?: string;
    mobile?: string;
    department?: string;
    designation?: string;
    role?: string;
    joiningDate?: string;
    managerId?: string | null;
    weeklyOffs?: number[];
  }
) {
  const employee = await User.findById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (data.email) {
    const existingEmail = await User.findOne({
      email: data.email.toLowerCase().trim(),
      _id: { $ne: employeeId },
    });

    if (existingEmail) {
      throw new Error("Email already exists");
    }

    employee.email = data.email.toLowerCase().trim();
  }

  if (data.mobile) {
    const existingMobile = await User.findOne({
      mobile: data.mobile.trim(),
      _id: { $ne: employeeId },
    });

    if (existingMobile) {
      throw new Error("Mobile number already exists");
    }

    employee.mobile = data.mobile.trim();
  }

  if (data.fullName !== undefined) {
    employee.fullName = data.fullName.trim();
  }

  if (data.department !== undefined) {
    employee.department = data.department;
  }

  if (data.designation !== undefined) {
    employee.designation = data.designation;
  }

  if (data.role !== undefined) {
    employee.role = data.role as any;
  }

  if (data.joiningDate !== undefined) {
    employee.joiningDate = new Date(data.joiningDate);
  }

  if (data.weeklyOffs !== undefined) {
    employee.weeklyOffs = normalizeWeeklyOffs(data.weeklyOffs);
  }

  if (data.managerId !== undefined) {
    if (!data.managerId) {
      employee.managerId = undefined;
    } else {
      if (String(data.managerId) === String(employeeId)) {
        throw new Error("An employee cannot report to themselves");
      }

      const manager = await User.findById(data.managerId);

      if (!manager) {
        throw new Error("Manager not found");
      }

      employee.managerId =
        manager._id as mongoose.Types.ObjectId;
    }
  }

  await employee.save();

  return {
    id: employee._id,
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    email: employee.email,
    mobile: employee.mobile,
    role: employee.role,
    department: employee.department,
    designation: employee.designation,
    joiningDate: employee.joiningDate,
    weeklyOffs: employee.weeklyOffs || [],
    isActive: employee.isActive,
  };
}
async updateEmployeeStatus(
  employeeId: string,
  isActive: boolean
) {
  const employee = await User.findById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  employee.isActive = isActive;

  await employee.save();

  return {
    id: employee._id,
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    isActive: employee.isActive,
  };
}
async deleteEmployee(employeeId: string) {
  const employee =
    await User.findById(employeeId);

  if (!employee) {
    throw new Error(
      "Employee not found"
    );
  }

  if (
    employee.role === ROLES.SUPER_ADMIN
  ) {
    throw new Error(
      "Super Admin cannot be deleted"
    );
  }

  employee.isActive = false;

  await employee.save();

  return {
    id: employee._id,
    employeeCode:
      employee.employeeCode,
    fullName:
      employee.fullName,
    isActive:
      employee.isActive,
  };
}
async getMyTeam(managerId: string) {
  return User.find({
    managerId,
    isActive: true,
  })
    .select("-password")
    .sort({ fullName: 1 });
}

async resetEmployeePassword(
  employeeId: string,
  newPassword: string
) {
  const employee = await User.findById(employeeId)
    .select("+password");

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error(
      "Password must be at least 6 characters"
    );
  }

  employee.password =
    await hashPassword(newPassword);

  await employee.save();

  return {
    id: employee._id,
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
  };
}
}