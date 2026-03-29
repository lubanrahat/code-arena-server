import type { Request, Response } from "express";
import { ContributeService } from "./contribute.service";
import { catchAsync } from "../../shared/utils/async-handler.util";
import { ResponseUtil } from "../../shared/utils/response.util";
import HttpStatus from "../../shared/constants/http-status";

const createContribution = catchAsync(async (req: Request, res: Response) => {
  const contributionData = req.body;
  // If user is logged in, attach userId
  if (req.user) {
    contributionData.userId = (req.user as any).id;
  }
  
  const result = await ContributeService.createContribution(contributionData);
  
  return ResponseUtil.success(
    res,
    result,
    "Application submitted successfully!",
    HttpStatus.CREATED
  );
});

const getAllContributions = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query as any;
  const result = await ContributeService.getAllContributions(filters);
  
  return ResponseUtil.paginated(
    res,
    result.data,
    result.meta.page,
    result.meta.limit,
    result.meta.total,
    "Contributions fetched successfully!"
  );
});

const updateContributionStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;
  const result = await ContributeService.updateContributionStatus(id, status);
  
  return ResponseUtil.success(
    res,
    result,
    "Status updated successfully!"
  );
});

export const ContributeController = {
  createContribution,
  getAllContributions,
  updateContributionStatus,
};
