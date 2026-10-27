import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import { comparePassword, hashPassword } from "../utils/password";
import { generateToken } from "../utils/jwt";

export class AuthService {
  // =========================================================
  // LOGIN
  // =========================================================

  async login(employeeCode: string, password: string) {
    const user = (await User.findOne({
      employeeCode: employeeCode.trim().toUpperCase(),
    }).select("+password")) as (IUser & {
      _id: mongoose.Types.ObjectId;
    }) | null;

    // User not found
    if (!user) {
      throw new Error("Invalid Employee Code");
    }

    // Account inactive
    if (!user.isActive) {
      throw new Error(
        "Your account is inactive. Please contact HR."
      );
    }

    // Check password
    const isPasswordCorrect = await comparePassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new Error("Invalid Password");
    }

    // Generate JWT
    const token = generateToken(
      user._id.toString(),
      user.role
    );

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

  async getCurrentUser(userId: string) {
    const user = await User.findById(userId).select("-password");

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

  async updateProfile(
    userId: string,
    data: { fullName?: string; mobile?: string }
  ) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (data.fullName?.trim()) {
      user.fullName = data.fullName.trim();
    }

    if (data.mobile?.trim()) {
      const existing = await User.findOne({
        mobile: data.mobile.trim(),
        _id: { $ne: userId },
      });

      if (existing) {
        throw new Error("Mobile number already exists");
      }

      user.mobile = data.mobile.trim();
    }

    await user.save();
    return this.getCurrentUser(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new Error("User not found");
    }

    const matches = await comparePassword(
      currentPassword,
      user.password
    );

    if (!matches) {
      throw new Error("Current password is incorrect");
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return { id: user._id };
  }
}