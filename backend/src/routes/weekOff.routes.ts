import { Router } from "express";

import { WeekOffController } from "../controllers/weekOff.controller";

import { authenticate } from "../middleware/auth.middleware";

import { authorize } from "../middleware/role.middleware";

import { ROLES } from "../constants/roles";

const router = Router();

const weekOffController =
  new WeekOffController();

router.post(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR
  ),
  (req, res) =>
    weekOffController.createWeekOff(
      req,
      res
    )
);

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR
  ),
  (req, res) =>
    weekOffController.getWeekOffs(
      req,
      res
    )
);

export default router;