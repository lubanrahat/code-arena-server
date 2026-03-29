import { z } from "zod";

const createContribute = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  countryCode: z.string().min(1, "Country code is required"),
  contactNumber: z.string().optional(),
  contributionType: z.string().min(1, "Contribution type is required"),
  experience: z.string().min(2, "Experience must be at least 2 characters"),
  portfolioLink: z.string().url("Invalid URL").optional().or(z.string().length(0)),
  message: z.string().optional(),
});

const updateContributeStatus = z.object({
  status: z.enum(["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"]),
});

export const ContributeValidation = {
  createContribute,
  updateContributeStatus,
};
