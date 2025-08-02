'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Challenge {
  id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  flag: string;
  initialPoints: number;
  minPoints: number;
  decayFactor: number;
  file?: File | null;
  fileUrl?: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  organizer: {
    username: string;
    email: string;
  };
}

export default function ChallengeManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  const eventId = params?.id as string;

  // Initial challenge form data
  const initialChallengeData: Challenge = {
    title: '',
    description: '',
    category: 'Web',
    difficulty: 'Easy',
    flag: '',
    initialPoints: 100,
    minPoints: 50,
    decayFactor: 10,
    file: null,
  };

  const [challengeForm, setChallengeForm] = useState<Challenge>(initialChallengeData);

  useEffect(() => {
    if (eventId && session) {
      fetchEventAndChallenges();
    }
  }, [eventId, session]);

  const fetchEventAndChallenges = async () => {
    try {
      // Fetch event details
      const eventResponse = await fetch(`/api/events/${eventId}`);
      if (!eventResponse.ok) {
        throw new Error('Failed to fetch event');
      }
      const eventData = await eventResponse.json();
      setEvent(eventData);

      // Check if user is the organizer
      if (session?.user?.email !== eventData.organizer?.email) {
        setError('You are not authorized to manage challenges for this event');
        return;
      }

      // Fetch challenges
      const challengesResponse = await fetch(`/api/events/${eventId}/challenges`);
      if (challengesResponse.ok) {
        const challengesData = await challengesResponse.json();
        setChallenges(challengesData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load event or challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Challenge, value: any) => {
    setChallengeForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setChallengeForm(prev => ({
      ...prev,
      file
    }));
  };

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challengeForm.title || !challengeForm.description || !challengeForm.flag) {
      alert('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', challengeForm.title);
    formData.append('description', challengeForm.description);
    formData.append('category', challengeForm.category);
    formData.append('difficulty', challengeForm.difficulty);
    formData.append('flag', challengeForm.flag);
    formData.append('initialPoints', challengeForm.initialPoints.toString());
    formData.append('minPoints', challengeForm.minPoints.toString());
    formData.append('decayFactor', challengeForm.decayFactor.toString());
    
    if (challengeForm.file) {
      formData.append('file', challengeForm.file);
    }

    try {
      const url = editingChallenge 
        ? `/api/events/${eventId}/challenges/${editingChallenge.id}`
        : `/api/events/${eventId}/challenges`;
      
      const method = editingChallenge ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        alert(editingChallenge ? 'Challenge updated successfully!' : 'Challenge created successfully!');
        setChallengeForm(initialChallengeData);
        setShowCreateForm(false);
        setEditingChallenge(null);
        fetchEventAndChallenges(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to save challenge');
      }
    } catch (err) {
      console.error('Error saving challenge:', err);
      alert('An error occurred while saving the challenge');
    }
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setChallengeForm({ ...challenge, file: null });
    setEditingChallenge(challenge);
    setShowCreateForm(true);
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/challenges/${challengeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Challenge deleted successfully!');
        fetchEventAndChallenges(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete challenge');
      }
    } catch (err) {
      console.error('Error deleting challenge:', err);
      alert('An error occurred while deleting the challenge');
    }
  };

  const resetForm = () => {
    setChallengeForm(initialChallengeData);
    setEditingChallenge(null);
    setShowCreateForm(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-white text-xl">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-white text-xl mb-4">{error || 'Event not found'}</div>
            <Link href="/events" className="text-blue-400 hover:text-blue-300 font-medium">
              ← Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Back to Event
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Manage Challenges
              </h1>
              <p className="text-gray-400">Event: {event.name}</p>
            </div>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                + Add New Challenge
              </button>
            )}
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitChallenge} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Challenge Title *
                  </label>
                  <input
                    type="text"
                    value={challengeForm.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter challenge title"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={challengeForm.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Web">Web</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Pwn">Pwn</option>
                    <option value="Reverse">Reverse</option>
                    <option value="Forensics">Forensics</option>
                    <option value="Misc">Misc</option>
                    <option value="OSINT">OSINT</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={challengeForm.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value as 'Easy' | 'Medium' | 'Hard')}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* Flag */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Flag *
                  </label>
                  <input
                    type="text"
                    value={challengeForm.flag}
                    onChange={(e) => handleInputChange('flag', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ctnft{example_flag_here}"
                    required
                  />
                </div>

                {/* Points Configuration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Initial Points
                  </label>
                  <input
                    type="number"
                    value={challengeForm.initialPoints}
                    onChange={(e) => handleInputChange('initialPoints', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Points
                  </label>
                  <input
                    type="number"
                    value={challengeForm.minPoints}
                    onChange={(e) => handleInputChange('minPoints', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Decay Factor
                  </label>
                  <input
                    type="number"
                    value={challengeForm.decayFactor}
                    onChange={(e) => handleInputChange('decayFactor', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Attachment (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".zip,.txt,.pdf,.jpg,.jpeg,.png,.gif,.html,.css,.js,.json"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Max 10MB. Allowed: ZIP, TXT, PDF, Images, HTML, CSS, JS, JSON
                  </p>
                  {challengeForm.fileUrl && (
                    <p className="text-sm text-gray-400 mt-1">
                      Current file: <a href={challengeForm.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">View File</a>
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={challengeForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the challenge. You can include links like https://example.com"
                  required
                />
                <p className="text-sm text-gray-400 mt-1">
                  Tip: You can include links in the description. They will be automatically clickable.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Challenges List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-6">
            Existing Challenges ({challenges.length})
          </h2>

          {challenges.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🧩</div>
              <h3 className="text-lg font-medium text-white mb-2">No Challenges Yet</h3>
              <p className="text-gray-400 mb-4">Create your first challenge to get started!</p>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Create First Challenge
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{challenge.title}</h3>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                          {challenge.category}
                        </span>
                        <span className="text-blue-400 font-bold text-sm">
                          {challenge.initialPoints} pts
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        {challenge.description.length > 150 
                          ? `${challenge.description.substring(0, 150)}...` 
                          : challenge.description}
                      </p>
                      {challenge.fileUrl && (
                        <a 
                          href={challenge.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          📎 View Attachment
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditChallenge(challenge)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => challenge.id && handleDeleteChallenge(challenge.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
