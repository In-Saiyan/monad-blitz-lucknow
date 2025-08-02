import { initializeContract } from './blockchain';
import { determineNFTTier } from './scoring';
import { prisma } from './prisma';
import { NFTTier } from '@/types';
import { storeEventMapping, getContractEventId, clearEventMappings } from './event-mapping';

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
      
      // Validate totalScore
      const totalScore = Number(participant.totalScore);
      if (!Number.isFinite(totalScore)) {
        console.error(`Invalid totalScore for participant ${participant.user.username}: ${participant.totalScore}`);
        throw new Error(`Participant ${participant.user.username} has invalid total score: ${participant.totalScore}`);
      }
      
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
        totalScore: Math.max(0, Math.floor(totalScore)), // Ensure non-negative integer
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
    console.log('Initializing blockchain contract...');
    const contract = initializeContract();
    if (!contract) {
      const errorMsg = 'Failed to initialize blockchain contract. Check environment variables: CTNFT_REWARD_CONTRACT_ADDRESS, MONAD_URL, PRIVATE_KEY';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    console.log('Blockchain contract initialized successfully');

    // Create event in the contract and get the contract event ID
    let contractEventId: number;
    
    // Clear previous mappings for testing (remove in production)
    clearEventMappings();
    
    // Check if we already have a mapping for this event
    const existingContractEventId = getContractEventId(eventId);
    if (existingContractEventId !== null) {
      contractEventId = existingContractEventId;
      console.log(`Using existing contract event ID: ${contractEventId}`);
    } else {
      // Create new event in the contract
      try {
        console.log(`Creating event "${event.name}" in the contract...`);
        console.log(`Event details:`, {
          name: event.name,
          startTime: event.startTime,
          endTime: event.endTime
        });
        
        contractEventId = await contract.createEvent(event.name, event.startTime, event.endTime);
        console.log(`✅ Event created in contract with ID: ${contractEventId}`);
        
        // Store the mapping for future use
        storeEventMapping(eventId, contractEventId);
      } catch (eventCreationError: any) {
        console.error('❌ Event creation failed:', eventCreationError);
        
        // Don't use fallback - this should be fixed properly
        throw new Error(`Failed to create event in contract: ${eventCreationError.message}`);
      }
    }

    console.log(`Distributing NFTs to ${rankings.length} participants for event ${eventId} (contract ID: ${contractEventId})`);

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

        // Validate all data before sending to contract
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}:`, {
          recipients: recipients.length,
          ranks,
          scores,
          contractEventId
        });

        // Check for NaN or invalid values
        const invalidScores = scores.filter(score => !Number.isFinite(score));
        const invalidRanks = ranks.filter(rank => !Number.isFinite(rank));
        
        if (invalidScores.length > 0) {
          throw new Error(`Invalid scores found: ${invalidScores} - these are not finite numbers`);
        }
        
        if (invalidRanks.length > 0) {
          throw new Error(`Invalid ranks found: ${invalidRanks} - these are not finite numbers`);
        }

        // Ensure all scores and ranks are integers
        const safeScores = scores.map(score => Math.floor(Number(score)));
        const safeRanks = ranks.map(rank => Math.floor(Number(rank)));

        console.log(`Calling contract.batchMintRewards with:`, {
          recipients,
          eventId: contractEventId,
          ranks: safeRanks,
          scores: safeScores,
          totalParticipants: rankings.length
        });

        // Validate totalParticipants
        if (!Number.isFinite(rankings.length) || rankings.length <= 0) {
          throw new Error(`Invalid totalParticipants: ${rankings.length}`);
        }

        // Batch mint NFTs using the contract event ID
        await contract.batchMintRewards(
          recipients,
          contractEventId,
          safeRanks,
          safeScores,
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
              nftTokenId: `${contractEventId}-${participant.rank}` // Temporary token ID format
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
