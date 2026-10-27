"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const leaveBalance_service_1 = require("../services/leaveBalance.service");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
}
const test = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log("MongoDB connected");
        const service = new leaveBalance_service_1.LeaveBalanceService();
        const balances = await service.initializeEmployeeBalances("6a76f9dde79278653bdbef05");
        console.log("Employee balances:");
        console.log(JSON.stringify(balances, null, 2));
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
};
test();
