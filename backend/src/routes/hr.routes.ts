import { Router } from "express";
import { HrController } from "../controllers/hr.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { ROLES } from "../constants/roles";

const hrController = new HrController();

const orgRoles = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.HR,
];

const adminRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export const departmentRouter = Router();
departmentRouter.use(authenticate, authorize(...orgRoles));
departmentRouter.get("/", (req, res) =>
  hrController.listDepartments(req, res)
);
departmentRouter.post("/", (req, res) =>
  hrController.createDepartment(req, res)
);
departmentRouter.put("/:id", (req, res) =>
  hrController.updateDepartment(req, res)
);

export const designationRouter = Router();
designationRouter.use(authenticate, authorize(...orgRoles));
designationRouter.get("/", (req, res) =>
  hrController.listDesignations(req, res)
);
designationRouter.post("/", (req, res) =>
  hrController.createDesignation(req, res)
);
designationRouter.put("/:id", (req, res) =>
  hrController.updateDesignation(req, res)
);

export const holidayRouter = Router();
holidayRouter.use(authenticate);
holidayRouter.get("/", (req, res) =>
  hrController.listHolidays(req, res)
);
holidayRouter.post(
  "/",
  authorize(...orgRoles),
  (req, res) => hrController.createHoliday(req, res)
);
holidayRouter.delete(
  "/:id",
  authorize(...orgRoles),
  (req, res) => hrController.removeHoliday(req, res)
);

export const settingRouter = Router();
settingRouter.use(authenticate);
settingRouter.get("/", (req, res) =>
  hrController.getSettings(req, res)
);
settingRouter.put(
  "/",
  authorize(...adminRoles),
  (req, res) => hrController.updateSettings(req, res)
);

export const auditRouter = Router();
auditRouter.use(authenticate, authorize(ROLES.SUPER_ADMIN));
auditRouter.get("/", (req, res) => hrController.listAudit(req, res));

export const roleRouter = Router();
roleRouter.use(authenticate, authorize(ROLES.SUPER_ADMIN));
roleRouter.get("/", (req, res) => hrController.getRoles(req, res));

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);
dashboardRouter.get("/", (req, res) =>
  hrController.getDashboard(req, res)
);

export const payrollRouter = Router();
payrollRouter.use(authenticate);
payrollRouter.get("/salaries", authorize(...adminRoles), (req, res) =>
  hrController.listSalaries(req, res)
);
payrollRouter.post("/salaries", authorize(...adminRoles), (req, res) =>
  hrController.saveSalary(req, res)
);
payrollRouter.get("/payslips", (req, res) =>
  hrController.listPayslips(req, res)
);
payrollRouter.post(
  "/payslips/generate",
  authorize(...adminRoles),
  (req, res) => hrController.generatePayslip(req, res)
);
payrollRouter.patch(
  "/payslips/:id/pay",
  authorize(...adminRoles),
  (req, res) => hrController.markPayslipPaid(req, res)
);
