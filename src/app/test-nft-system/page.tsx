'use client';

import { useState } from 'react';
import MetaMaskDebugger from '@/components/MetaMaskDebugger';
import MonadNetworkInfo from '@/components/MonadNetworkInfo';

export default function TestNFTSystemPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testProfileUpdate = async () => {
    try {
      const testWallet = '0x' + Math.random().toString(16).substring(2, 42);
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: testWallet })
      });

      if (response.ok) {
        addResult('✅ Profile update test passed');
      } else {
        const error = await response.text();
        addResult(`❌ Profile update failed: ${error}`);
      }
    } catch (error) {
      addResult(`❌ Profile update error: ${error}`);
    }
  };

  const testNFTEndpoint = async () => {
    try {
      const response = await fetch('/api/user/nfts');
      
      if (response.ok) {
        const nfts = await response.json();
        addResult(`✅ NFT endpoint test passed - Found ${nfts.length} NFTs`);
      } else {
        addResult(`❌ NFT endpoint failed: ${response.status}`);
      }
    } catch (error) {
      addResult(`❌ NFT endpoint error: ${error}`);
    }
  };

  const testNFTWorkflow = async () => {
    try {
      // First, get the user's events to find one to test with
      const eventsResponse = await fetch('/api/events/my-events');
      if (!eventsResponse.ok) {
        addResult('❌ Failed to fetch user events');
        return;
      }
      
      const eventsData = await eventsResponse.json();
      const organizedEvents = eventsData.events?.organized || [];
      
      if (organizedEvents.length === 0) {
        addResult('❌ No organized events found. Create an event first.');
        return;
      }
      
      const testEvent = organizedEvents[0];
      addResult(`🎯 Testing with event: ${testEvent.name}`);
      
      // Test NFT distribution preview
      const previewResponse = await fetch(`/api/events/${testEvent.id}/nft-rewards`);
      if (previewResponse.ok) {
        const previewData = await previewResponse.json();
        addResult(`✅ NFT preview successful - ${previewData.preview?.participants || 0} participants`);
      } else {
        const errorText = await previewResponse.text();
        addResult(`❌ NFT preview failed: ${errorText}`);
      }
      
      // Test NFT distribution (if event has ended)
      if (new Date() > new Date(testEvent.endTime)) {
        const distributeResponse = await fetch(`/api/events/${testEvent.id}/nft-rewards`, {
          method: 'POST'
        });
        
        if (distributeResponse.ok) {
          const distributeData = await distributeResponse.json();
          addResult(`✅ NFT distribution successful - ${distributeData.totalDistributed || 0} NFTs distributed`);
        } else {
          const errorText = await distributeResponse.text();
          addResult(`❌ NFT distribution failed: ${errorText}`);
        }
      } else {
        addResult(`ℹ️ Event hasn't ended yet, cannot distribute NFTs`);
      }
      
    } catch (error) {
      addResult(`❌ NFT workflow error: ${error}`);
    }
  };

  const testEventEndAndDistribute = async () => {
    try {
      // Get active events
      const eventsResponse = await fetch('/api/events/my-events');
      if (!eventsResponse.ok) {
        addResult('❌ Failed to fetch user events');
        return;
      }
      
      const eventsData = await eventsResponse.json();
      const organizedEvents = eventsData.events?.organized || [];
      const activeEvent = organizedEvents.find((e: any) => e.isActive);
      
      if (!activeEvent) {
        addResult('❌ No active organized events found to test with');
        return;
      }
      
      addResult(`🎯 Testing event end and NFT distribution with: ${activeEvent.name}`);
      
      // End the event
      const endResponse = await fetch(`/api/events/${activeEvent.id}/end`, {
        method: 'POST'
      });
      
      if (endResponse.ok) {
        addResult(`✅ Event ended successfully`);
        
        // Wait a moment then try to distribute NFTs
        setTimeout(async () => {
          const distributeResponse = await fetch(`/api/events/${activeEvent.id}/nft-rewards`, {
            method: 'POST'
          });
          
          if (distributeResponse.ok) {
            const distributeData = await distributeResponse.json();
            addResult(`✅ NFT distribution successful - ${distributeData.totalDistributed || 0} NFTs distributed`);
          } else {
            const errorText = await distributeResponse.text();
            addResult(`❌ NFT distribution failed: ${errorText}`);
          }
        }, 1000);
        
      } else {
        const errorText = await endResponse.text();
        addResult(`❌ Failed to end event: ${errorText}`);
      }
      
    } catch (error) {
      addResult(`❌ Event end test error: ${error}`);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    addResult('🚀 Starting NFT system tests...');
    
    await testProfileUpdate();
    await testNFTEndpoint();
    await testNFTWorkflow();
    
    addResult('🏁 All tests completed');
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">NFT System Test Suite</h1>
      
      <div className="mb-6 space-y-2">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mr-2"
        >
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        <button
          onClick={testNFTWorkflow}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 mr-2"
        >
          Test NFT Workflow
        </button>
        
        <button
          onClick={testEventEndAndDistribute}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          End Event & Distribute NFTs
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        
        {testResults.length === 0 ? (
          <p className="text-gray-500">No tests run yet</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm font-mono ${
                  result.includes('✅') ? 'bg-green-100 text-green-800' :
                  result.includes('❌') ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">System Status</h3>
        <ul className="space-y-1 text-sm">
          <li>🎯 <strong>NFT Tier System:</strong> DIAMOND/PLATINUM/GOLD/SILVER/BRONZE</li>
          <li>🏆 <strong>Performance Tiers:</strong> 1%/5%/10%/20%/Rest</li>
          <li>🔗 <strong>Blockchain:</strong> Monad Testnet</li>
          <li>📍 <strong>Contract:</strong> 0xFC923f174c476c8900C634dDCB8cE2e955D9701f</li>
          <li>🌐 <strong>RPC:</strong> https://rpc.ankr.com/monad_testnet</li>
          <li>🔍 <strong>Explorer:</strong> https://testnet.monadexplorer.com/</li>
        </ul>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonadNetworkInfo />
        <MetaMaskDebugger />
      </div>
    </div>
  );
}
