import { Router } from "express";
import authRoutes from "./auth.routes";
import employeeRoutes from "./employee.routes";
import attendanceRoutes from "./attendance.routes";
import weekOffRoutes from "./weekOff.routes";
import leaveRoutes from "./leave.routes";
import leaveBalanceRoutes from "./leaveBalance.routes";
import leaveCalculationRoutes from "./leaveCalculation.routes";
import leaveRequestRoutes from "./leaveRequest.routes";
import leaveApprovalRoutes from "./leaveApproval.routes";
import {
  departmentRouter,
  designationRouter,
  holidayRouter,
  settingRouter,
  auditRouter,
  roleRouter,
  dashboardRouter,
  payrollRouter,
} from "./hr.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/attendance", attendanceRoutes);
router.use( "/week-offs",weekOffRoutes);
router.use("/leaves", leaveRoutes);
router.use(
  "/leave-balances",
  leaveBalanceRoutes
);
router.use(
  "/leave-calculation",
  leaveCalculationRoutes
);
router.use(
  "/leave-requests",
  leaveRequestRoutes
);
router.use(
  "/leave-requests",
  leaveApprovalRoutes
);
router.use("/departments", departmentRouter);
router.use("/designations", designationRouter);
router.use("/holidays", holidayRouter);
router.use("/settings", settingRouter);
router.use("/audit-logs", auditRouter);
router.use("/roles", roleRouter);
router.use("/dashboard", dashboardRouter);
router.use("/payroll", payrollRouter);

export default router;