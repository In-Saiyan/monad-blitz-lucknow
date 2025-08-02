<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# CTNFT Project Instructions

This is a Web3-enabled Capture The Flag (CTF) platform called CTNFT that rewards participants with NFTs based on their performance.

## Project Structure
- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - React components for UI
- `/src/lib` - Utility functions and configurations
- `/src/types` - TypeScript type definitions
- `/contracts` - Solidity smart contracts
- `/prisma` - Database schema and migrations

## Key Features
- Dynamic scoring system where challenge points decrease as more people solve them
- Live leaderboard with real-time updates
- NFT reward distribution based on final rankings
- Static file-based challenges with flag format: `ctnft{s0m3_th1ng_h3r3}`
- User roles: User, Organizer, Admin

## Technology Stack
- Frontend: Next.js 15 with TypeScript and Tailwind CSS
- Backend: Next.js API routes
- Database: PostgreSQL with Prisma ORM
- Blockchain: Monad testnet with ethers.js
- Smart Contracts: Solidity ERC-721 NFTs

## Coding Guidelines
- Use TypeScript for all code
- Implement proper error handling for blockchain interactions
- Follow the dynamic scoring formula: `points = max(min_points, initial_points - (decay_factor * solves))`
- Use proper authentication and authorization for different user roles
- Implement real-time updates for the leaderboard using WebSockets or Server-Sent Events
- Follow security best practices for CTF challenges and blockchain integration
