import { Request, Response } from "express";
import { HrService } from "../services/hr.service";
import { friendlyError } from "../utils/errors";

const hrService = new HrService();

function fail(res: Response, error: any, status = 400) {
  const message = friendlyError(error);
  const resolvedStatus =
    error?.code === 11000 || error?.name === "ValidationError"
      ? 400
      : status;

  return res.status(resolvedStatus).json({
    success: false,
    message,
  });
}

export class HrController {
  async listDepartments(_req: Request, res: Response) {
    try {
      const data = await hrService.listDepartments();
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error, 500);
    }
  }

  async createDepartment(req: Request, res: Response) {
    try {
      const data = await hrService.createDepartment(req.body);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return fail(res, error);
    }
  }

  async updateDepartment(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const data = await hrService.updateDepartment(id, req.body);
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error);
    }
  }

  async listDesignations(_req: Request, res: Response) {
    try {
      const data = await hrService.listDesignations();
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error, 500);
    }
  }

  async createDesignation(req: Request, res: Response) {
    try {
      const data = await hrService.createDesignation(req.body);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return fail(res, error);
    }
  }

  async updateDesignation(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const data = await hrService.updateDesignation(id, req.body);
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error);
    }
  }

  async listHolidays(_req: Request, res: Response) {
    try {
      const data = await hrService.listHolidays();
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error, 500);
    }
  }

  async createHoliday(req: Request, res: Response) {
    try {
      const data = await hrService.createHoliday(req.body);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return fail(res, error);
    }
  }

  async removeHoliday(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const data = await hrService.removeHoliday(id);
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error);
    }
  }

  async getSettings(_req: Request, res: Response) {
    try {
      const data = await hrService.getSettings();
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error, 500);
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      const data = await hrService.updateSettings(req.body);
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error);
    }
  }

  async listAudit(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit || 100);
      const data = await hrService.listAudit(limit);
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error, 500);
    }
  }

  async getRoles(_req: Request, res: Response) {
    try {
      const data = await hrService.getRoles();
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error, 500);
    }
  }

  async getDashboard(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await hrService.getDashboard(
        req.user.id,
        req.user.role
      );

      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error, 500);
    }
  }

  async listSalaries(_req: Request, res: Response) {
    try {
      const data = await hrService.listSalaries();
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error, 500);
    }
  }

  async saveSalary(req: Request, res: Response) {
    try {
      const data = await hrService.saveSalary(req.body);
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error);
    }
  }

  async listPayslips(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const year = req.query.year
        ? Number(req.query.year)
        : undefined;
      const month = req.query.month
        ? Number(req.query.month)
        : undefined;

      const canViewAll =
        req.user.role === "SUPER_ADMIN" ||
        req.user.role === "ADMIN";

      const mine = req.query.mine === "true" || !canViewAll;

      const data = mine
        ? await hrService.listMyPayslips(req.user.id)
        : await hrService.listPayslips(year, month);

      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error, 500);
    }
  }

  async generatePayslip(req: Request, res: Response) {
    try {
      const year = Number(req.body.year);
      const month = Number(req.body.month);

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          message: "Year and month are required",
        });
      }

      const data = req.body.employeeId
        ? await hrService.generatePayslip(
            req.body.employeeId,
            year,
            month
          )
        : await hrService.generateAll(year, month);

      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error);
    }
  }

  async markPayslipPaid(req: Request, res: Response) {
    try {
      const data = await hrService.markPayslipPaid(String(req.params.id));
      return res.json({ success: true, data });
    } catch (error) {
      return fail(res, error);
    }
  }
}
