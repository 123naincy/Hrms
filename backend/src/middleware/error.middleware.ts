import { ErrorRequestHandler, Request, Response } from "express";
import { friendlyError } from "../utils/errors";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  console.error(err);

  const status =
    err?.code === 11000 || err?.name === "ValidationError"
      ? 400
      : typeof err?.status === "number"
        ? err.status
        : 500;

  res.status(status).json({
    success: false,
    message: friendlyError(err),
  });
};
