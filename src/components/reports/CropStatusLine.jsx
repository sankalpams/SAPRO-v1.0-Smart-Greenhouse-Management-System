import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CropStatusLine = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="formattedDate" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
          label={{ value: 'Active Crops', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
          formatter={(value) => [`${value} crops`, 'Active Crops']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="activeCrops" 
          stroke="#22c55e" 
          strokeWidth={3}
          dot={{ fill: '#22c55e', r: 4 }}
          activeDot={{ r: 6 }}
          name="Active Crops"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CropStatusLine;

