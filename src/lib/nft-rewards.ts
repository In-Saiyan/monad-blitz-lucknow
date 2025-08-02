import { initializeContract } from './blockchain';
import { determineNFTTier } from './scoring';
import { prisma } from './prisma';
import { NFTTier } from '@/types';

export interface RewardEligibleParticipant {
  userId: string;
  username: string;
  walletAddress: string;
  totalScore: number;
  rank: number;
  tier: NFTTier;
}

/**
 * Calculate final rankings and determine NFT tiers for all participants
 */
export async function calculateEventRankings(eventId: string): Promise<RewardEligibleParticipant[]> {
  try {
    // Get all participants with their final scores
    const participants = await prisma.eventParticipant.findMany({
      where: { 
        eventId,
        user: {
          walletAddress: {
            not: null
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true
          }
        }
      },
      orderBy: {
        totalScore: 'desc'
      }
    });

    if (participants.length === 0) {
      throw new Error('No participants with wallet addresses found');
    }

    // Calculate rankings and NFT tiers
    const rankings: RewardEligibleParticipant[] = participants.map((participant, index) => {
      const rank = index + 1; // 1-based ranking
      const tierString = determineNFTTier(rank, participants.length);
      
      // Convert string to NFTTier enum
      let tier: NFTTier;
      switch (tierString) {
        case 'DIAMOND': tier = NFTTier.DIAMOND; break;
        case 'PLATINUM': tier = NFTTier.PLATINUM; break;
        case 'GOLD': tier = NFTTier.GOLD; break;
        case 'SILVER': tier = NFTTier.SILVER; break;
        case 'BRONZE': tier = NFTTier.BRONZE; break;
        default: tier = NFTTier.BRONZE;
      }

      return {
        userId: participant.user.id,
        username: participant.user.username,
        walletAddress: participant.user.walletAddress!,
        totalScore: participant.totalScore,
        rank,
        tier
      };
    });

    return rankings;
  } catch (error) {
    console.error('Error calculating event rankings:', error);
    throw error;
  }
}

/**
 * Distribute NFT rewards to all participants after contest ends
 */
