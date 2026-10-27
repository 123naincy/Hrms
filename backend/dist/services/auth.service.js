"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_1 = __importDefault(require("../models/User"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
class AuthService {
    // =========================================================
    // LOGIN
    // =========================================================
    async login(employeeCode, password) {
        const user = (await User_1.default.findOne({
            employeeCode: employeeCode.trim().toUpperCase(),
        }).select("+password"));
        // User not found
        if (!user) {
            throw new Error("Invalid Employee Code");
        }
        // Account inactive
        if (!user.isActive) {
            throw new Error("Your account is inactive. Please contact HR.");
        }
        // Check password
        const isPasswordCorrect = await (0, password_1.comparePassword)(password, user.password);
        if (!isPasswordCorrect) {
            throw new Error("Invalid Password");
        }
        // Generate JWT
        const token = (0, jwt_1.generateToken)(user._id.toString(), user.role);
        // Return token + safe user information
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
    // =========================================================
    // GET CURRENT LOGGED-IN USER
    // =========================================================
    async getCurrentUser(userId) {
        const user = await User_1.default.findById(userId).select("-password");
        // User doesn't exist
        if (!user) {
            throw new Error("User not found");
        }
        // Account inactive
        if (!user.isActive) {
            throw new Error("User account is inactive");
        }
        return {
            id: user._id,
            employeeCode: user.employeeCode,
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            department: user.department,
            designation: user.designation,
            joiningDate: user.joiningDate,
            profileImage: user.profileImage,
            isActive: user.isActive,
        };
    }
}
exports.AuthService = AuthService;
