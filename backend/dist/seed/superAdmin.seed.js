"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const password_1 = require("../utils/password");
dotenv_1.default.config();
const seedSuperAdmin = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Connected");
        const exists = await User_1.default.findOne({
            employeeCode: "ADMIN001",
        });
        if (exists) {
            console.log("⚠️ Super Admin already exists.");
            process.exit(0);
        }
        const hashedPassword = await (0, password_1.hashPassword)("admin@123");
        await User_1.default.create({
            employeeCode: "ADMIN001",
            fullName: "Super Admin",
            email: "admin@hrms.com",
            mobile: "9999999999",
            password: hashedPassword,
            role: "SUPER_ADMIN",
            department: "Administration",
            designation: "System Administrator",
            isActive: true,
        });
        console.log("🎉 Super Admin Created Successfully");
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
seedSuperAdmin();
