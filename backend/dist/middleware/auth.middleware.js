"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // 1. Check Authorization header
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is required",
            });
        }
        // 2. Check Bearer format
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format",
            });
        }
        // 3. Extract token
        const token = authHeader.substring(7);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }
        // 4. Verify JWT
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // 5. Validate payload
        if (typeof decoded !== "object" ||
            decoded === null ||
            !("id" in decoded) ||
            !("role" in decoded)) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        // 6. Attach authenticated user to request
        req.user = {
            id: String(decoded.id),
            role: String(decoded.role),
        };
        // 7. Continue to controller
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
exports.authenticate = authenticate;
