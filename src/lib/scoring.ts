import { Challenge } from '@/types';

/**
 * Calculate points awarded for solving a challenge based on dynamic scoring
 * Formula: points = max(min_points, initial_points - (decay_factor * solves))
 */
export function calculatePoints(
  initialPoints: number,
  minPoints: number,
  decayFactor: number,
  currentSolves: number
): number {
  const points = initialPoints - (decayFactor * currentSolves);
  return Math.max(minPoints, points);
}

/**
 * Calculate points for a challenge object
 */
export function calculateChallengePoints(challenge: Challenge): number {
  return calculatePoints(
    challenge.initialPoints,
    challenge.minPoints,
    challenge.decayFactor,
    challenge.solveCount
  );
}

/**
 * Validate flag format (must be in format: ctnft{...})
 */
export function validateFlag(flag: string): boolean {
  const flagRegex = /^ctnft\{[^}]+\}$/;
  return flagRegex.test(flag);
}

/**
 * Normalize flag for comparison (remove extra whitespace, convert to lowercase)
 */
export function normalizeFlag(flag: string): string {
  return flag.trim().toLowerCase();
}

/**
 * Check if two flags match
 */
export function isCorrectFlag(submittedFlag: string, correctFlag: string): boolean {
  return normalizeFlag(submittedFlag) === normalizeFlag(correctFlag);
}

/**
 * Calculate user rank based on total score
 */
export function calculateRank(userScore: number, allScores: number[]): number {
  const sortedScores = allScores.sort((a, b) => b - a); // Sort descending
  return sortedScores.indexOf(userScore) + 1; // 1-based ranking
}

/**
 * Determine NFT tier based on rank percentile
 */
export function determineNFTTier(rank: number, totalParticipants: number): 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' {
  const percentile = (rank / totalParticipants) * 100;
  
  if (percentile <= 1) {
    return 'DIAMOND';   // Top 1%
  } else if (percentile <= 5) {
    return 'PLATINUM';  // Top 5%
  } else if (percentile <= 10) {
    return 'GOLD';      // Top 10%
  } else if (percentile <= 20) {
    return 'SILVER';    // Top 20%
  } else {
    return 'BRONZE';    // All others
  }
}

/**
 * Format score for display
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Calculate time since solve for display
 */
export function getTimeSince(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Check if event is currently active
 */
export function isEventActive(startTime: Date, endTime: Date): boolean {
  const now = new Date();
  return now >= startTime && now <= endTime;
}

/**
 * Check if event has ended
 */
export function hasEventEnded(endTime: Date): boolean {
  return new Date() > endTime;
}

/**
 * Format event time for display
 */
export function formatEventTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);
}
