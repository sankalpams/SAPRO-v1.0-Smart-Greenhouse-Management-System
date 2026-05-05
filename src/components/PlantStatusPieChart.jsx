import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

const PlantStatusPieChart = ({ data }) => {
  if (!data || !data.byStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const chartData = [
    {
      name: 'Seeded',
      value: data.byStatus.seeded || 0,
      color: '#eab308' // yellow
    },
    {
      name: 'Growing',
      value: data.byStatus.growing || 0,
      color: '#22c55e' // green
    },
    {
      name: 'Harvested',
      value: data.byStatus.harvested || 0,
      color: '#3b82f6' // blue
    }
  ].filter(item => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">
            {data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Count: {data.value}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Percentage: {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) => {
            if (percent < 0.05) return '';
            return `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
          }}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => {
            const item = chartData.find(d => d.name === value);
            return `${value}: ${item ? item.value : 0}`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PlantStatusPieChart;

