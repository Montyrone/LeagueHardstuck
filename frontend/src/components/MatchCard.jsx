export default function MatchCard({ match, onEdit, onDelete }) {
  const winLossClass = match.result === 'win' ? 'border-win' : 'border-loss';
  const winLossBg = match.result === 'win' ? 'bg-win/10' : 'bg-loss/10';

  // Build a Data Dragon champion image URL. We sanitize the champion name to remove
  // spaces and special characters (e.g. "Lee Sin" -> "LeeSin", "Cho'Gath" -> "ChoGath").
  const ddVersion = '13.23.1'; // pinned version; update if needed
  const sanitizedChampion = (match.champion || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/\s+/g, '');
  const championImageUrl = `https://ddragon.leagueoflegends.com/cdn/${ddVersion}/img/champion/${sanitizedChampion}.png`;
  const placeholder = 'https://via.placeholder.com/40?text=?';

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${winLossClass} ${winLossBg}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center">
            <img
              src={championImageUrl}
              alt={match.champion}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholder; }}
              // 15% larger than 40px (w-10/h-10) -> 46px
              style={{ width: '46px', height: '46px' }}
              className="rounded-full mr-3 object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {match.champion} - {match.role}
              </h3>
              <div className="text-sm text-gray-500">
                {new Date(match.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          match.result === 'win' ? 'bg-win text-white' : 'bg-loss text-white'
        }`}>
          {match.result.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-500">KDA</div>
          <div className="text-sm font-medium">{match.kills}/{match.deaths}/{match.assists}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">CS/min</div>
          <div className="text-sm font-medium">{match.cs_per_min}</div>
        </div>
        {match.game_duration > 0 && (
          <div>
            <div className="text-xs text-gray-500">Duration</div>
            <div className="text-sm font-medium">{match.game_duration}m</div>
          </div>
        )}
      </div>

      {match.mistakes && match.mistakes.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Mistakes:</div>
          <div className="flex flex-wrap gap-1">
            {match.mistakes.map((mistake) => (
              <span
                key={mistake.id}
                className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded"
              >
                {mistake.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {match.notes && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Notes:</div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{match.notes}</p>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {onEdit && (
          <button
            onClick={() => onEdit(match)}
            className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(match.id)}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

