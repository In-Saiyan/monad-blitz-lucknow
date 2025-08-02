// Quick NFT Test Script
// Run this in your browser console on any page of your app

console.log('🎯 Starting NFT System Test...');

// Test 1: Check your profile
fetch('/api/user/profile')
  .then(res => res.json())
  .then(data => {
    console.log('👤 Profile Data:', data);
    if (!data.user?.walletAddress) {
      console.warn('⚠️ No wallet address set! Go to /profile to set one.');
    } else {
      console.log('✅ Wallet address found:', data.user.walletAddress);
    }
  })
  .catch(err => console.error('❌ Profile test failed:', err));

// Test 2: Check NFTs
fetch('/api/user/nfts')
  .then(res => res.json())
  .then(data => {
    console.log('🎨 NFT Data:', data);
    if (data.success) {
      const nfts = data.data?.nftsEarned || [];
      console.log(`📊 NFT Summary: ${nfts.length} total NFTs`);
      
      nfts.forEach((nft, index) => {
        console.log(`  ${index + 1}. ${nft.tier} NFT - Rank #${nft.rank} - ${nft.eventName}`);
      });
      
      if (data.data?.databaseNFTs !== undefined) {
        console.log(`💾 Database NFTs: ${data.data.databaseNFTs}`);
      }
      
      if (data.data?.blockchainConnected === false) {
        console.log('🔗 Blockchain not connected - showing database/demo NFTs');
      }
    } else {
      console.error('❌ NFT fetch failed:', data.error);
    }
  })
  .catch(err => console.error('❌ NFT test failed:', err));

// Test 3: Check debug info
fetch('/api/debug/nfts')
  .then(res => res.json())
  .then(data => {
    console.log('🔍 Debug Data:', data);
    if (data.success) {
      const debug = data.data;
      console.log(`📈 Database Summary:`);
      console.log(`  - Total NFTs in system: ${debug.totalNFTsInDatabase}`);
      console.log(`  - Your NFT records: ${debug.userNFTRecords?.length || 0}`);
      console.log(`  - Your participations: ${debug.userParticipations?.length || 0}`);
      console.log(`  - Your solves: ${debug.userSolves?.length || 0}`);
    }
  })
  .catch(err => console.error('❌ Debug test failed:', err));

// Test 4: Check wallet connection
if (typeof window.ethereum !== 'undefined') {
  window.ethereum.request({ method: 'eth_accounts' })
    .then(accounts => {
      console.log('🦊 MetaMask accounts:', accounts);
      if (accounts.length === 0) {
        console.warn('⚠️ No MetaMask accounts connected. Connect your wallet!');
      }
      
      return window.ethereum.request({ method: 'eth_chainId' });
    })
    .then(chainId => {
      const chainDecimal = parseInt(chainId, 16);
      console.log(`🌐 Current network: Chain ID ${chainDecimal}`);
      if (chainDecimal === 10143) {
        console.log('✅ Connected to Monad testnet!');
      } else {
        console.warn('⚠️ Not on Monad testnet. Use MonadNetworkInfo component to switch.');
      }
    })
    .catch(err => console.error('❌ Wallet test failed:', err));
} else {
  console.warn('⚠️ MetaMask not detected. Install MetaMask to connect wallet.');
}

console.log('🏁 NFT tests completed. Check results above.');
console.log('💡 Tip: Visit /nft-debug for detailed debugging interface.');
