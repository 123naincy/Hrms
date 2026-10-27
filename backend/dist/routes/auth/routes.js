"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("../../controllers/auth/controller");
const router = (0, express_1.Router)();
const authController = new controller_1.AuthController();
router.post("/login", (req, res) => authController.login(req, res));
exports.default = router;
