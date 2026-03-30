import prisma from "../../lib/prisma";

class SubmissionService {
  public getAllSubmissions = async (userId: string) => {
    const submission = await prisma.submission.findMany({
      where: {
        userId: userId,
      },
      include: {
        problem: {
          select: {
            title: true,
            difficulty: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return submission;
  };

  public getAllSubmissionsByUsername = async (username: string) => {
    const user = await prisma.user.findUnique({
      where: { userName: username },
      select: { id: true },
    });

    if (!user) return [];

    return this.getAllSubmissions(user.id);
  };

  public getSubmissionsForProblem = async (userId: string,problemId:string) => {
    const submission = await prisma.submission.findMany({
      where: {
        userId: userId,
        problemId: problemId
      }
    })
    return submission;
  };
  public getAllTheSubmissionsForProblem = async (problemId: string) => {
    const submission = await prisma.submission.count({
      where: {
        problemId: problemId
      }
    })
    return submission;
  };
}

export default SubmissionService;
