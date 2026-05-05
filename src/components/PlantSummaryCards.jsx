import React from 'react';
import { Sprout, TrendingUp, CheckCircle, Calendar } from 'lucide-react';

const PlantSummaryCards = ({ data }) => {
  if (!data) {
    return null;
  }

  const cards = [
    {
      title: 'Total Plants',
      value: data.totalPlants,
      icon: Sprout,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Growing',
      value: data.growingPlants,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Harvested',
      value: data.harvestedPlants,
      icon: CheckCircle,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      title: 'Upcoming Harvests',
      value: data.upcomingHarvests,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`card p-6 ${card.bgColor} border border-gray-200 dark:border-gray-700`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${card.color}`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlantSummaryCards;

