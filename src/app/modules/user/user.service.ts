import prisma from "../../lib/prisma";
import type { Difficulty } from "../../../../generated/prisma/client";
import AppError from "../../shared/errors/app-error";
import HttpStatus from "../../shared/constants/http-status";
import { logger } from "../../shared/logger/logger";

class UserService {
  public getProfile = async (userId: string) => {
    console.log("[UserService] getProfile - searching for userId:", userId);
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        imageUrl: true,
        role: true,
        createdAt: true,
        profile: true,
        isPremium: true
      },
    });

    if (!user) {
      logger.error(`User not found: ${userId}`);
      throw new AppError(
        "User not found",
        HttpStatus.NOT_FOUND,
        "USER_NOT_FOUND",
      );
    }
    logger.info(`Fetching profile info for user: ${userId}`);

    if (!user.profile) {
      await prisma.profile.create({ data: { userId } });
      const refreshedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          email: true,
          imageUrl: true,
          role: true,
          createdAt: true,
          profile: true,
          isPremium: true
        },
      });
      if (!refreshedUser) {
        throw new AppError(
          "User not found after profile creation",
          HttpStatus.NOT_FOUND,
          "USER_NOT_FOUND",
        );
      }
      user = refreshedUser;
    }

    const toDateStr = (d: Date): string => {
      const dateStr = d.toISOString().split("T")[0];
      return dateStr ?? "";
    };

    const problemsSolved = await prisma.problemSolved.findMany({
      where: { userId },
      include: {
        problem: {
          select: {
            difficulty: true,
            topic: true,
            tags: true,
          },
        },
      },
    });

    const totalProblemsSolved = problemsSolved.length;

    const difficultyCounts: Record<Difficulty, number> = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
    };

    const skillCounts: Record<string, number> = {};
    problemsSolved.forEach((ps: any) => {
      const p = ps.problem;
      if (p?.difficulty) difficultyCounts[p.difficulty as Difficulty] += 1;
      if (p?.topic) skillCounts[p.topic] = (skillCounts[p.topic] || 0) + 1;
      if (Array.isArray(p?.tags)) {
        p.tags.forEach((t: string) => {
          skillCounts[t] = (skillCounts[t] || 0) + 1;
        });
      }
    });

    const submissions = await prisma.submission.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        status: true,
        time: true,
      },
    });

    const submissionAnalysis: Record<string, number> = {};
    const activityHeatmap: Record<string, number> = {};

    submissions.forEach((sub: any) => {
      const status = sub.status || "Unknown";
      submissionAnalysis[status] = (submissionAnalysis[status] || 0) + 1;

      const dateStr = toDateStr(sub.createdAt);
      activityHeatmap[dateStr] = (activityHeatmap[dateStr] || 0) + 1;
    });

    const activeDays = Object.keys(activityHeatmap).length;

    const year = new Date().getFullYear();
    const submissionsThisYear = submissions.filter(
      (s) => s.createdAt.getFullYear() === year,
    );

    const submissionDaysThisYear = Array.from(
      new Set(submissionsThisYear.map((s) => toDateStr(s.createdAt))),
    ).sort();

    const dayMs = 24 * 60 * 60 * 1000;
    const maxStreakDays = (() => {
      let best = 0;
      let current = 0;
      let prevTs: number | null = null;
      for (const day of submissionDaysThisYear) {
        const ts = Date.parse(`${day}T00:00:00.000Z`);
        if (prevTs !== null && ts - prevTs === dayMs) {
          current += 1;
        } else {
          current = 1;
        }
        best = Math.max(best, current);
        prevTs = ts;
      }
      return best;
    })();

    // Daily series for the last 7 days (oldest -> newest)
    const dailySubmissionsLast7 = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      const dateStr = toDateStr(d);
      return activityHeatmap[dateStr] || 0;
    });

    // Time spent: sum of all parsed seconds from submission.time.
    const parseSecondsFromJudgeTime = (time: unknown) => {
      if (!time) return 0;
      if (typeof time !== "string") return 0;
      const matches = time.match(/-?\d+(\.\d+)?/g);
      if (!matches) return 0;
      return matches.reduce((acc, m) => acc + Number(m), 0);
    };

    const totalSeconds = submissions.reduce(
      (acc, s) => acc + parseSecondsFromJudgeTime((s as any).time),
      0,
    );
    const totalHours = totalSeconds / 3600;
    const timeSpent =
      totalSeconds > 0
        ? `${totalHours.toFixed(totalHours >= 10 ? 0 : 1)} hours`
        : "0 hours";

    // Ranking (computed from ProblemSolved counts across all users)
    console.log("Calculating global ranks...");
    const solvedCounts = await prisma.problemSolved.groupBy({
      by: ["userId"],
      _count: {
        problemId: true,
      },
    });

    const solvedEntriesSorted = solvedCounts
      .map((entry) => ({
        userId: entry.userId,
        count: entry._count.problemId,
      }))
      .sort((a, b) => b.count - a.count);

    const globalRank = (() => {
      const idx = solvedEntriesSorted.findIndex((e) => e.userId === userId);
      return idx >= 0 ? idx + 1 : solvedEntriesSorted.length + 1;
    })();

    const institution = user.profile?.institution;
    let universityRank = globalRank;
    if (institution) {
      logger.debug(`Calculating university rank for: ${institution}`);
      const uniUserIds = await prisma.profile.findMany({
        where: { institution },
        select: { userId: true },
      });
      const uniSet = new Set(uniUserIds.map((p) => p.userId));
      const uniEntriesSorted = solvedEntriesSorted.filter((e) =>
        uniSet.has(e.userId),
      );
      const idx = uniEntriesSorted.findIndex((e) => e.userId === userId);
      universityRank = idx >= 0 ? idx + 1 : 1;
    }

    // Skill analysis: top topics/tags by solved count.
    const skillEntriesSorted = Object.entries(skillCounts).sort(
      (a, b) => b[1] - a[1],
    );
    const topSkills = skillEntriesSorted.slice(0, 6);
    const maxSkillCount = Math.max(1, ...topSkills.map(([, c]) => c));
    const skills = topSkills.map(([name, c]) => ({
      name,
      // convert to percent so the UI can set bar width
      value: Math.round((c / maxSkillCount) * 100),
    }));

    const profileScore = user.profile?.score ?? 0;
    const profileCoins = user.profile?.coins ?? 0;

    return {
      ...user,
      stats: {
        totalProblemsSolved,
        difficultyCounts,
        submissionAnalysis,
        activityHeatmap,
        activeDays,
        totalScore: profileScore,
        coins: profileCoins,
        submissionsThisYear: submissionsThisYear.length,
        maxStreakDays: maxStreakDays || 0,
        dailySubmissionsLast7,
        globalRank,
        universityRank,
        timeSpent,
        skills,
      },
    };
  };

  public getProfileByUsername = async (username: string) => {
    const user = await prisma.user.findUnique({
      where: { userName: username },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(
        "User not found",
        HttpStatus.NOT_FOUND,
        "USER_NOT_FOUND",
      );
    }

    return this.getProfile(user.id);
  };

  public updateProfile = async (userId: string, data: any) => {
    // Allow updating user basic Info as well (firstName, lastName, imageUrl)
    const userData: any = {};
    if (data.firstName) userData.firstName = data.firstName;
    if (data.lastName) userData.lastName = data.lastName;
    if (data.imageUrl) userData.imageUrl = data.imageUrl;

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userData,
      });
    }

    // Upsert profile
    const profileData = {
      location: data.location ?? null,
      institution: data.institution ?? null,
      website: data.website ?? null,
      github: data.github ?? null,
      linkedin: data.linkedin ?? null,
      twitter: data.twitter ?? null,
    };

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: profileData,
      create: { ...profileData, userId },
    });

    return profile;
  };
}

export default UserService;
