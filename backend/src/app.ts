import express, { Request, Response } from "express";
import cors from "cors";
import routes from "./routes";
import { auditLogger } from "./middleware/audit.middleware";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware";

const app = express();

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

// ==========================================
// BODY PARSER
// ==========================================

app.use(express.json({ limit: "3mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "3mb",
  })
);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get(
  "/api/health",
  (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "HRMS API Running",
    });
  }
);

// ==========================================
// API ROUTES
// ==========================================

app.use(auditLogger);
app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;