"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leave_controller_1 = require("../controllers/leave.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const leaveController = new leave_controller_1.LeaveController();
router.post("/", auth_middleware_1.authenticate, (req, res) => leaveController.applyLeave(req, res));
exports.default = router;
