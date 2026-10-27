import { NextFunction, Request, Response } from "express";
import AuditLog from "../models/AuditLog";

const METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function auditLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.on("finish", () => {
    if (!METHODS.has(req.method) || !req.user) {
      return;
    }

    if (res.statusCode >= 400) {
      return;
    }

    const path = req.originalUrl || req.path;

    if (path.includes("/auth/login")) {
      return;
    }

    AuditLog.create({
      userId: req.user.id,
      role: req.user.role,
      method: req.method,
      path,
      statusCode: res.statusCode,
    }).catch(() => undefined);
  });

  next();
}
