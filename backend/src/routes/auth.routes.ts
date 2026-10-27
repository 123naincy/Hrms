import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { ROLES } from "../constants/roles";

const router = Router();

const authController = new AuthController();

router.post(
  "/login",
  (req, res) => authController.login(req, res)
);

router.get(
  "/me",
  authenticate,
  (req, res) => authController.me(req, res)
);

router.put(
  "/profile",
  authenticate,
  (req, res) => authController.updateProfile(req, res)
);

router.patch(
  "/password",
  authenticate,
  (req, res) => authController.changePassword(req, res)
);

router.get(
  "/admin-test",
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "You have admin access",
      user: req.user,
    });
  }
);

export default router;