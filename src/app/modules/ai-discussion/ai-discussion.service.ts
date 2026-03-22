import prisma from "../../lib/prisma";
import type { Prisma } from "../../../../generated/prisma/client";

class AiDiscussionService {
  public upsertDiscussion = async (
    userId: string,
    problemId: string,
    messages: any,
  ) => {
    const discussion = await prisma.aiDiscussion.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
      update: {
        messages: messages as any,
      },
      create: {
        userId,
        problemId,
        messages: messages as any,
      },
    });
    return discussion;
  };

  public getDiscussion = async (userId: string, problemId: string) => {
    const discussion = await prisma.aiDiscussion.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
    });
    return discussion;
  };
}

export default AiDiscussionService;
