import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User";
import { hashPassword } from "../utils/password";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("✅ MongoDB Connected");

    const exists = await User.findOne({
      employeeCode: "ADMIN001",
    });

    if (exists) {
      console.log("⚠️ Super Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await hashPassword("admin@123");

    await User.create({
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
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedSuperAdmin();