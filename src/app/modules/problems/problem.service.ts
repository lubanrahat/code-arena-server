import prisma from "../../lib/prisma";
import type { IProblemCreate } from "./problem.interface";

class ProblemService {
  public createProblem = async (payload: IProblemCreate, userId: string) => {
    const {
      title,
      description,
      difficulty,
      tags,
      example,
      constraints,
      hints,
      editorial,
      testCases,
      codeSnippets,
      referenceSolutions,
    } = payload;

    


  };
}

export default ProblemService;
