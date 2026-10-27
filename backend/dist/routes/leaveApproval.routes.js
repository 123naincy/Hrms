"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaveApproval_controller_1 = require("../controllers/leaveApproval.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
const controller = new leaveApproval_controller_1.LeaveApprovalController();
const approvalRoles = [
    roles_1.ROLES.SUPER_ADMIN,
    roles_1.ROLES.ADMIN,
    roles_1.ROLES.HR,
    roles_1.ROLES.MANAGER,
];
// ==========================================
// APPROVE
// ==========================================
router.patch("/:id/approve", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(...approvalRoles), (req, res) => controller.approve(req, res));
// ==========================================
// REJECT
// ==========================================
router.patch("/:id/reject", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(...approvalRoles), (req, res) => controller.reject(req, res));
exports.default = router;
