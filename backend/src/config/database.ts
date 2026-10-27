// src/config/database.ts

import mongoose from "mongoose";
import { env } from "./env";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    console.log("===================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log("===================================");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error);

    process.exit(1);
  }
};