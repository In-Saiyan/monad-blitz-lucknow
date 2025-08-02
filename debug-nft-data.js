require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugNFTDistribution() {
  try {
    console.log('🔍 Debugging NFT Distribution Data...\n');

    // Get recent events
    const events = await prisma.cTFEvent.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    for (const event of events) {
      console.log(`\n📊 Event: ${event.name} (${event.id})`);
      console.log(`   Active: ${event.isActive}`);
      console.log(`   Participants: ${event.participants.length}`);
      
      if (event.participants.length > 0) {
        console.log('   Participant Scores:');
        
        for (const participant of event.participants) {
          const score = participant.totalScore;
          const isValidScore = Number.isFinite(score);
          const hasWallet = !!participant.user.walletAddress;
          
          console.log(`     - ${participant.user.username}: score=${score} (valid=${isValidScore}, hasWallet=${hasWallet})`);
          
          if (!isValidScore) {
            console.error(`       ❌ INVALID SCORE DETECTED!`);
          }
        }
        
        // Check for participants with wallet addresses
        const withWallets = event.participants.filter(p => p.user.walletAddress);
        console.log(`   Participants with wallets: ${withWallets.length}`);
        
        if (withWallets.length > 0) {
          const scores = withWallets.map(p => p.totalScore);
          const invalidScores = scores.filter(s => !Number.isFinite(s));
          
          if (invalidScores.length > 0) {
            console.error(`   ❌ Found ${invalidScores.length} invalid scores: ${invalidScores}`);
          } else {
            console.log(`   ✅ All scores are valid numbers`);
          }
        }
      }
    }

    // Check for any participants with problematic scores across all events
    console.log('\n🔍 Checking for problematic scores across all events...');
    
    const allParticipants = await prisma.eventParticipant.findMany({
      include: {
        user: {
          select: {
            username: true,
            walletAddress: true
          }
        },
        event: {
          select: {
            name: true
          }
        }
      }
    });

    let issueCount = 0;
    for (const participant of allParticipants) {
      const score = participant.totalScore;
      if (!Number.isFinite(score)) {
        console.error(`❌ Found invalid score: ${participant.user.username} in ${participant.event.name} has score: ${score}`);
        issueCount++;
      }
    }

    if (issueCount === 0) {
      console.log('✅ No invalid scores found in database');
    } else {
      console.error(`❌ Found ${issueCount} participants with invalid scores`);
    }

  } catch (error) {
    console.error('Error debugging NFT distribution:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugNFTDistribution();
