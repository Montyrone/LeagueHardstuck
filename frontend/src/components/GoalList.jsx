import { useState } from 'react';

const STATUS_COLORS = {
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default function GoalList({ goals, onUpdate, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);

  const handleStatusChange = async (goal, newStatus) => {
    await onUpdate(goal.id, {
      ...goal,
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    });
  };

  return (
    <div className="space-y-4">
      {goals.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No goals yet. Create one to get started!</p>
      ) : (
        goals.map((goal) => (
          <div key={goal.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[goal.status]}`}>
                    {goal.status}
                  </span>
                </div>
                {goal.description && (
                  <p className="mt-2 text-sm text-gray-600">{goal.description}</p>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  Created: {new Date(goal.created_at).toLocaleDateString()}
                  {goal.completed_at && (
                    <span className="ml-3">
                      Completed: {new Date(goal.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Status:</span>
              <div className="flex space-x-2">
                {['active', 'completed', 'failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(goal, status)}
                    className={`px-3 py-1 text-xs rounded ${
                      goal.status === status
                        ? STATUS_COLORS[status]
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              {onDelete && (
                <button
                  onClick={() => onDelete(goal.id)}
                  className="ml-auto px-3 py-1 text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

