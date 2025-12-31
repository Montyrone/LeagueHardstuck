import { useState, useEffect } from 'react';
import { mistakesAPI } from '../services/api';

const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

export default function MatchForm({ match = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    champion: match?.champion || '',
    role: match?.role || '',
    result: match?.result || 'win',
    kills: match?.kills || 0,
    deaths: match?.deaths || 0,
    assists: match?.assists || 0,
    cs_per_min: match?.cs_per_min || 0,
    game_duration: match?.game_duration || 0,
    notes: match?.notes || '',
    mistakeIds: match?.mistakes?.map(m => m.id) || [],
  });

  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    try {
      const response = await mistakesAPI.getAll();
      setMistakes(response.data);
    } catch (error) {
      console.error('Error loading mistakes:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const mistakeId = parseInt(value);
      setFormData(prev => ({
        ...prev,
        mistakeIds: checked
          ? [...prev.mistakeIds, mistakeId]
          : prev.mistakeIds.filter(id => id !== mistakeId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900">
        {match ? 'Edit Match' : 'Log New Match'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Champion *
          </label>
          <input
            type="text"
            name="champion"
            value={formData.champion}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Ahri"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select role</option>
            {ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Result *
          </label>
          <select
            name="result"
            value={formData.result}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="win">Win</option>
            <option value="loss">Loss</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Game Duration (minutes)
          </label>
          <input
            type="number"
            name="game_duration"
            value={formData.game_duration}
            onChange={handleChange}
            min="0"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kills
          </label>
          <input
            type="number"
            name="kills"
            value={formData.kills}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deaths
          </label>
          <input
            type="number"
            name="deaths"
            value={formData.deaths}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assists
          </label>
          <input
            type="number"
            name="assists"
            value={formData.assists}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CS/min
          </label>
          <input
            type="number"
            name="cs_per_min"
            value={formData.cs_per_min}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mistakes (select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {mistakes.map((mistake) => (
            <label key={mistake.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                value={mistake.id}
                checked={formData.mistakeIds.includes(mistake.id)}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{mistake.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reflection Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="What went well? What went wrong? One thing to improve next game..."
        />
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (match ? 'Update Match' : 'Log Match')}
        </button>
      </div>
    </form>
  );
}

