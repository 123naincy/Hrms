import { Router } from "express";

import {
  AttendanceController,
} from "../controllers/attendance.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

const router = Router();

const controller =
  new AttendanceController();

// ==========================================
// PUNCH IN
// ==========================================

router.post(
  "/punch-in",
  authenticate,
  (req, res) =>
    controller.punchIn(req, res)
);

// ==========================================
// PUNCH OUT
// ==========================================

router.post(
  "/punch-out",
  authenticate,
  (req, res) =>
    controller.punchOut(req, res)
);
router.get(
  "/today",
  authenticate,
  (req, res) =>
    controller.getToday(req, res)
);
router.get(
  "/my",
  authenticate,
  (req, res) =>
    controller.getMyAttendance(
      req,
      res
    )
);
router.get(
  "/my/monthly",
  authenticate,
  (req, res) =>
    controller.getMonthlyAttendance(req, res)
);
router.get(
  "/org",
  authenticate,
  (req, res) => controller.getOrgAttendance(req, res)
);
router.get(
  "/team",
  authenticate,
  (req, res) => controller.getTeamAttendance(req, res)
);
export default router;