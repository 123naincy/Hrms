"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaveCalculation_controller_1 = require("../controllers/leaveCalculation.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new leaveCalculation_controller_1.LeaveCalculationController();
router.post("/calculate", auth_middleware_1.authenticate, (req, res) => controller.calculate(req, res));
exports.default = router;
