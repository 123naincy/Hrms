import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { ROLES } from "../constants/roles";

const router = Router();

const employeeController = new EmployeeController();

router.get(
  "/team",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.MANAGER
  ),
  (req, res) => employeeController.getMyTeam(req, res)
);
router.post(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR
  ),
  (req, res) =>
    employeeController.createEmployee(req, res)
);
router.get(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR
  ),
  (req, res) =>
    employeeController.getEmployeeById(req, res)
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
    employeeController.getEmployees(req, res)
);
router.put(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR
  ),
  (req, res) =>
    employeeController.updateEmployee(req, res)
);
router.patch(
  "/:id/status",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR
  ),
  (req, res) =>
    employeeController.updateEmployeeStatus(
      req,
      res
    )
);
router.patch(
  "/:id/password",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.HR
  ),
  (req, res) =>
    employeeController.resetPassword(req, res)
);
router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  (req, res) =>
    employeeController.deleteEmployee(req, res)
);
export default router;