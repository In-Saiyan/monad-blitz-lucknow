# CTNFT - Monad Blitz Lucknow

A Web3-enabled Capture The Flag (CTF) platform that rewards participants with NFTs based on their performance, deployed on Monad testnet.

## Features

- Dynamic scoring system where challenge points decrease as more people solve them
- Live leaderboard with real-time updates
- NFT reward distribution based on final rankings on Monad testnet
- Static file-based challenges with flag format: `ctnft{s0m3_th1ng_h3r3}`
- User roles: User, Organizer, Admin

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Monad testnet with ethers.js
- **Smart Contracts**: Solidity ERC-721 NFTs

## Contract Addresses (Monad Testnet)

- **CTNFT Contract**: `0xFC923f174c476c8900C634dDCB8cE2e955D9701f`
- **CTNFT Reward Contract**: `0x18ee5C7a2e7339705Eff8f96717C1085A4B69D27`
- **Network**: Monad Testnet (Chain ID: 10143)
- **RPC URL**: `https://rpc.ankr.com/monad_testnet`

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd monad-blitz-lucknow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.sample .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```bash
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL="file:./dev.db"
   MONAD_URL=https://testnet-rpc.monad.xyz
   PRIVATE_KEY=your-private-key-without-0x-prefix
   CTNFT_CONTRACT_ADDRESS=0xFC923f174c476c8900C634dDCB8cE2e955D9701f
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## Deployment

The smart contracts are already deployed on Monad testnet. To deploy your own instance:

```bash
npm run deploy:monad
```

## Network Configuration

To add Monad testnet to your wallet:

- **Network Name**: Monad Testnet
- **RPC URL**: `https://rpc.ankr.com/monad_testnet`
- **Chain ID**: `10143`
- **Currency Symbol**: `MON`
- **Block Explorer**: `https://testnet.monadexplorer.com`
