"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaveBalance_controller_1 = require("../controllers/leaveBalance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
const controller = new leaveBalance_controller_1.LeaveBalanceController();
// ==========================================
// EMPLOYEE
// ==========================================
router.get("/my", auth_middleware_1.authenticate, (req, res) => controller.getMyBalance(req, res));
// ==========================================
// HR / ADMIN INITIALIZATION
// ==========================================
router.post("/initialize", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(roles_1.ROLES.SUPER_ADMIN, roles_1.ROLES.ADMIN, roles_1.ROLES.HR), (req, res) => controller.initialize(req, res));
exports.default = router;
