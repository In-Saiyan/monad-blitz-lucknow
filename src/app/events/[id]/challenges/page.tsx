'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import MatrixBackground from '@/components/ui/effects/MatrixBackground';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaFileAlt } from 'react-icons/fa';

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
    setLoading(true);
    try {
      const eventResponse = await fetch(`/api/events/${eventId}`);
      if (!eventResponse.ok) {
        throw new Error('Failed to fetch event');
      }
      const eventData = await eventResponse.json();
      setEvent(eventData);

      if (session?.user?.email !== eventData.organizer?.email) {
        setError('You are not authorized to manage challenges for this event');
        return;
      }

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
        resetForm();
        fetchEventAndChallenges();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        fetchEventAndChallenges();
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
      case 'easy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'hard': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-primary font-mono">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent"></div>
          <p>Loading Challenge Manager...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 text-center p-8 bg-background/50 backdrop-blur-sm rounded-xl border border-primary/20">
          <h2 className="text-2xl font-bold text-primary font-mono mb-4">{error || 'Event Not Found'}</h2>
          <p className="text-muted-foreground mb-6">The requested resource could not be loaded.</p>
          <Link href="/events" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-transform transform hover:scale-105 inline-block">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MatrixBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href={`/events/${eventId}`} className="inline-flex items-center text-accent hover:underline mb-4 font-mono">
            ← Back to Event
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/20">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary font-mono mb-2">
                Manage Challenges
              </h1>
              <p className="text-muted-foreground">For Event: {event.name}</p>
            </div>
            {!showCreateForm && (
              <button
                onClick={() => { setShowCreateForm(true); setEditingChallenge(null); setChallengeForm(initialChallengeData); }}
                className="mt-4 sm:mt-0 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-transform transform hover:scale-105"
              >
                <FaPlus /> Add New Challenge
              </button>
            )}
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-primary/20 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary font-mono">
                {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
              </h2>
              <button onClick={resetForm} className="text-muted-foreground hover:text-primary">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitChallenge} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Challenge Title *</label>
                  <input type="text" value={challengeForm.title} onChange={(e) => handleInputChange('title', e.target.value)} className="w-full px-3 py-2 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" placeholder="e.g., Web Server Takeover" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
                  <select value={challengeForm.category} onChange={(e) => handleInputChange('category', e.target.value)} className="w-full px-3 py-2 bg-background/70 border border-primary/20 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                    <option>Web</option><option>Crypto</option><option>Pwn</option><option>Reverse</option><option>Forensics</option><option>Misc</option><option>OSINT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Difficulty</label>
                  <select value={challengeForm.difficulty} onChange={(e) => handleInputChange('difficulty', e.target.value as 'Easy' | 'Medium' | 'Hard')} className="w-full px-3 py-2 bg-background/70 border border-primary/20 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Flag *</label>
                  <input type="text" value={challengeForm.flag} onChange={(e) => handleInputChange('flag', e.target.value)} className="w-full px-3 py-2 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" placeholder="ctf{...}" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Initial Points</label>
                  <input type="number" value={challengeForm.initialPoints} onChange={(e) => handleInputChange('initialPoints', parseInt(e.target.value))} className="w-full px-3 py-2 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" min="1" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Minimum Points</label>
                  <input type="number" value={challengeForm.minPoints} onChange={(e) => handleInputChange('minPoints', parseInt(e.target.value))} className="w-full px-3 py-2 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" min="1" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Decay Factor</label>
                  <input type="number" value={challengeForm.decayFactor} onChange={(e) => handleInputChange('decayFactor', parseInt(e.target.value))} className="w-full px-3 py-2 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" min="1" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Attachment (Optional)</label>
                  <input type="file" onChange={handleFileChange} className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
                  <p className="text-xs text-muted-foreground mt-1">Max 10MB. Re-upload to replace existing file.</p>
                  {challengeForm.fileUrl && !challengeForm.file && (
                    <p className="text-sm text-muted-foreground mt-1">Current: <a href={challengeForm.fileUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{challengeForm.fileUrl.split('/').pop()}</a></p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Description *</label>
                <textarea value={challengeForm.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={6} className="w-full px-3 py-2 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Describe the challenge. Links will be made clickable." required />
              </div>
              <div className="flex space-x-4 pt-2">
                <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium">{editingChallenge ? 'Update Challenge' : 'Create Challenge'}</button>
                <button type="button" onClick={resetForm} className="bg-muted hover:bg-muted/80 text-muted-foreground px-6 py-2 rounded-lg font-medium">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-primary/20">
          <h2 className="text-2xl font-bold text-primary font-mono mb-6">
            Existing Challenges ({challenges.length})
          </h2>
          {challenges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No challenges created yet.</p>
              {!showCreateForm && (
                <button onClick={() => setShowCreateForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-transform transform hover:scale-105 inline-block">
                  Create First Challenge
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-background/70 rounded-lg p-4 border border-primary/10 hover:border-accent transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-2">{challenge.title}</h3>
                      <div className="flex items-center flex-wrap gap-3 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>{challenge.difficulty}</span>
                        <span className="text-xs bg-primary/20 text-accent px-2 py-1 rounded">{challenge.category}</span>
                        <span className="text-primary font-bold text-sm">{challenge.initialPoints} pts</span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{challenge.description}</p>
                      {challenge.fileUrl && (
                        <a href={challenge.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-accent hover:underline text-sm">
                          <FaFileAlt /> View Attachment
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 ml-2">
                      <button onClick={() => handleEditChallenge(challenge)} className="bg-secondary hover:bg-secondary/80 text-secondary-foreground p-2 rounded-md text-sm transition-colors"><FaEdit /></button>
                      <button onClick={() => challenge.id && handleDeleteChallenge(challenge.id)} className="bg-red-600/50 hover:bg-red-600 text-red-100 p-2 rounded-md text-sm transition-colors"><FaTrash /></button>
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
