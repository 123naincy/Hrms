"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const roles_1 = require("../constants/roles");
const password_1 = require("../utils/password");
dotenv_1.default.config();
const createTestUsers = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined");
        }
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
        const users = [
            {
                employeeCode: "ADMIN001",
                fullName: "Admin User",
                email: "admin@enterprise-hrms.com",
                mobile: "9000000001",
                password: "Admin@123",
                role: roles_1.ROLES.ADMIN,
                department: "Administration",
                designation: "Admin",
                joiningDate: new Date("2026-01-01"),
                isActive: true,
            },
            {
                employeeCode: "HR001",
                fullName: "HR User",
                email: "hr@enterprise-hrms.com",
                mobile: "9000000002",
                password: "Hr@123",
                role: roles_1.ROLES.HR,
                department: "Human Resources",
                designation: "HR Executive",
                joiningDate: new Date("2026-01-01"),
                isActive: true,
            },
            {
                employeeCode: "MGR001",
                fullName: "Aditya Thakur",
                email: "manager@enterprise-hrms.com",
                mobile: "9000000003",
                password: "Manager@123",
                role: roles_1.ROLES.MANAGER,
                department: "Sales",
                designation: "Manager",
                joiningDate: new Date("2026-01-01"),
                isActive: true,
            },
        ];
        for (const userData of users) {
            const existingUser = await User_1.default.findOne({
                $or: [
                    { employeeCode: userData.employeeCode },
                    { email: userData.email },
                    { mobile: userData.mobile },
                ],
            });
            if (existingUser) {
                console.log(`Already exists: ${userData.employeeCode}`);
                continue;
            }
            const hashedPassword = await (0, password_1.hashPassword)(userData.password);
            await User_1.default.create({
                ...userData,
                password: hashedPassword,
            });
            console.log(`Created: ${userData.employeeCode} (${userData.role})`);
        }
        console.log("Test users setup completed.");
    }
    catch (error) {
        console.error("Error creating test users:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("MongoDB disconnected");
    }
};
createTestUsers();
