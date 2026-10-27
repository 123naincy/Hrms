"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const service_1 = require("../../services/auth/service");
class AuthController {
    authService = new service_1.AuthService();
    login = async (req, res) => {
        try {
            const { employeeCode, password } = req.body;
            if (!employeeCode || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Employee code and password are required",
                });
            }
            const result = await this.authService.login(employeeCode, password);
            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: result,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Login failed";
            return res.status(401).json({
                success: false,
                message,
            });
        }
    };
}
exports.AuthController = AuthController;
