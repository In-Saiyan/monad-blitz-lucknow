#!/usr/bin/env node

/**
 * Environment Configuration Validator
 * Validates that all required environment variables are properly set
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface ValidationResult {
  valid: boolean;
  variable: string;
  value?: string;
  error?: string;
}

const requiredVariables = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
  'MONAD_URL',
  'PRIVATE_KEY',
  'CTNFT_CONTRACT_ADDRESS',
  'NEXT_PUBLIC_CTNFT_CONTRACT_ADDRESS'
];

const optionalVariables = [
  'MONAD_RPC_BACKUP',
  'CTNFT_REWARD_CONTRACT_ADDRESS',
  'NEXT_PUBLIC_MONAD_CHAIN_ID',
  'NEXT_PUBLIC_MONAD_RPC_URL',
  'NEXT_PUBLIC_MONAD_EXPLORER'
];

function validateEnvironmentVariable(variable: string, required: boolean = true): ValidationResult {
  const value = process.env[variable];
  
  if (!value) {
    return {
      valid: !required,
      variable,
      error: required ? 'Missing required variable' : 'Optional variable not set'
    };
  }

  // Specific validations
  switch (variable) {
    case 'PRIVATE_KEY':
      if (value === 'your_private_key_here_64_characters_without_0x_prefix') {
        return {
          valid: false,
          variable,
          value: '[PLACEHOLDER]',
          error: 'Private key is still using placeholder value'
        };
      }
      if (value.length !== 64 || !/^[a-fA-F0-9]{64}$/.test(value)) {
        return {
          valid: false,
          variable,
          value: '[INVALID]',
          error: 'Private key must be 64 hexadecimal characters without 0x prefix'
        };
      }
      break;
      
    case 'CTNFT_CONTRACT_ADDRESS':
    case 'NEXT_PUBLIC_CTNFT_CONTRACT_ADDRESS':
    case 'CTNFT_REWARD_CONTRACT_ADDRESS':
      if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
        return {
          valid: false,
          variable,
          value,
          error: 'Contract address must be a valid Ethereum address (0x followed by 40 hex characters)'
        };
      }
      break;
      
    case 'MONAD_URL':
    case 'NEXT_PUBLIC_MONAD_RPC_URL':
    case 'MONAD_RPC_BACKUP':
      if (!value.startsWith('http')) {
        return {
          valid: false,
          variable,
          value,
          error: 'RPC URL must start with http or https'
        };
      }
      break;
      
    case 'NEXTAUTH_SECRET':
      if (value === 'development-secret-key-replace-in-production' && process.env.NODE_ENV === 'production') {
        return {
          valid: false,
          variable,
          value: '[DEVELOPMENT]',
          error: 'Using development secret in production environment'
        };
      }
      break;
  }

  return {
    valid: true,
    variable,
    value: variable.includes('PRIVATE_KEY') ? '[HIDDEN]' : value
  };
}

function validateDeploymentAddresses(): ValidationResult {
  try {
    const deploymentPath = join(process.cwd(), 'deployment-addresses.json');
    const deployment = JSON.parse(readFileSync(deploymentPath, 'utf8'));
    
    if (!deployment.ctnft || !deployment.ctnftReward) {
      return {
        valid: false,
        variable: 'deployment-addresses.json',
        error: 'Missing contract addresses in deployment file'
      };
    }
    
    const envContract = process.env.CTNFT_CONTRACT_ADDRESS;
    if (envContract && envContract !== deployment.ctnft) {
      return {
        valid: false,
        variable: 'CTNFT_CONTRACT_ADDRESS',
        error: `Environment contract address (${envContract}) doesn't match deployment file (${deployment.ctnft})`
      };
    }
    
    return {
      valid: true,
      variable: 'deployment-addresses.json',
      value: 'Contract addresses validated'
    };
  } catch (error) {
    return {
      valid: false,
      variable: 'deployment-addresses.json',
      error: `Failed to read or parse deployment file: ${error}`
    };
  }
}

function main() {
  console.log('🔍 Validating CTNFT Environment Configuration...\n');
  
  const results: ValidationResult[] = [];
  
  // Validate required variables
  console.log('📋 Required Variables:');
  for (const variable of requiredVariables) {
    const result = validateEnvironmentVariable(variable, true);
    results.push(result);
    
    const status = result.valid ? '✅' : '❌';
    const display = result.value || '[NOT SET]';
    console.log(`  ${status} ${variable}: ${display}`);
    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }
  }
  
  console.log('\n📋 Optional Variables:');
  for (const variable of optionalVariables) {
    const result = validateEnvironmentVariable(variable, false);
    results.push(result);
    
    const status = result.valid ? '✅' : '⚠️';
    const display = result.value || '[NOT SET]';
    console.log(`  ${status} ${variable}: ${display}`);
    if (result.error && !result.error.includes('Optional')) {
      console.log(`     Warning: ${result.error}`);
    }
  }
  
  // Validate deployment addresses
  console.log('\n📋 Contract Deployment:');
  const deploymentResult = validateDeploymentAddresses();
  results.push(deploymentResult);
  
  const deploymentStatus = deploymentResult.valid ? '✅' : '❌';
  console.log(`  ${deploymentStatus} ${deploymentResult.variable}: ${deploymentResult.value || '[ERROR]'}`);
  if (deploymentResult.error) {
    console.log(`     Error: ${deploymentResult.error}`);
  }
  
  // Summary
  const totalCount = results.length;
  const validCount = results.filter(r => r.valid).length;
  const criticalErrors = results.filter(r => !r.valid && requiredVariables.includes(r.variable)).length;
  
  console.log('\n📊 Summary:');
  console.log(`  Total variables checked: ${totalCount}`);
  console.log(`  Valid configurations: ${validCount}`);
  console.log(`  Critical errors: ${criticalErrors}`);
  
  if (criticalErrors > 0) {
    console.log('\n❌ Configuration validation failed! Please fix the critical errors above.');
    process.exit(1);
  } else if (validCount === totalCount) {
    console.log('\n✅ All configurations are valid! Ready to run CTNFT.');
  } else {
    console.log('\n⚠️  Configuration has warnings but is functional.');
  }
}

// Run validation if called directly
if (require.main === module) {
  main();
}

export { validateEnvironmentVariable, validateDeploymentAddresses };
