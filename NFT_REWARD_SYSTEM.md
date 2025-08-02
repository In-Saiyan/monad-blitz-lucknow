# Performance-Based NFT Reward System

## Overview
The CTNFT platform now implements a comprehensive performance-based NFT reward system that automatically distributes NFTs to participants based on their final ranking percentiles after a contest ends.

## NFT Tier System

### Tier Structure
The system uses 5 distinct NFT tiers based on percentile performance:

| Tier | Criteria | Visual Style | Description |
|------|----------|-------------|-------------|
| 💎 **DIAMOND** | Top 1% | Blue-Purple gradient | Ultimate achievement for top performers |
| 🥈 **PLATINUM** | Top 5% | Silver gradient | Exceptional performance |
| 🥇 **GOLD** | Top 10% | Gold gradient | Excellent performance |
| 🥈 **SILVER** | Top 20% | Silver-Gray gradient | Good performance |
| 🥉 **BRONZE** | All others | Bronze gradient | Participation award |

### Calculation Logic
```typescript
// Percentile calculation: (rank / totalParticipants) * 100
if (percentile <= 1) return 'DIAMOND';     // Top 1%
if (percentile <= 5) return 'PLATINUM';    // Top 5%
if (percentile <= 10) return 'GOLD';       // Top 10%
if (percentile <= 20) return 'SILVER';     // Top 20%
else return 'BRONZE';                      // All others
```

## Features

### 🎯 Automated Reward Distribution
- **Event-End Trigger**: NFTs are distributed only after the contest officially ends
- **Wallet Requirement**: Only participants with connected wallet addresses are eligible
- **Batch Processing**: Efficient batch minting for gas optimization
- **Duplicate Prevention**: Ensures each participant receives only one NFT per event

### 📊 Comprehensive Analytics
- **Tier Distribution Preview**: See how many participants will receive each tier
- **Rankings Table**: View detailed rankings before distribution
- **Real-time Statistics**: Live updates on participant counts and score distributions

### 🔐 Organizer Controls
- **Preview Mode**: Review NFT distribution before executing
- **One-Click Distribution**: Simple interface for batch NFT minting
- **Error Handling**: Graceful handling of partial failures with detailed logging

## Implementation Details

### Backend Components

#### 1. NFT Reward Engine (`/src/lib/nft-rewards.ts`)
```typescript
// Core functions:
- calculateEventRankings() // Determines final rankings and tiers
- distributeNFTRewards()   // Executes batch NFT minting
- getTierDistribution()    // Calculates tier statistics
- previewNFTRewards()      // Preview mode for organizers
```

#### 2. API Endpoints (`/api/events/[id]/nft-rewards`)
- **GET**: Preview NFT reward distribution
- **POST**: Execute NFT distribution to all eligible participants

#### 3. Smart Contract Integration
- **Monad Testnet**: Deployed on Monad blockchain
- **Batch Minting**: Optimized for gas efficiency
- **Tier-based Metadata**: Each NFT contains performance data

### Frontend Components

#### 1. NFT Reward Distribution UI (`/components/NFTRewardDistribution.tsx`)
- **Tier Visualization**: Color-coded tier display with statistics
- **Rankings Table**: Detailed participant list with tiers
- **Distribution Controls**: One-click NFT distribution for organizers
- **Status Tracking**: Real-time feedback during distribution process

#### 2. Event Integration
- **Organizer-Only**: NFT controls only visible to event organizers
- **Event Status**: Only available after event completion
- **Seamless Integration**: Built into existing event management interface

## Workflow

### 1. Contest Completion
```
Event Ends → Final Rankings Calculated → NFT Tiers Determined
```

### 2. Organizer Review
```
Preview Distribution → Review Tier Breakdown → Verify Rankings
```

### 3. NFT Distribution
```
Execute Distribution → Batch Mint NFTs → Update Database → Confirmation
```

### 4. Participant Receipt
```
NFTs Minted → Visible in Wallet → Viewable on Explorer → Achievement Unlocked
```

## Database Schema Updates

### EventParticipant Table Extensions
```typescript
hasReceivedNFT: boolean     // Tracks NFT distribution status
nftTokenId?: string         // Stores minted NFT token ID
```

## Configuration

