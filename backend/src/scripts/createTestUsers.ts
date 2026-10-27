import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User";
import { ROLES } from "../constants/roles";
import { hashPassword } from "../utils/password";

dotenv.config();

const createTestUsers = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const users = [
      {
        employeeCode: "ADMIN001",
        fullName: "Admin User",
        email: "admin@enterprise-hrms.com",
        mobile: "9000000001",
        password: "Admin@123",
        role: ROLES.ADMIN,
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
        role: ROLES.HR,
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
        role: ROLES.MANAGER,
        department: "Sales",
        designation: "Manager",
        joiningDate: new Date("2026-01-01"),
        isActive: true,
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({
        $or: [
          { employeeCode: userData.employeeCode },
          { email: userData.email },
          { mobile: userData.mobile },
        ],
      });

      if (existingUser) {
        console.log(
          `Already exists: ${userData.employeeCode}`
        );
        continue;
      }

      const hashedPassword = await hashPassword(
        userData.password
      );

      await User.create({
        ...userData,
        password: hashedPassword,
      });

      console.log(
        `Created: ${userData.employeeCode} (${userData.role})`
      );
    }

    console.log("Test users setup completed.");

  } catch (error) {
    console.error("Error creating test users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

createTestUsers();