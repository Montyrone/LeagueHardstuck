import { useState, useEffect } from 'react';
import { matchesAPI } from '../services/api';
import MatchForm from '../components/MatchForm';
import MatchCard from '../components/MatchCard';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await matchesAPI.getAll();
      setMatches(response.data);
    } catch (error) {
      console.error('Error loading matches:', error);
      // Don't show alert for network errors on initial load to avoid spam
      if (error.code !== 'ERR_NETWORK' && error.message !== 'Network Error') {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to load matches';
        alert(`Failed to load matches: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async (matchData) => {
    try {
      // Ensure notes is null if empty string
      const dataToSend = {
        ...matchData,
        notes: matchData.notes && matchData.notes.trim() ? matchData.notes.trim() : null
      };
      
      const response = await matchesAPI.create(dataToSend);
      await loadMatches();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating match:', error);
      let errorMessage = 'Failed to create match';
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = 'Cannot connect to backend server. Please make sure the backend is running on http://localhost:5000';
      } else {
        errorMessage = error.response?.data?.error || error.message || 'Failed to create match';
      }
      
      alert(`Failed to create match: ${errorMessage}`);
    }
  };

  const handleUpdateMatch = async (matchData) => {
    try {
      // Ensure notes is null if empty string
      const dataToSend = {
        ...matchData,
        notes: matchData.notes && matchData.notes.trim() ? matchData.notes.trim() : null
      };
      
      await matchesAPI.update(editingMatch.id, dataToSend);
      await loadMatches();
      setEditingMatch(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating match:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update match';
      alert(`Failed to update match: ${errorMessage}`);
    }
  };

  const handleDeleteMatch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this match?')) {
      return;
    }

    try {
      await matchesAPI.delete(id);
      await loadMatches();
      // Notify other components (like Dashboard) that data has changed
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Failed to delete match');
    }
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMatch(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading matches...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Log New Match
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <MatchForm
            match={editingMatch}
            onSubmit={editingMatch ? handleUpdateMatch : handleCreateMatch}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No matches logged yet. Log your first match to get started!</p>
          </div>
        ) : (
          matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onEdit={handleEdit}
              onDelete={handleDeleteMatch}
            />
          ))
        )}
      </div>
    </div>
  );
}

