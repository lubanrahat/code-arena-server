import prisma from "../../lib/prisma";
import { logger } from "../../shared/logger/logger";
import type { ContributionStatus } from "../../../../generated/prisma/client";
import type {
  IContributeCreate,
  IContributeFilterRequest,
} from "./contribute.interface";
import { da } from "zod/locales";
import AppError from "../../shared/errors/app-error";

const createContribution = async (data: IContributeCreate) => {
  const existing = await prisma.contribution.findFirst({
    where: {
      email: data.email,
      contributionType: data.contributionType,
    },
  });

  if (existing) {
    logger.warn(`Contribution already exists for email: ${data.email}, type: ${data.contributionType}`);
    throw new AppError(
      "A contribution with the same email and type already exists.",
    );
  }

  logger.info(`Creating contribution for ${data.email} of type ${data.contributionType}`);
  const result = await prisma.contribution.create({
    data: {
      userId: data.userId || null,
      name: data.name,
      email: data.email,
      countryCode: data.countryCode,
      contactNumber: data.contactNumber,
      contributionType: data.contributionType,
      experience: data.experience,
      portfolioLink: data.portfolioLink,
      message: data.message,
    },
  });
  return result;
};

const getAllContributions = async (filters: IContributeFilterRequest) => {
  const {
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    contributionType,
  } = filters;

  const pageNum = Math.max(1, Number(page || 1));
  const limitNum = Math.max(1, Number(limit || 10));
  const skip = (pageNum - 1) * limitNum;
  const take = limitNum;

  logger.info(`Fetching contributions: page=${pageNum}, limit=${limitNum}, status=${status}, type=${contributionType}`);

  const andConditions = [];

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { experience: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (status && (status as any) !== "ALL") {
    andConditions.push({ status: status as any });
  }

  if (contributionType) {
    andConditions.push({ contributionType });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.contribution.findMany({
    where: whereConditions as any,
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true,
        },
      },
    },
  });

  const total = await prisma.contribution.count({
    where: whereConditions as any,
  });

  return {
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    data: result,
  };
};

const updateContributionStatus = async (
  id: string,
  status: ContributionStatus,
) => {
  const result = await prisma.contribution.update({
    where: { id },
    data: { status },
  });
  return result;
};

export const ContributeService = {
  createContribution,
  getAllContributions,
  updateContributionStatus,
};
