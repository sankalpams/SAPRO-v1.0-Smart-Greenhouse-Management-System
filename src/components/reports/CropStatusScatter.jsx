import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CropStatusScatter = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // Format date for X-axis display
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const plantedDate = new Date(data.plantedDate);
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">
            {data.crop}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Zone: {data.zone}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Planted: {plantedDate.toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Days to Harvest: {data.daysToHarvest}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          dataKey="x"
          domain={['dataMin', 'dataMax']}
          tickFormatter={formatXAxis}
          angle={-45}
          textAnchor="end"
          height={80}
          label={{ value: 'Planted Date', position: 'insideBottom', offset: -5 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis 
          type="number"
          dataKey="y"
          label={{ value: 'Days to Harvest', angle: -90, position: 'insideLeft' }}
          className="text-gray-600 dark:text-gray-400"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Scatter 
          name="Crops" 
          data={data} 
          fill="#3b82f6"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default CropStatusScatter;

