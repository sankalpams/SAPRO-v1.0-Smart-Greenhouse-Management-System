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

const CropStatusHorizontalBar = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number"
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
          label={{ value: 'Number of Crops', position: 'insideBottom', offset: -5 }}
        />
        <YAxis 
          type="category"
          dataKey="zone" 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
          width={70}
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
          fill="#22c55e"
          radius={[0, 8, 8, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CropStatusHorizontalBar;

