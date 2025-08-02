'use client';

import { useState } from 'react';

export default function MetaMaskDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const gatherDebugInfo = async () => {
    setLoading(true);
    const info: any = {
      timestamp: new Date().toISOString(),
      ethereum: typeof window.ethereum !== 'undefined',
      isMetaMask: window.ethereum?.isMetaMask,
      accounts: null,
      chainId: null,
      networkVersion: null,
      selectedAddress: null,
      errors: []
    };

    try {
      if (typeof window.ethereum !== 'undefined') {
        // Get accounts
        try {
          info.accounts = await window.ethereum.request({ method: 'eth_accounts' });
        } catch (error) {
          info.errors.push(`eth_accounts error: ${error}`);
        }

        // Get chain ID
        try {
          info.chainId = await window.ethereum.request({ method: 'eth_chainId' });
          info.chainIdDecimal = parseInt(info.chainId, 16);
        } catch (error) {
          info.errors.push(`eth_chainId error: ${error}`);
        }

        // Get network version
        try {
          info.networkVersion = await window.ethereum.request({ method: 'net_version' });
        } catch (error) {
          info.errors.push(`net_version error: ${error}`);
        }

        // Get selected address
        info.selectedAddress = window.ethereum.selectedAddress;
      }
    } catch (error) {
      info.errors.push(`General error: ${error}`);
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const requestAccounts = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts:', accounts);
      await gatherDebugInfo();
    } catch (error) {
      console.error('Error requesting accounts:', error);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">MetaMask Debugger</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={gatherDebugInfo}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mr-2"
        >
          {loading ? 'Gathering Info...' : 'Check MetaMask Status'}
        </button>
        <button
          onClick={requestAccounts}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Request Accounts
        </button>
      </div>

      {debugInfo && (
        <div className="bg-white p-4 rounded border">
          <h4 className="font-medium mb-2">Debug Information</h4>
          <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-2 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
