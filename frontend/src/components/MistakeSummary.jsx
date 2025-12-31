export default function MistakeSummary({ mistakes }) {
  if (!mistakes || mistakes.length === 0) {
    return <p className="text-gray-500">No mistakes tracked yet.</p>;
  }

  return (
    <div className="space-y-3">
      {mistakes.map((mistake) => (
        <div key={mistake.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">{mistake.name}</div>
            {mistake.description && (
              <div className="text-sm text-gray-500">{mistake.description}</div>
            )}
          </div>
          <div className="text-2xl font-bold text-primary-600">{mistake.frequency}</div>
        </div>
      ))}
    </div>
  );
}

