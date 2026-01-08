import { useState, useEffect } from 'react';
import { matchesAPI, mistakesAPI } from '../services/api';
import PerformanceChart from './PerformanceChart';
import MistakeSummary from './MistakeSummary';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [mistakeStats, setMistakeStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

    // Refresh dashboard data when page becomes visible (tab regains focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.debug('[Dashboard] visibilitychange: visible -> reloading');
        loadDashboardData();
      }
    };

    // Listen for data update events from other components
    const handleDataUpdated = (e) => {
      console.debug('[Dashboard] dataUpdated event received', e?.detail);
      loadDashboardData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('dataUpdated', handleDataUpdated);

    // Also reload every 5 seconds to catch any changes from other tabs/windows
    const interval = setInterval(() => {
      console.debug('[Dashboard] periodic reload');
      loadDashboardData();
    }, 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('dataUpdated', handleDataUpdated);
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, mistakesResponse] = await Promise.all([
        matchesAPI.getStats(),
        mistakesAPI.getStats(),
      ]);
      console.debug('[Dashboard] matches stats response:', statsResponse.data);
      console.debug('[Dashboard] mistakes stats response:', mistakesResponse.data);
      setStats(statsResponse.data);
      setMistakeStats(mistakesResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available. Start logging matches to see your stats!</p>
      </div>
    );
  }

  const overall = stats.overall || {};
  const mainChampion = stats.byChampion?.[0];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Win Rate</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {overall.winRate || 0}%
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {overall.wins || 0}W - {overall.losses || 0}L
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Average CS/min</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {overall.avgCSPerMin || 0}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {overall.totalGames || 0} games
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Average KDA</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {overall.avgKills || 0}/{overall.avgDeaths || 0}/{overall.avgAssists || 0}
          </div>
          <div className="mt-1 text-sm text-gray-500">Kills/Deaths/Assists</div>
        </div>

        {mainChampion && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Main Champion</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {mainChampion.champion}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {mainChampion.winRate}% WR ({mainChampion.games} games)
            </div>
          </div>
        )}
      </div>

      {/* Performance Chart */}
      {stats.recentPerformance && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Over Time</h2>
          <PerformanceChart stats={stats} />
        </div>
      )}

      {/* Mistake Summary */}
      {mistakeStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recurring Mistakes</h2>
          <MistakeSummary mistakes={mistakeStats} />
        </div>
      )}

      {/* Champion and Role Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.byChampion && stats.byChampion.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">By Champion</h2>
            <div className="space-y-3">
              {stats.byChampion.slice(0, 5).map((champ) => (
                <div key={champ.champion} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium text-gray-900">{champ.champion}</div>
                    <div className="text-sm text-gray-500">{champ.games} games</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${champ.winRate >= 50 ? 'text-win' : 'text-loss'}`}>
                      {champ.winRate}%
                    </div>
                    <div className="text-sm text-gray-500">{champ.avgCSPerMin} CS/min</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.byRole && stats.byRole.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">By Role</h2>
            <div className="space-y-3">
              {stats.byRole.map((role) => (
                <div key={role.role} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium text-gray-900">{role.role}</div>
                    <div className="text-sm text-gray-500">{role.games} games</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${role.winRate >= 50 ? 'text-win' : 'text-loss'}`}>
                      {role.winRate}%
                    </div>
                    <div className="text-sm text-gray-500">{role.avgCSPerMin} CS/min</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

