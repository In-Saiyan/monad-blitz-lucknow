/**
 * Monad Testnet Configuration
 * Centralized configuration for Monad testnet network details
 */

export const MONAD_TESTNET = {
  // Network Details
  chainId: 10143,
  chainIdHex: '0x279F',
  chainName: 'Monad Testnet',
  
  // Currency
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18
  },
  
  // RPC URLs
  rpcUrls: {
    primary: 'https://rpc.ankr.com/monad_testnet',
    backup: 'https://monad-testnet.g.alchemy.com/v2/demo'
  },
  
  // Explorer
  blockExplorerUrls: ['https://testnet.monadexplorer.com/'],
  
  // Contract Addresses (from deployment-addresses.json)
  contracts: {
    ctnft: '0xFC923f174c476c8900C634dDCB8cE2e955D9701f',
    ctnftReward: '0x18ee5C7a2e7339705Eff8f96717C1085A4B69D27'
  },
  
  // Environment Variables
  env: {
    monadUrl: process.env.MONAD_URL || 'https://rpc.ankr.com/monad_testnet',
    privateKey: process.env.PRIVATE_KEY,
    contractAddress: process.env.CTNFT_CONTRACT_ADDRESS || '0xFC923f174c476c8900C634dDCB8cE2e955D9701f',
    
    // Public variables (available in frontend)
    publicContractAddress: process.env.NEXT_PUBLIC_CTNFT_CONTRACT_ADDRESS || '0xFC923f174c476c8900C634dDCB8cE2e955D9701f',
    publicRpcUrl: process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://rpc.ankr.com/monad_testnet',
    publicExplorer: process.env.NEXT_PUBLIC_MONAD_EXPLORER || 'https://testnet.monadexplorer.com'
  }
} as const;

/**
 * Get the network configuration for wallet integration
 */
export const getWalletNetworkConfig = () => ({
  chainId: MONAD_TESTNET.chainIdHex,
  chainName: MONAD_TESTNET.chainName,
  nativeCurrency: MONAD_TESTNET.nativeCurrency,
  rpcUrls: [MONAD_TESTNET.rpcUrls.primary],
  blockExplorerUrls: MONAD_TESTNET.blockExplorerUrls
});

/**
 * Get explorer URL for a given address or transaction
 */
export const getExplorerUrl = (hash: string, type: 'address' | 'tx' | 'token' = 'address') => {
  const baseUrl = MONAD_TESTNET.env.publicExplorer;
  
  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${hash}`;
    case 'token':
      return `${baseUrl}/token/${hash}`;
    case 'address':
    default:
      return `${baseUrl}/address/${hash}`;
  }
};

/**
 * Check if the current chain ID matches Monad testnet
 */
export const isMonadTestnet = (chainId: string | number): boolean => {
  const targetChainId = typeof chainId === 'string' 
    ? parseInt(chainId, 16) 
    : chainId;
  
  return targetChainId === MONAD_TESTNET.chainId;
};

export default MONAD_TESTNET;
