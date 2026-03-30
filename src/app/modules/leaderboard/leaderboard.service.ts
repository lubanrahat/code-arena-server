import prisma from "../../lib/prisma";
import { logger } from "../../shared/logger/logger";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  userName: string;
  imageUrl: string | null;
  institution: string | null;
  score: number;
  problemsSolvedCount: number;
}

class LeaderboardService {
  /**
   * Get the full paginated leaderboard.
   * Ranks users by profile.score DESC, then problemSolved count DESC.
   */
  public getLeaderboard = async (
    page: number = 1,
    limit: number = 20,
    currentUserId?: string,
  ) => {
    logger.info(`Fetching leaderboard page=${page} limit=${limit}`);

    // Get all users with their profile score and solved count
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        imageUrl: true,
        profile: {
          select: {
            score: true,
            institution: true,
          },
        },
        _count: {
          select: {
            problemSolved: true,
          },
        },
      },
    });

    // Sort: score DESC, then problemSolved DESC, then userName ASC as tiebreaker
    const sorted = users
      .map((u) => ({
        userId: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        userName: u.userName,
        imageUrl: u.imageUrl,
        institution: u.profile?.institution ?? null,
        score: u.profile?.score ?? 0,
        problemsSolvedCount: u._count.problemSolved,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.problemsSolvedCount !== a.problemsSolvedCount)
          return b.problemsSolvedCount - a.problemsSolvedCount;
        return a.userName.localeCompare(b.userName);
      });

    // Assign ranks (1-indexed, ties get same rank)
    const ranked: LeaderboardEntry[] = [];
    let currentRank = 1;
    for (let i = 0; i < sorted.length; i++) {
      const curr = sorted[i]!;
      const prev = i > 0 ? sorted[i - 1]! : null;
      if (
        prev &&
        (curr.score !== prev.score ||
          curr.problemsSolvedCount !== prev.problemsSolvedCount)
      ) {
        currentRank = i + 1;
      }
      ranked.push({ ...curr, rank: currentRank });
    }

    const total = ranked.length;
    const totalPages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;
    const paginatedEntries = ranked.slice(startIdx, startIdx + limit);

    // If a user is logged in, find their rank
    let currentUserEntry: LeaderboardEntry | null = null;
    if (currentUserId) {
      currentUserEntry =
        ranked.find((e) => e.userId === currentUserId) ?? null;
    }

    return {
      entries: paginatedEntries,
      currentUser: currentUserEntry,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  };

  /**
   * Get top 3 users + optionally the requesting user's rank.
   * Used by the sidebar widget on the problems page.
   */
  public getTopThreeAndUserRank = async (currentUserId?: string) => {
    logger.info(
      `Fetching top 3 leaderboard entries${currentUserId ? ` + rank for user ${currentUserId}` : ""}`,
    );

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        userName: true,
        imageUrl: true,
        profile: {
          select: {
            score: true,
            institution: true,
          },
        },
        _count: {
          select: {
            problemSolved: true,
          },
        },
      },
    });

    const sorted = users
      .map((u) => ({
        userId: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        userName: u.userName,
        imageUrl: u.imageUrl,
        institution: u.profile?.institution ?? null,
        score: u.profile?.score ?? 0,
        problemsSolvedCount: u._count.problemSolved,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.problemsSolvedCount !== a.problemsSolvedCount)
          return b.problemsSolvedCount - a.problemsSolvedCount;
        return a.userName.localeCompare(b.userName);
      });

    // Assign ranks
    const ranked: LeaderboardEntry[] = [];
    let currentRank = 1;
    for (let i = 0; i < sorted.length; i++) {
      const curr = sorted[i]!;
      const prev = i > 0 ? sorted[i - 1]! : null;
      if (
        prev &&
        (curr.score !== prev.score ||
          curr.problemsSolvedCount !== prev.problemsSolvedCount)
      ) {
        currentRank = i + 1;
      }
      ranked.push({ ...curr, rank: currentRank });
    }

    const topThree = ranked.slice(0, 3);

    let currentUser: LeaderboardEntry | null = null;
    if (currentUserId) {
      currentUser =
        ranked.find((e) => e.userId === currentUserId) ?? null;
    }

    return {
      topThree,
      currentUser,
      totalUsers: ranked.length,
    };
  };
}

export default LeaderboardService;
