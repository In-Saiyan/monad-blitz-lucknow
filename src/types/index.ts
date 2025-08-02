import { UserRole } from '@prisma/client';

export interface User {
  id: string;
  username: string;
  email: string;
  walletAddress?: string | null;
  role: UserRole;
  totalScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export { UserRole };

export interface CTFEvent {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  organizerId: string;
  organizer: User;
  challenges: Challenge[];
  participants: EventParticipant[];
  totalParticipants: number;
  maxParticipants?: number; // Participation limit set by organizer
  joinDeadlineMinutes?: number; // Minutes after start time when joining is no longer allowed
  createdAt: Date;
  updatedAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  flag: string;
  initialPoints: number;
  minPoints: number;
  decayFactor: number;
  difficulty: string;
  solveCount: number;
  fileUrl?: string;
  eventId: string;
  event: CTFEvent;
  solves: Solve[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Solve {
  id: string;
  userId: string;
  user: User;
  challengeId: string;
  challenge: Challenge;
  pointsAwarded: number;
  solvedAt: Date;
}

export interface EventParticipant {
  id: string;
  userId: string;
  user: User;
  eventId: string;
  event: CTFEvent;
  totalScore: number;
  rank?: number;
  hasReceivedNFT: boolean;
  nftTokenId?: string;
  joinedAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalScore: number;
  rank: number;
  solveCount: number;
  lastSolveTime?: Date;
}

export enum NFTTier {
  DIAMOND = 'DIAMOND',    // Top 1%
  PLATINUM = 'PLATINUM',  // Top 5%
  GOLD = 'GOLD',          // Top 10%
  SILVER = 'SILVER',      // Top 20%
  BRONZE = 'BRONZE'       // All others
}

export interface NFTMetadata {
  tokenId?: string;
  eventId: string;
  tier: NFTTier;
  rank: number;
  score: number;
  eventName: string;
  mintTimestamp: Date;
  walletAddress?: string;
}

export interface ScoringConfig {
  initialPoints: number;
  minPoints: number;
  decayFactor: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  walletAddress?: string;
}

export interface FlagSubmission {
  challengeId: string;
  flag: string;
}

export interface ChallengeFormData {
  title: string;
  description: string;
  category: string;
  flag: string;
  initialPoints: number;
  minPoints: number;
  decayFactor: number;
  file?: File;
}

export interface EventFormData {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  maxParticipants?: number;
  joinDeadlineMinutes?: number;
}