### Environment Variables
```bash
# Monad Testnet Configuration
MONAD_URL=https://rpc.ankr.com/monad_testnet
PRIVATE_KEY=<64-character-private-key>
CTNFT_CONTRACT_ADDRESS=0xFC923f174c476c8900C634dDCB8cE2e955D9701f
```

### Smart Contract Addresses
```json
{
  "ctnft": "0xFC923f174c476c8900C634dDCB8cE2e955D9701f",
  "ctnftReward": "0x18ee5C7a2e7339705Eff8f96717C1085A4B69D27",
  "deployer": "0xd71bBfCEbc23823dc451bA769B5a50a69b7cFB5A",
  "network": "monadTestnet"
}
```

## Security Features

### 1. Access Control
- **Organizer-Only**: Only event organizers can distribute NFTs
- **Admin Override**: Platform admins can manage any event
- **Authentication**: Session-based verification

### 2. Data Integrity
- **Event Validation**: Ensures event exists and has ended
- **Participant Verification**: Validates wallet addresses
- **Duplicate Prevention**: Prevents multiple NFTs per participant

### 3. Error Handling
- **Graceful Failures**: Partial distribution support
- **Detailed Logging**: Comprehensive error tracking
- **Rollback Safety**: Database consistency maintained

## User Experience

### For Participants
1. **Automatic Eligibility**: All participants with wallets are eligible
2. **Tier Notification**: Clear indication of achieved tier
3. **Wallet Integration**: NFTs appear automatically in MetaMask
4. **Explorer Viewing**: View NFTs on Monad testnet explorer
5. **Profile Display**: Personal NFT collection visible in user profile
6. **Dashboard Preview**: Quick NFT overview on dashboard

### For Organizers
1. **Clear Interface**: Intuitive NFT distribution controls
2. **Preview Mode**: Review before execution
3. **Real-time Feedback**: Status updates during distribution
4. **Analytics**: Detailed tier and ranking statistics

## Profile Integration

### User Profile NFT Display
- **Full Collection View**: Complete NFT gallery with detailed information
- **Tier-based Visual Design**: Color-coded NFTs based on performance tiers
- **Explorer Links**: Direct links to view NFTs on Monad testnet explorer
- **Achievement Details**: Rank, score, event name, and mint date for each NFT
- **Wallet Status**: Clear indication if wallet setup is needed

### Dashboard NFT Preview
- **Compact Display**: Shows top 3 most recent NFTs
- **Quick Overview**: At-a-glance view of user's achievements
- **Link to Full Collection**: Easy navigation to complete profile view
- **Achievement Teasers**: Encourages users to participate in more events

### Component Architecture
```typescript
<UserNFTCollection 
  userId={optional}     // For viewing other users' NFTs
  compact={boolean}     // Compact vs full display
  maxDisplay={number}   // Limit number of NFTs shown
/>
```

## Testing

### Test Configuration Script
Run the Monad testnet configuration test:
```bash
npx tsx scripts/test-monad-config.ts
```

Expected output:
```
✅ Contract initialized successfully
✅ Connecting to Monad Testnet with contract: 0xFC923f174c476c8900C634dDCB8cE2e955D9701f
```

## Future Enhancements

### Planned Features
- **Custom Tier Metadata**: Unique designs per tier
- **Achievement Badges**: Special NFTs for specific accomplishments
- **Cross-Event Collections**: Series-based NFT collections
- **Marketplace Integration**: NFT trading capabilities

### Scalability Improvements
- **IPFS Integration**: Decentralized metadata storage
- **Gas Optimization**: Further batch processing improvements
- **Layer 2 Support**: Additional blockchain networks

## Summary

The performance-based NFT reward system transforms the CTNFT platform into a comprehensive competitive gaming ecosystem where:

- 🏆 **Performance Matters**: Rankings directly determine NFT rarity
- 🎨 **Visual Hierarchy**: Clear tier distinction with attractive designs
- 🚀 **Seamless Experience**: Automated distribution with organizer control
- 🔒 **Secure & Reliable**: Robust error handling and access control
- 📊 **Data-Driven**: Comprehensive analytics and reporting

This system incentivizes competitive participation while providing tangible, blockchain-based rewards that participants can own, trade, and showcase as proof of their CTF achievements! 🎯✨
