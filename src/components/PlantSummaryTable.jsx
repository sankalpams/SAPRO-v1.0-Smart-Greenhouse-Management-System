import React from 'react';
import { formatDateOnly } from '../utils/reportUtils';

const PlantSummaryTable = ({ data }) => {
  if (!data || !data.tableData || data.tableData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const getRowClassName = (row) => {
    if (row.status === 'harvested') {
      return 'bg-green-50 dark:bg-green-900/20';
    }
    if (row.daysRemaining !== null && row.daysRemaining <= 3) {
      return 'bg-red-50 dark:bg-red-900/20';
    }
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return formatDateOnly(dateString);
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      seeded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      growing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      harvested: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Crop Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Zone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Planted Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Harvest Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Days Remaining
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.tableData.map((row) => (
            <tr
              key={row.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${getRowClassName(
                row
              )}`}
            >
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {row.cropName}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {row.zone}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                {getStatusBadge(row.status)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {formatDate(row.plantedDate)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                {formatDate(row.harvestDate)}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm">
                {row.daysRemaining !== null ? (
                  <span
                    className={`font-medium ${
                      row.daysRemaining <= 3
                        ? 'text-red-600 dark:text-red-400'
                        : row.daysRemaining <= 7
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {row.daysRemaining} {row.daysRemaining === 1 ? 'day' : 'days'}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlantSummaryTable;

