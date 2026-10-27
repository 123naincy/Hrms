import { Router } from "express";

import {
  LeaveCalculationController,
} from "../controllers/leaveCalculation.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

const router = Router();

const controller =
  new LeaveCalculationController();

router.post(
  "/calculate",
  authenticate,
  (req, res) =>
    controller.calculate(req, res)
);

export default router;