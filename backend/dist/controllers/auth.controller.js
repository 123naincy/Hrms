"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    async login(req, res) {
        try {
            const { employeeCode, password } = req.body;
            if (!employeeCode || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Employee Code and Password are required.",
                });
            }
            const result = await authService.login(employeeCode, password);
            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: result,
            });
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message,
            });
        }
    }
    async me(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const user = await authService.getCurrentUser(req.user.id);
            return res.status(200).json({
                success: true,
                message: "Authenticated user",
                data: user,
            });
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.AuthController = AuthController;
