import { Request, Response } from "express";
import { EmployeeService } from "../services/employee.service";
import { ROLES } from "../constants/roles";
import { friendlyError } from "../utils/errors";

const employeeService = new EmployeeService();

export class EmployeeController {

  // =========================================================
  // CREATE EMPLOYEE
  // =========================================================

  async createEmployee(req: Request, res: Response) {
    try {

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

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
      } = req.body;


      // -------------------------------------------------------
      // BASIC VALIDATION
      // -------------------------------------------------------

      if (!fullName || !email || !mobile) {
        return res.status(400).json({
          success: false,
          message:
            "Full name, email and mobile are required",
        });
      }


      // -------------------------------------------------------
      // DEFAULT ROLE
      // -------------------------------------------------------

      const requestedRole =
        role || ROLES.EMPLOYEE;


      // -------------------------------------------------------
      // ROLE HIERARCHY
      // -------------------------------------------------------

      const allowedRoles: Record<
        string,
        string[]
      > = {

        [ROLES.SUPER_ADMIN]: [
          ROLES.ADMIN,
          ROLES.HR,
          ROLES.MANAGER,
          ROLES.EMPLOYEE,
        ],

        [ROLES.ADMIN]: [
          ROLES.HR,
          ROLES.MANAGER,
          ROLES.EMPLOYEE,
        ],

        [ROLES.HR]: [
          ROLES.EMPLOYEE,
        ],

        [ROLES.MANAGER]: [],

        [ROLES.EMPLOYEE]: [],
      };


      const currentUserRole =
        req.user.role;


      // -------------------------------------------------------
      // CHECK CREATE PERMISSION
      // -------------------------------------------------------

      if (
        !allowedRoles[currentUserRole]?.includes(
          requestedRole
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            `You are not allowed to create a ${requestedRole} account.`,
        });
      }


      // -------------------------------------------------------
      // CREATE EMPLOYEE
      // -------------------------------------------------------

      const employee =
        await employeeService.createEmployee({
          fullName,
          email,
          mobile,
          department,
          designation,
          role: requestedRole,
          joiningDate,
          password,
          managerId,
          weeklyOffs,
        });


      return res.status(201).json({
        success: true,
        message:
          "Employee created successfully",
        data: employee,
      });

    } catch (error: any) {

      console.error(
        "Create Employee Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          friendlyError(error) ||
          "Failed to create employee",
      });
    }
  }


  // =========================================================
  // GET ALL EMPLOYEES
  // =========================================================

  async getEmployees(
    req: Request,
    res: Response
  ) {
    try {

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const employees =
        await employeeService.getEmployees();


      return res.status(200).json({
        success: true,
        message:
          "Employees fetched successfully",
        data: employees,
      });

    } catch (error: any) {

      console.error(
        "Get Employees Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          friendlyError(error) ||
          "Failed to fetch employees",
      });
    }
  }


  async getMyTeam(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const employees = await employeeService.getMyTeam(req.user.id);

      return res.json({
        success: true,
        data: employees,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: friendlyError(error) || "Failed to fetch team",
      });
    }
  }

  // =========================================================
  // GET EMPLOYEE BY ID
  // =========================================================

  async getEmployeeById(
    req: Request,
    res: Response
  ) {
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


      const employee =
        await employeeService.getEmployeeById(
          id
        );


      return res.status(200).json({
        success: true,
        message:
          "Employee fetched successfully",
        data: employee,
      });

    } catch (error: any) {

      console.error(
        "Get Employee Error:",
        error
      );

      return res.status(404).json({
        success: false,
        message:
          friendlyError(error) ||
          "Employee not found",
      });
    }
  }


  // =========================================================
  // UPDATE EMPLOYEE
  // =========================================================

  async updateEmployee(
    req: Request,
    res: Response
  ) {
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

      const existingEmployee =
        await employeeService.getEmployeeById(
          id
        );


      const currentUserRole =
        req.user.role;

      const requestedRole =
        req.body.role;


      // -------------------------------------------------------
      // ROLE CHANGE CHECK
      // -------------------------------------------------------

      if (
        requestedRole &&
        requestedRole !==
          existingEmployee.role
      ) {

        const allowedRoles: Record<
          string,
          string[]
        > = {

          [ROLES.SUPER_ADMIN]: [
            ROLES.ADMIN,
            ROLES.HR,
            ROLES.MANAGER,
            ROLES.EMPLOYEE,
          ],

          [ROLES.ADMIN]: [
            ROLES.HR,
            ROLES.MANAGER,
            ROLES.EMPLOYEE,
          ],

          [ROLES.HR]: [
            ROLES.EMPLOYEE,
          ],

          [ROLES.MANAGER]: [],

          [ROLES.EMPLOYEE]: [],
        };


        if (
          !allowedRoles[
            currentUserRole
          ]?.includes(requestedRole)
        ) {
          return res.status(403).json({
            success: false,
            message:
              `You are not allowed to assign ${requestedRole} role.`,
          });
        }
      }


      // -------------------------------------------------------
      // UPDATE
      // -------------------------------------------------------

      const employee =
        await employeeService.updateEmployee(
          id,
          req.body
        );


      return res.status(200).json({
        success: true,
        message:
          "Employee updated successfully",
        data: employee,
      });

    } catch (error: any) {

      console.error(
        "Update Employee Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          friendlyError(error) ||
          "Failed to update employee",
      });
    }
  }


  // =========================================================
  // ACTIVATE / DEACTIVATE
  // =========================================================

  async updateEmployeeStatus(
    req: Request,
    res: Response
  ) {
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


      const {
        isActive,
      } = req.body;


      if (
        typeof isActive !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be true or false",
        });
      }


      const employee =
        await employeeService.updateEmployeeStatus(
          id,
          isActive
        );


      return res.status(200).json({
        success: true,
        message: isActive
          ? "Employee activated successfully"
          : "Employee deactivated successfully",
        data: employee,
      });

    } catch (error: any) {

      console.error(
        "Update Employee Status Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          friendlyError(error) ||
          "Failed to update employee status",
      });
    }
  }


  // =========================================================
  // RESET PASSWORD
  // =========================================================

  async resetPassword(
    req: Request,
    res: Response
  ) {
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


      const {
        newPassword,
      } = req.body;


      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password is required",
        });
      }


      const result =
        await employeeService
          .resetEmployeePassword(
            id,
            newPassword
          );


      return res.status(200).json({
        success: true,
        message:
          "Password reset successfully",
        data: result,
      });

    } catch (error: any) {

      console.error(
        "Reset Password Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          friendlyError(error) ||
          "Failed to reset password",
      });
    }
  }


  // =========================================================
  // DEACTIVATE EMPLOYEE
  // =========================================================

  async deleteEmployee(
    req: Request,
    res: Response
  ) {
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


      const result =
        await employeeService.deleteEmployee(
          id
        );


      return res.status(200).json({
        success: true,
        message:
          "Employee deactivated successfully",
        data: result,
      });

    } catch (error: any) {

      console.error(
        "Deactivate Employee Error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          friendlyError(error) ||
          "Failed to deactivate employee",
      });
    }
  }
}