"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post("/login", (req, res) => authController.login(req, res));
router.get("/me", auth_middleware_1.authenticate, (req, res) => authController.me(req, res));
router.get("/admin-test", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(roles_1.ROLES.SUPER_ADMIN, roles_1.ROLES.ADMIN), (req, res) => {
    return res.status(200).json({
        success: true,
        message: "You have admin access",
        user: req.user,
    });
});
exports.default = router;
