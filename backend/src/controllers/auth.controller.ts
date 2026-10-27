import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { friendlyError } from "../utils/errors";

const authService = new AuthService();

export class AuthController {

  async login(req: Request, res: Response) {
    try {
      const { employeeCode, password } = req.body;

      if (!employeeCode || !password) {
        return res.status(400).json({
          success: false,
          message: "Employee Code and Password are required.",
        });
      }

      const result = await authService.login(
        employeeCode,
        password
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });

    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: friendlyError(error),
      });
    }
  }

  async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await authService.getCurrentUser(
        req.user.id
      );

      return res.status(200).json({
        success: true,
        message: "Authenticated user",
        data: user,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: friendlyError(error),
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await authService.updateProfile(
        req.user.id,
        req.body
      );

      return res.json({
        success: true,
        message: "Profile updated",
        data: user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: friendlyError(error) || "Failed to update profile",
      });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      return res.json({
        success: true,
        message: "Password updated",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: friendlyError(error) || "Failed to update password",
      });
    }
  }
}