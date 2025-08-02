'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ApiResponse } from '@/types';
import { FaCheckCircle } from 'react-icons/fa';

interface OrganizerRequestFormProps {
  onSuccess: () => void;
}

export default function OrganizerRequestForm({ onSuccess }: OrganizerRequestFormProps) {
  const { data: session } = useSession();
  const [subject, setSubject] = useState('Request for Organizer Access');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/organizer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });

      const result: ApiResponse<any> = await response.json();

      if (result.success) {
        setFormSubmitted(true);
        onSuccess();
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (formSubmitted) {
    return (
      <div className="text-center p-8 bg-background/70 rounded-lg border border-green-500/30">
        <FaCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-300">Request Submitted!</h3>
        <p className="text-muted-foreground mt-2">Your request has been sent to the administrators for review. You will be notified of the outcome.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-sm">
        <p className="font-bold text-primary mb-2">Your information that will be sent:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li><span className="font-semibold text-foreground">Username:</span> {session?.user?.username || 'N/A'}</li>
          <li><span className="font-semibold text-foreground">Email:</span> {session?.user?.email}</li>
        </ul>
      </div>
      
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-muted-foreground mb-2">Subject *</label>
        <input 
          type="text" 
          id="subject" 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2.5 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-inner shadow-primary/5"
          required 
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-muted-foreground mb-2">Message *</label>
        <textarea 
          id="body" 
          rows={5} 
          value={body} 
          onChange={(e) => setBody(e.target.value)}
          placeholder="Please explain why you would like organizer access and your experience with CTF events."
          className="w-full px-4 py-2.5 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-inner shadow-primary/5"
          required
        ></textarea>
      </div>

      {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={loading || !subject || !body}
          className="inline-flex items-center justify-center px-6 py-2.5 font-semibold text-background bg-gradient-to-r from-primary to-accent rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}
