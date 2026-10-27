"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const User_1 = __importDefault(require("../models/User"));
const password_1 = require("../utils/password");
const roles_1 = require("../constants/roles");
class EmployeeService {
    async createEmployee(data) {
        const { fullName, email, mobile, department, designation, role, joiningDate, password, } = data;
        // Check duplicate email
        const existingEmail = await User_1.default.findOne({
            email: email.toLowerCase().trim(),
        });
        if (existingEmail) {
            throw new Error("Email already exists");
        }
        // Check duplicate mobile
        const existingMobile = await User_1.default.findOne({
            mobile: mobile.trim(),
        });
        if (existingMobile) {
            throw new Error("Mobile number already exists");
        }
        // Generate employee code
        const lastEmployee = await User_1.default.findOne({
            employeeCode: /^EMP\d+$/,
        }, {}, {
            sort: {
                employeeCode: -1,
            },
        });
        let nextNumber = 1;
        if (lastEmployee) {
            const lastNumber = parseInt(lastEmployee.employeeCode.replace("EMP", ""), 10);
            nextNumber = lastNumber + 1;
        }
        const employeeCode = `EMP${String(nextNumber).padStart(4, "0")}`;
        // Default password
        const plainPassword = password || "Welcome@123";
        const hashedPassword = await (0, password_1.hashPassword)(plainPassword);
        // Create employee
        const employee = await User_1.default.create({
            employeeCode,
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            mobile: mobile.trim(),
            password: hashedPassword,
            role: role || roles_1.ROLES.EMPLOYEE,
            department,
            designation,
            joiningDate,
            isActive: true,
        });
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
        const employees = await User_1.default.find()
            .select("-password")
            .sort({ createdAt: -1 });
        return employees;
    }
    async getEmployeeById(employeeId) {
        const employee = await User_1.default.findById(employeeId)
            .select("-password");
        if (!employee) {
            throw new Error("Employee not found");
        }
        return employee;
    }
    async updateEmployee(employeeId, data) {
        const employee = await User_1.default.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (data.email) {
            const existingEmail = await User_1.default.findOne({
                email: data.email.toLowerCase().trim(),
                _id: { $ne: employeeId },
            });
            if (existingEmail) {
                throw new Error("Email already exists");
            }
            employee.email = data.email.toLowerCase().trim();
        }
        if (data.mobile) {
            const existingMobile = await User_1.default.findOne({
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
            employee.role = data.role;
        }
        if (data.joiningDate !== undefined) {
            employee.joiningDate = new Date(data.joiningDate);
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
            isActive: employee.isActive,
        };
    }
    async updateEmployeeStatus(employeeId, isActive) {
        const employee = await User_1.default.findById(employeeId);
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
    async deleteEmployee(employeeId) {
        const employee = await User_1.default.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (employee.role === roles_1.ROLES.SUPER_ADMIN) {
            throw new Error("Super Admin cannot be deleted");
        }
        employee.isActive = false;
        await employee.save();
        return {
            id: employee._id,
            employeeCode: employee.employeeCode,
            fullName: employee.fullName,
            isActive: employee.isActive,
        };
    }
    async resetEmployeePassword(employeeId, newPassword) {
        const employee = await User_1.default.findById(employeeId)
            .select("+password");
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (!newPassword || newPassword.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }
        employee.password =
            await (0, password_1.hashPassword)(newPassword);
        await employee.save();
        return {
            id: employee._id,
            employeeCode: employee.employeeCode,
            fullName: employee.fullName,
        };
    }
}
exports.EmployeeService = EmployeeService;
