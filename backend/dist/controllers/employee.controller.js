"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const employee_service_1 = require("../services/employee.service");
const roles_1 = require("../constants/roles");
const employeeService = new employee_service_1.EmployeeService();
class EmployeeController {
    // =========================================================
    // CREATE EMPLOYEE
    // =========================================================
    async createEmployee(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const { fullName, email, mobile, department, designation, role, joiningDate, password, } = req.body;
            // -------------------------------------------------------
            // BASIC VALIDATION
            // -------------------------------------------------------
            if (!fullName || !email || !mobile) {
                return res.status(400).json({
                    success: false,
                    message: "Full name, email and mobile are required",
                });
            }
            // -------------------------------------------------------
            // DEFAULT ROLE
            // -------------------------------------------------------
            const requestedRole = role || roles_1.ROLES.EMPLOYEE;
            // -------------------------------------------------------
            // ROLE HIERARCHY
            // -------------------------------------------------------
            const allowedRoles = {
                [roles_1.ROLES.SUPER_ADMIN]: [
                    roles_1.ROLES.ADMIN,
                    roles_1.ROLES.HR,
                    roles_1.ROLES.MANAGER,
                    roles_1.ROLES.EMPLOYEE,
                ],
                [roles_1.ROLES.ADMIN]: [
                    roles_1.ROLES.HR,
                    roles_1.ROLES.MANAGER,
                    roles_1.ROLES.EMPLOYEE,
                ],
                [roles_1.ROLES.HR]: [
                    roles_1.ROLES.EMPLOYEE,
                ],
                [roles_1.ROLES.MANAGER]: [],
                [roles_1.ROLES.EMPLOYEE]: [],
            };
            const currentUserRole = req.user.role;
            // -------------------------------------------------------
            // CHECK CREATE PERMISSION
            // -------------------------------------------------------
            if (!allowedRoles[currentUserRole]?.includes(requestedRole)) {
                return res.status(403).json({
                    success: false,
                    message: `You are not allowed to create a ${requestedRole} account.`,
                });
            }
            // -------------------------------------------------------
            // CREATE EMPLOYEE
            // -------------------------------------------------------
            const employee = await employeeService.createEmployee({
                fullName,
                email,
                mobile,
                department,
                designation,
                role: requestedRole,
                joiningDate,
                password,
            });
            return res.status(201).json({
                success: true,
                message: "Employee created successfully",
                data: employee,
            });
        }
        catch (error) {
            console.error("Create Employee Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to create employee",
            });
        }
    }
    // =========================================================
    // GET ALL EMPLOYEES
    // =========================================================
    async getEmployees(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const employees = await employeeService.getEmployees();
            return res.status(200).json({
                success: true,
                message: "Employees fetched successfully",
                data: employees,
            });
        }
        catch (error) {
            console.error("Get Employees Error:", error);
            return res.status(500).json({
                success: false,
                message: error.message ||
                    "Failed to fetch employees",
            });
        }
    }
    // =========================================================
    // GET EMPLOYEE BY ID
    // =========================================================
    async getEmployeeById(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const employee = await employeeService.getEmployeeById(id);
            return res.status(200).json({
                success: true,
                message: "Employee fetched successfully",
                data: employee,
            });
        }
        catch (error) {
            console.error("Get Employee Error:", error);
            return res.status(404).json({
                success: false,
                message: error.message ||
                    "Employee not found",
            });
        }
    }
    // =========================================================
    // UPDATE EMPLOYEE
    // =========================================================
    async updateEmployee(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            // -------------------------------------------------------
            // GET EXISTING EMPLOYEE
            // -------------------------------------------------------
            const existingEmployee = await employeeService.getEmployeeById(id);
            const currentUserRole = req.user.role;
            const requestedRole = req.body.role;
            // -------------------------------------------------------
            // ROLE CHANGE CHECK
            // -------------------------------------------------------
            if (requestedRole &&
                requestedRole !==
                    existingEmployee.role) {
                const allowedRoles = {
                    [roles_1.ROLES.SUPER_ADMIN]: [
                        roles_1.ROLES.ADMIN,
                        roles_1.ROLES.HR,
                        roles_1.ROLES.MANAGER,
                        roles_1.ROLES.EMPLOYEE,
                    ],
                    [roles_1.ROLES.ADMIN]: [
                        roles_1.ROLES.HR,
                        roles_1.ROLES.MANAGER,
                        roles_1.ROLES.EMPLOYEE,
                    ],
                    [roles_1.ROLES.HR]: [
                        roles_1.ROLES.EMPLOYEE,
                    ],
                    [roles_1.ROLES.MANAGER]: [],
                    [roles_1.ROLES.EMPLOYEE]: [],
                };
                if (!allowedRoles[currentUserRole]?.includes(requestedRole)) {
                    return res.status(403).json({
                        success: false,
                        message: `You are not allowed to assign ${requestedRole} role.`,
                    });
                }
            }
            // -------------------------------------------------------
            // UPDATE
            // -------------------------------------------------------
            const employee = await employeeService.updateEmployee(id, req.body);
            return res.status(200).json({
                success: true,
                message: "Employee updated successfully",
                data: employee,
            });
        }
        catch (error) {
            console.error("Update Employee Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to update employee",
            });
        }
    }
    // =========================================================
    // ACTIVATE / DEACTIVATE
    // =========================================================
    async updateEmployeeStatus(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const { isActive, } = req.body;
            if (typeof isActive !==
                "boolean") {
                return res.status(400).json({
                    success: false,
                    message: "isActive must be true or false",
                });
            }
            const employee = await employeeService.updateEmployeeStatus(id, isActive);
            return res.status(200).json({
                success: true,
                message: isActive
                    ? "Employee activated successfully"
                    : "Employee deactivated successfully",
                data: employee,
            });
        }
        catch (error) {
            console.error("Update Employee Status Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to update employee status",
            });
        }
    }
    // =========================================================
    // RESET PASSWORD
    // =========================================================
    async resetPassword(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const { newPassword, } = req.body;
            if (!newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "New password is required",
                });
            }
            const result = await employeeService
                .resetEmployeePassword(id, newPassword);
            return res.status(200).json({
                success: true,
                message: "Password reset successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Reset Password Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to reset password",
            });
        }
    }
    // =========================================================
    // DEACTIVATE EMPLOYEE
    // =========================================================
    async deleteEmployee(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const result = await employeeService.deleteEmployee(id);
            return res.status(200).json({
                success: true,
                message: "Employee deactivated successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Deactivate Employee Error:", error);
            return res.status(400).json({
                success: false,
                message: error.message ||
                    "Failed to deactivate employee",
            });
        }
    }
}
exports.EmployeeController = EmployeeController;