export async function distributeNFTRewards(eventId: string): Promise<{
  success: boolean;
  totalDistributed: number;
  errors: string[];
}> {
  try {
    // Check if event has ended
    const event = await prisma.cTFEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (new Date() < event.endTime) {
      throw new Error('Event has not ended yet');
    }

    // Check if NFTs have already been distributed
    const existingNFTs = await prisma.eventParticipant.findFirst({
      where: { 
        eventId,
        hasReceivedNFT: true
      }
    });

    if (existingNFTs) {
      throw new Error('NFTs have already been distributed for this event');
    }

    // Calculate final rankings
    const rankings = await calculateEventRankings(eventId);
    
    if (rankings.length === 0) {
      throw new Error('No eligible participants found');
    }

    // Initialize blockchain contract
    const contract = initializeContract();
    if (!contract) {
      throw new Error('Failed to initialize blockchain contract');
    }

    console.log(`Distributing NFTs to ${rankings.length} participants for event ${eventId}`);

    const errors: string[] = [];
    let totalDistributed = 0;

    // Batch mint NFTs (split into smaller batches if needed)
    const batchSize = 10; // Process in batches of 10
    
    for (let i = 0; i < rankings.length; i += batchSize) {
      const batch = rankings.slice(i, i + batchSize);
      
      try {
        // Prepare batch data
        const recipients = batch.map(p => p.walletAddress);
        const ranks = batch.map(p => p.rank);
        const scores = batch.map(p => p.totalScore);

        // Convert event ID to number (use timestamp for now)
        const eventIdNumber = parseInt(eventId.slice(-8), 16) % 1000000;

        // Batch mint NFTs
        await contract.batchMintRewards(
          recipients,
          eventIdNumber,
          ranks,
          scores,
          rankings.length
        );

        // Update database records
        for (const participant of batch) {
          await prisma.eventParticipant.update({
            where: {
              userId_eventId: {
                userId: participant.userId,
                eventId
              }
            },
            data: {
              hasReceivedNFT: true,
              nftTokenId: `${eventIdNumber}-${participant.rank}` // Temporary token ID format
            }
          });
        }

        totalDistributed += batch.length;
        console.log(`Successfully distributed NFTs to batch ${Math.floor(i/batchSize) + 1}`);

      } catch (error) {
        console.error(`Error distributing NFTs to batch ${Math.floor(i/batchSize) + 1}:`, error);
        errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${error}`);
      }
    }

    // Log tier distribution
    const tierCounts = rankings.reduce((acc, participant) => {
      acc[participant.tier] = (acc[participant.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('NFT Tier Distribution:', tierCounts);

    return {
      success: errors.length === 0,
      totalDistributed,
      errors
    };

  } catch (error) {
    console.error('Error distributing NFT rewards:', error);
    throw error;
  }
}

/**
 * Get tier distribution statistics for an event
 */
export async function getTierDistribution(eventId: string): Promise<{
  totalParticipants: number;
  tiers: Record<NFTTier, { count: number; percentage: number; rankRange: string }>;
}> {
  try {
    const rankings = await calculateEventRankings(eventId);
    const totalParticipants = rankings.length;

    const tierData: Record<NFTTier, { count: number; percentage: number; rankRange: string }> = {
      [NFTTier.DIAMOND]: { count: 0, percentage: 0, rankRange: '' },
      [NFTTier.PLATINUM]: { count: 0, percentage: 0, rankRange: '' },
      [NFTTier.GOLD]: { count: 0, percentage: 0, rankRange: '' },
      [NFTTier.SILVER]: { count: 0, percentage: 0, rankRange: '' },
      [NFTTier.BRONZE]: { count: 0, percentage: 0, rankRange: '' }
    };

    // Count participants per tier and determine rank ranges
    const tierRanks: Record<NFTTier, number[]> = {
      [NFTTier.DIAMOND]: [],
      [NFTTier.PLATINUM]: [],
      [NFTTier.GOLD]: [],
      [NFTTier.SILVER]: [],
      [NFTTier.BRONZE]: []
    };

    rankings.forEach(participant => {
      tierData[participant.tier].count++;
      tierRanks[participant.tier].push(participant.rank);
    });

    // Calculate percentages and rank ranges
    Object.entries(tierData).forEach(([tier, data]) => {
      const tierKey = tier as NFTTier;
      data.percentage = totalParticipants > 0 ? (data.count / totalParticipants) * 100 : 0;
      
      const ranks = tierRanks[tierKey].sort((a, b) => a - b);
      if (ranks.length > 0) {
        data.rankRange = ranks.length === 1 
          ? `#${ranks[0]}` 
          : `#${ranks[0]} - #${ranks[ranks.length - 1]}`;
      }
    });

    return {
      totalParticipants,
      tiers: tierData
    };
  } catch (error) {
    console.error('Error getting tier distribution:', error);
    throw error;
  }
}

/**
 * Preview NFT rewards before distribution
 */
export async function previewNFTRewards(eventId: string): Promise<{
  eventName: string;
  totalParticipants: number;
  rankings: RewardEligibleParticipant[];
  tierDistribution: Awaited<ReturnType<typeof getTierDistribution>>['tiers'];
}> {
  try {
    const event = await prisma.cTFEvent.findUnique({
      where: { id: eventId },
      select: { name: true }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const rankings = await calculateEventRankings(eventId);
    const { tiers } = await getTierDistribution(eventId);

    return {
      eventName: event.name,
      totalParticipants: rankings.length,
      rankings,
      tierDistribution: tiers
    };
  } catch (error) {
    console.error('Error previewing NFT rewards:', error);
    throw error;
  }
}
