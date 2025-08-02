import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse, LeaderboardEntry } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let leaderboard: LeaderboardEntry[];

    if (eventId) {
      // Event-specific leaderboard
      const participants = await prisma.eventParticipant.findMany({
        where: { eventId },
        include: {
          user: {
            select: { username: true }
          }
        },
        orderBy: { totalScore: 'desc' }
      });

      leaderboard = participants.map((participant: any, index: number) => ({
        userId: participant.userId,
        username: participant.user.username,
        totalScore: participant.totalScore,
        rank: index + 1,
        solveCount: 0, // Will be calculated from solves
        lastSolveTime: undefined
      }));

      // Get solve counts for each participant
      for (const entry of leaderboard) {
        const solveCount = await prisma.solve.count({
          where: {
            userId: entry.userId,
            challenge: {
              eventId
            }
          }
        });

        const lastSolve = await prisma.solve.findFirst({
          where: {
            userId: entry.userId,
            challenge: {
              eventId
            }
          },
          orderBy: { solvedAt: 'desc' }
        });

        entry.solveCount = solveCount;
        entry.lastSolveTime = lastSolve?.solvedAt;
      }
    } else {
      // Global leaderboard
      const users = await prisma.user.findMany({
        where: {
          totalScore: { gt: 0 }
        },
        select: {
          id: true,
          username: true,
          totalScore: true,
          solves: {
            select: {
              solvedAt: true
            },
            orderBy: { solvedAt: 'desc' },
            take: 1
          }
        },
        orderBy: { totalScore: 'desc' },
        take: limit
      });

      leaderboard = users.map((user: any, index: number) => ({
        userId: user.id,
        username: user.username,
        totalScore: user.totalScore,
        rank: index + 1,
        solveCount: 0, // Will be calculated
        lastSolveTime: user.solves[0]?.solvedAt
      }));

      // Get solve counts for each user
      for (const entry of leaderboard) {
        const solveCount = await prisma.solve.count({
          where: { userId: entry.userId }
        });
        entry.solveCount = solveCount;
      }
    }

    const response: ApiResponse<LeaderboardEntry[]> = {
      success: true,
      data: leaderboard
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch leaderboard'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
