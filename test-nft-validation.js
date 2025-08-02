require('dotenv').config({ path: '.env.local' });

// Mock the NFT distribution data to test the validation
function testNFTDistributionData() {
  console.log('🧪 Testing NFT Distribution Data Validation...\n');
  
  // Sample test data similar to what we get from the database
  const testBatch = [
    {
      userId: 'user1',
      username: 'testuser1',
      walletAddress: '0x1234567890123456789012345678901234567890',
      totalScore: 100,
      rank: 1,
      tier: 'DIAMOND'
    },
    {
      userId: 'user2',
      username: 'testuser2',
      walletAddress: '0x0987654321098765432109876543210987654321',
      totalScore: 75,
      rank: 2,
      tier: 'GOLD'
    }
  ];

  const eventId = 'cmdu9qipa0007iwicu9tlyeap'; // From our debug output
  
  console.log('📊 Test Batch Data:');
  testBatch.forEach(p => {
    console.log(`  - ${p.username}: score=${p.totalScore}, rank=${p.rank}, tier=${p.tier}`);
  });
  
  // Test the data processing logic
  console.log('\n🔍 Testing Data Processing:');
  
  try {
    // Prepare batch data (same logic as in nft-rewards.ts)
    const recipients = testBatch.map(p => p.walletAddress);
    const ranks = testBatch.map(p => p.rank);
    const scores = testBatch.map(p => p.totalScore);

    console.log('Recipients:', recipients);
    console.log('Ranks:', ranks);
    console.log('Scores:', scores);

    // Check for NaN or invalid values
    const invalidScores = scores.filter(score => !Number.isFinite(score));
    const invalidRanks = ranks.filter(rank => !Number.isFinite(rank));
    
    if (invalidScores.length > 0) {
      throw new Error(`Invalid scores found: ${invalidScores}`);
    }
    
    if (invalidRanks.length > 0) {
      throw new Error(`Invalid ranks found: ${invalidRanks}`);
    }

    // Ensure all scores and ranks are integers
    const safeScores = scores.map(score => Math.floor(Number(score)));
    const safeRanks = ranks.map(rank => Math.floor(Number(rank)));

    // Convert event ID to number - use a stable hash of the event ID
    let eventIdNumber = 0;
    for (let i = 0; i < eventId.length; i++) {
      eventIdNumber = (eventIdNumber * 31 + eventId.charCodeAt(i)) % 1000000;
    }
    
    // Ensure it's positive and within a reasonable range
    eventIdNumber = Math.abs(eventIdNumber) + 1; // Ensure it's never 0
    
    console.log('✅ Data validation passed!');
    console.log('Safe Scores:', safeScores);
    console.log('Safe Ranks:', safeRanks);
    console.log('Event ID Number:', eventIdNumber);
    console.log('Total Participants:', testBatch.length);

    // Test contract parameter validation (same as blockchain.ts)
    const safeEventId = Math.floor(Number(eventIdNumber));
    const safeTotalParticipants = Math.floor(Number(testBatch.length));

    if (!Number.isFinite(safeEventId) || safeEventId <= 0) {
      throw new Error(`Invalid eventId: ${eventIdNumber} -> ${safeEventId}`);
    }
    
    if (!Number.isFinite(safeTotalParticipants) || safeTotalParticipants <= 0) {
      throw new Error(`Invalid totalParticipants: ${testBatch.length} -> ${safeTotalParticipants}`);
    }

    const invalidRanksCheck = safeRanks.filter(rank => !Number.isFinite(rank) || rank <= 0);
    if (invalidRanksCheck.length > 0) {
      throw new Error(`Invalid ranks found: ${invalidRanksCheck}`);
    }

    const invalidScoresCheck = safeScores.filter(score => !Number.isFinite(score) || score < 0);
    if (invalidScoresCheck.length > 0) {
      throw new Error(`Invalid scores found: ${invalidScoresCheck}`);
    }

    console.log('✅ Contract parameter validation passed!');
    console.log('\n📋 Final Contract Parameters:');
    console.log('  Recipients:', recipients.length, 'addresses');
    console.log('  Event ID:', safeEventId);
    console.log('  Ranks:', safeRanks);
    console.log('  Scores:', safeScores);
    console.log('  Total Participants:', safeTotalParticipants);
    
    console.log('\n🎉 All validations passed! NFT distribution should work correctly.');

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  }
}

// Test with edge cases
function testEdgeCases() {
  console.log('\n🧪 Testing Edge Cases...\n');
  
  const edgeCases = [
    { name: 'Zero score', totalScore: 0, rank: 1 },
    { name: 'Large score', totalScore: 999999, rank: 1 },
    { name: 'Decimal score', totalScore: 85.75, rank: 1 },
    { name: 'String score', totalScore: '100', rank: 1 },
  ];
  
  edgeCases.forEach(testCase => {
    console.log(`Testing: ${testCase.name}`);
    try {
      const score = Number(testCase.totalScore);
      const rank = Number(testCase.rank);
      
      if (!Number.isFinite(score)) {
        throw new Error(`Invalid score: ${testCase.totalScore}`);
      }
      
      if (!Number.isFinite(rank)) {
        throw new Error(`Invalid rank: ${testCase.rank}`);
      }
      
      const safeScore = Math.floor(Number(score));
      const safeRank = Math.floor(Number(rank));
      
      console.log(`  ✅ ${testCase.totalScore} -> ${safeScore}, rank: ${testCase.rank} -> ${safeRank}`);
      
    } catch (error) {
      console.log(`  ❌ ${error.message}`);
    }
  });
}

testNFTDistributionData();
testEdgeCases();
