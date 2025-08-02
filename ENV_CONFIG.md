# Environment Configuration Guide

This guide explains how to properly configure the environment variables for the CTNFT project.

## Quick Setup

1. **Copy the sample environment file:**
   ```bash
   cp env.sample .env.local
   ```

2. **Edit the `.env.local` file with your values:**
   ```bash
   nano .env.local  # or use your preferred editor
   ```

3. **Validate your configuration:**
   ```bash
   npm run validate-env
   ```

## Required Environment Variables

### NextAuth Configuration
```env
NEXTAUTH_SECRET=your_secure_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### Database Configuration
```env
DATABASE_URL="file:./dev.db"
```

### Monad Testnet Configuration
```env
# Primary RPC URL
MONAD_URL=https://rpc.ankr.com/monad_testnet

# Your wallet private key (64 hex characters, no 0x prefix)
PRIVATE_KEY=your_private_key_here_64_characters_without_0x_prefix

# Smart contract addresses (from deployment)
CTNFT_CONTRACT_ADDRESS=0xFC923f174c476c8900C634dDCB8cE2e955D9701f
CTNFT_REWARD_CONTRACT_ADDRESS=0x18ee5C7a2e7339705Eff8f96717C1085A4B69D27
```

### Frontend Public Variables
```env
# These are exposed to the browser
NEXT_PUBLIC_CTNFT_CONTRACT_ADDRESS=0xFC923f174c476c8900C634dDCB8cE2e955D9701f
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_RPC_URL=https://rpc.ankr.com/monad_testnet
NEXT_PUBLIC_MONAD_EXPLORER=https://testnet.monadexplorer.com
```

## Monad Testnet Details

| Parameter | Value |
|-----------|-------|
| **Chain ID** | 10143 (0x279F in hex) |
| **Chain Name** | Monad Testnet |
| **Currency** | MON |
| **RPC URL** | https://rpc.ankr.com/monad_testnet |
| **Explorer** | https://testnet.monadexplorer.com |

## Getting Your Private Key

### From MetaMask:
1. Open MetaMask
2. Click on the account menu (three dots)
3. Go to "Account Details"
4. Click "Export Private Key"
5. Enter your password
6. Copy the key (remove the `0x` prefix)

### ⚠️ Security Warning
- **Never commit private keys to version control**
- **Never share your private key**
- **Use test keys only for development**
- **Use environment variables or secret management in production**

## Contract Deployment

The smart contracts are already deployed on Monad testnet:

- **CTNFT Contract:** `0xFC923f174c476c8900C634dDCB8cE2e955D9701f`
- **CTNFT Reward Contract:** `0x18ee5C7a2e7339705Eff8f96717C1085A4B69D27`

You can view these contracts on the [Monad Explorer](https://testnet.monadexplorer.com).

## Validation Commands

```bash
# Validate all environment variables
npm run validate-env

# Alternative command
npm run check-config
```

## Troubleshooting

### Common Issues:

1. **Private Key Format Error:**
   - Ensure your private key is exactly 64 hexadecimal characters
   - Remove the `0x` prefix if present
   - Don't use placeholder values

2. **Contract Address Format Error:**
   - Contract addresses must start with `0x`
   - Must be exactly 42 characters total (0x + 40 hex chars)

3. **RPC URL Issues:**
   - Ensure URLs start with `http://` or `https://`
   - Test the RPC endpoint with a simple request

4. **Network Connection:**
   - Make sure you're connected to Monad testnet in MetaMask
   - Add the network if it doesn't exist

### Environment Variable Precedence:
1. `.env.local` (highest priority)
2. `.env.development` 
3. `.env` (lowest priority)

### MetaMask Network Configuration:
If you need to manually add Monad testnet to MetaMask:

```javascript
// Network configuration for MetaMask
{
  chainId: '0x279F',
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: ['https://rpc.ankr.com/monad_testnet'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com/']
}
```

## Files to Configure

- **`.env.local`** - Your local environment variables (never commit)
- **`env.sample`** - Template file (safe to commit)
- **`deployment-addresses.json`** - Contract addresses (auto-generated)

## Testing Your Configuration

After setting up your environment:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the test page:**
   Navigate to `http://localhost:3000/test-nft-system`

3. **Run the validation:**
   ```bash
   npm run validate-env
   ```

4. **Test contract interaction:**
   Use the test page to verify blockchain connectivity

## Production Considerations

For production deployment:
- Use proper secret management (AWS Secrets Manager, Azure Key Vault, etc.)
- Set `NODE_ENV=production`
- Use strong, unique secrets
- Configure proper CORS and security headers
- Use mainnet or production testnet networks

---

For more information about the CTNFT project, see the main [README.md](./README.md).
