import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  overview = async (_req: Request, res: Response) => {
    const data = await this.dashboardService.getOverview();

    return res.status(200).json({
      success: true,
      data,
    });
  };
}
