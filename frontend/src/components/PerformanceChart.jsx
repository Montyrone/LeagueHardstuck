import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PerformanceChart({ stats }) {
  if (!stats || !stats.recentPerformance) {
    return <div className="text-gray-500 text-center py-8">Not enough data to display chart</div>;
  }

  const data = [
    {
      period: 'Last 10',
      winRate: parseFloat(stats.recentPerformance.last10.winRate),
      csPerMin: parseFloat(stats.recentPerformance.last10.avgCSPerMin),
    },
    {
      period: 'Last 30',
      winRate: parseFloat(stats.recentPerformance.last30.winRate),
      csPerMin: parseFloat(stats.recentPerformance.last30.avgCSPerMin),
    },
    {
      period: 'Overall',
      winRate: parseFloat(stats.overall.winRate),
      csPerMin: parseFloat(stats.overall.avgCSPerMin),
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="winRate"
          stroke="#0284c7"
          strokeWidth={2}
          name="Win Rate %"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="csPerMin"
          stroke="#10b981"
          strokeWidth={2}
          name="CS/min"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

