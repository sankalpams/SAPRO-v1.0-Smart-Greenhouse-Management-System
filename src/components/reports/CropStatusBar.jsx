import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CropStatusBar = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const COLORS = {
    'Seeded': '#eab308',
    'Growing': '#22c55e',
    'Harvested': '#3b82f6'
  };

  const chartData = data.map(item => ({
    ...item,
    fill: COLORS[item.status] || '#8884d8'
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="status" 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
          formatter={(value) => [`${value} crops`, 'Count']}
        />
        <Legend />
        <Bar 
          dataKey="count" 
          name="Number of Crops"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CropStatusBar;

