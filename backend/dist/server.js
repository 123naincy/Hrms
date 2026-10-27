"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        app_1.default.listen(env_1.env.PORT, () => {
            console.log("===================================");
            console.log("🚀 HRMS Server Started");
            console.log(`🌍 Environment : ${env_1.env.NODE_ENV}`);
            console.log(`📡 Port        : ${env_1.env.PORT}`);
            console.log(`🔗 URL         : http://localhost:${env_1.env.PORT}`);
            console.log("===================================");
        });
    }
    catch (error) {
        console.error(error);
    }
};
startServer();
