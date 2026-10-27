"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({
        id,
        role,
    }, env_1.env.JWT_SECRET || "default_secret_key", {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
};
exports.generateToken = generateToken;
