import dotenv from "dotenv";
import mongoose from "mongoose";

import { LeaveBalanceService } from "../services/leaveBalance.service";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined"
  );
}

const test = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected");

    const service =
      new LeaveBalanceService();

    const balances =
      await service.initializeEmployeeBalances(
        "6a76f9dde79278653bdbef05"
      );

    console.log(
      "Employee balances:"
    );

    console.log(
      JSON.stringify(
        balances,
        null,
        2
      )
    );

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

test();