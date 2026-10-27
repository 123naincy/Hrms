"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new attendance_controller_1.AttendanceController();
// ==========================================
// PUNCH IN
// ==========================================
router.post("/punch-in", auth_middleware_1.authenticate, (req, res) => controller.punchIn(req, res));
// ==========================================
// PUNCH OUT
// ==========================================
router.post("/punch-out", auth_middleware_1.authenticate, (req, res) => controller.punchOut(req, res));
router.get("/today", auth_middleware_1.authenticate, (req, res) => controller.getToday(req, res));
router.get("/my", auth_middleware_1.authenticate, (req, res) => controller.getMyAttendance(req, res));
exports.default = router;
