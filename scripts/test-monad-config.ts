import { config } from 'dotenv';
import { initializeContract, getContractAddresses, MONAD_TESTNET_CONFIG } from '@/lib/blockchain';

// Load environment variables from .env.local
config({ path: '.env.local' });

console.log('🌐 Monad Testnet Configuration Test');
console.log('=====================================');

// Test contract address loading
const addresses = getContractAddresses();
console.log('📋 Contract Addresses:');
console.log(`  CTNFT: ${addresses.ctnft}`);
console.log(`  CTNFT Reward: ${addresses.ctnftReward}`);
console.log(`  Deployer: ${addresses.deployer}`);
console.log(`  Network: ${addresses.network}`);

// Test network configuration
console.log('\n🔗 Network Configuration:');
console.log(`  Chain ID: ${parseInt(MONAD_TESTNET_CONFIG.chainId, 16)}`);
console.log(`  Chain Name: ${MONAD_TESTNET_CONFIG.chainName}`);
console.log(`  RPC URL: ${MONAD_TESTNET_CONFIG.rpcUrls[0]}`);
console.log(`  Currency: ${MONAD_TESTNET_CONFIG.nativeCurrency.symbol}`);

// Test contract initialization
console.log('\n🏗️ Contract Initialization:');
try {
  const contract = initializeContract();
  if (contract) {
    console.log('  ✅ Contract initialized successfully');
  } else {
    console.log('  ❌ Contract initialization failed - check environment variables');
  }
} catch (error) {
  console.log(`  ❌ Error: ${error}`);
}

console.log('\n🚀 Monad testnet integration is ready!');
console.log('   Make sure to:');
console.log('   1. Add Monad testnet to your wallet');
console.log('   2. Get MON tokens from the faucet');
console.log('   3. Set your PRIVATE_KEY in .env.local');
