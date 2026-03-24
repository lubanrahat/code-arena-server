import { PrismaClient } from "../../../../generated/prisma/client";
import { Role } from "../../../../generated/prisma/enums";
import prisma from "../../lib/prisma";

class AdminService {
  //Get overall stats for the dashboard.
  public async getStats() {
    const [userCount, problemCount, submissionCount] = await Promise.all([
      prisma.user.count(),
      prisma.problem.count(),
      prisma.submission.count(),
    ]);

    // Get difficulty distribution
    const difficultyDistribution = await prisma.problem.groupBy({
      by: ["difficulty"],
      _count: {
        _all: true,
      },
    });

    // Get recent submission activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSubmissions = await prisma.submission.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group submissions by day for the chart
    const dailyActivity: Record<string, { date: string; count: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      dailyActivity[dateStr] = { date: dateStr, count: 0 };
    }

    recentSubmissions.forEach((sub: { createdAt: Date }) => {
      const dateStr = sub.createdAt.toISOString().slice(0, 10);
      if (dailyActivity[dateStr]) {
        dailyActivity[dateStr].count++;
      }
    });

    const activityData = Object.values(dailyActivity).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return {
      overview: {
        totalUsers: userCount,
        totalProblems: problemCount,
        totalSubmissions: submissionCount,
      },
      difficultyDistribution: difficultyDistribution.map((d) => ({
        difficulty: d.difficulty,
        count: d._count._all,
      })),
      activityData,
    };
  }

  //Get all users.
  public async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }
}

export default AdminService;
