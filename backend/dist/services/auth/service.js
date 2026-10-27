"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_1 = __importDefault(require("../../models/User"));
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
class AuthService {
    async login(employeeCode, password) {
        const user = (await User_1.default.findOne({
            employeeCode: employeeCode.toUpperCase(),
        }));
        if (!user) {
            throw new Error("Invalid Employee Code");
        }
        if (!user.isActive) {
            throw new Error("Your account is inactive. Please contact HR.");
        }
        const isPasswordCorrect = await (0, password_1.comparePassword)(password, user.password);
        if (!isPasswordCorrect) {
            throw new Error("Invalid Password");
        }
        const token = (0, jwt_1.generateToken)(user._id.toString(), user.role);
        return {
            token,
            user: {
                id: user._id,
                employeeCode: user.employeeCode,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                department: user.department,
                designation: user.designation,
            },
        };
    }
}
exports.AuthService = AuthService;
