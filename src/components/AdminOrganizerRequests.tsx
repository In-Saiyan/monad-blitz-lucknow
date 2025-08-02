'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface OrganizerRequest {
  id: string;
  subject: string;
  body: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  user: {
    id: string;
    username: string;
    email: string;
    walletAddress?: string;
    createdAt: string;
  };
  reviewer?: {
    username: string;
    email: string;
  };
}

export default function AdminOrganizerRequests() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<OrganizerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/admin/organizer-requests?status=${statusFilter}`);
      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
      } else {
        setError(result.error || 'Failed to fetch requests');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingId(requestId);
    try {
      const response = await fetch('/api/admin/organizer-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, action }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the requests list
        fetchRequests();
      } else {
        setError(result.error || `Failed to ${action} request`);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user?.role === 'ADMIN') {
      fetchRequests();
    }
  }, [statusFilter, session, status]);

  if (status === 'loading') {
    return (
      <div className="text-gray-300">Loading requests...</div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Admin access required</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Organizer Requests</h2>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No {statusFilter.toLowerCase()} requests found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{request.subject}</h3>
                  <p className="text-sm text-gray-500">
                    Submitted on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">User Information</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>Username:</strong> {request.user.username}</li>
                    <li><strong>Email:</strong> {request.user.email}</li>
                    <li><strong>Wallet:</strong> {request.user.walletAddress || 'Not set'}</li>
                    <li><strong>Member since:</strong> {new Date(request.user.createdAt).toLocaleDateString()}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Request Details</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                    {request.body}
                  </div>
                </div>
              </div>

              {request.status === 'PENDING' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleAction(request.id, 'approve')}
                    disabled={processingId === request.id}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {processingId === request.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(request.id, 'reject')}
                    disabled={processingId === request.id}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {processingId === request.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              )}

              {request.status !== 'PENDING' && request.reviewer && (
                <div className="text-sm text-gray-500">
                  {request.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {request.reviewer.username} 
                  {request.reviewedAt && ` on ${new Date(request.reviewedAt).toLocaleDateString()}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
