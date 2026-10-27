import { Router } from "express";

import { LeaveController } from "../controllers/leave.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

const leaveController =
  new LeaveController();

router.post(
  "/",
  authenticate,
  (req, res) =>
    leaveController.applyLeave(req, res)
);

export default router;