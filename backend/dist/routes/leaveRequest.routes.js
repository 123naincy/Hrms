"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaveRequest_controller_1 = require("../controllers/leaveRequest.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new leaveRequest_controller_1.LeaveRequestController();
router.post("/", auth_middleware_1.authenticate, (req, res) => controller.applyLeave(req, res));
exports.default = router;
