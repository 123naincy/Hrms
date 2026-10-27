import { Router } from "express";

import {
  LeaveBalanceController,
} from "../controllers/leaveBalance.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

import { ROLES } from "../constants/roles";

const router = Router();

const controller =
  new LeaveBalanceController();

// ==========================================
// EMPLOYEE
// ==========================================

router.get(
  "/my",
  authenticate,
  (req, res) =>
    controller.getMyBalance(req, res)
);

// ==========================================
// HR / ADMIN INITIALIZATION
// ==========================================

router.post(
  "/initialize",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR
  ),
  (req, res) =>
    controller.initialize(req, res)
);

export default router;