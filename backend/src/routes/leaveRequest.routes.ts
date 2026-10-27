import { Router } from "express";

import {
  LeaveRequestController,
} from "../controllers/leaveRequest.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import { authorize } from "../middleware/role.middleware";
import { ROLES } from "../constants/roles";

const router = Router();

const controller =
  new LeaveRequestController();

router.post(
  "/",
  authenticate,
  (req, res) =>
    controller.applyLeave(req, res)
);

router.get(
  "/my",
  authenticate,
  (req, res) => controller.getMyLeaves(req, res)
);

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.MANAGER
  ),
  (req, res) => controller.getLeaves(req, res)
);

router.patch(
  "/:id/cancel",
  authenticate,
  (req, res) => controller.cancelLeave(req, res)
);

export default router;