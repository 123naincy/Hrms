import { Router } from "express";

import {
  LeaveApprovalController,
} from "../controllers/leaveApproval.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  authorize,
} from "../middleware/role.middleware";

import {
  ROLES,
} from "../constants/roles";

const router = Router();

const controller =
  new LeaveApprovalController();

const approvalRoles = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.HR,
  ROLES.MANAGER,
];

// ==========================================
// APPROVE
// ==========================================

router.patch(
  "/:id/approve",
  authenticate,
  authorize(...approvalRoles),
  (req, res) =>
    controller.approve(req, res)
);

// ==========================================
// REJECT
// ==========================================

router.patch(
  "/:id/reject",
  authenticate,
  authorize(...approvalRoles),
  (req, res) =>
    controller.reject(req, res)
);

export default router;