import type { ContributionStatus } from "../../../../generated/prisma/enums";

export interface IContributeCreate {
  userId?: string;
  name: string;
  email: string;
  countryCode: string;
  contactNumber?: string;
  contributionType: string;
  experience: string;
  portfolioLink?: string;
  message?: string;
}

export interface IContributeFilterRequest {
  search?: string;
  status?: ContributionStatus;
  contributionType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
