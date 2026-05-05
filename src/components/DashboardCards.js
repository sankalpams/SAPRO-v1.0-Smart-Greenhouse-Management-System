import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Cloud, 
  AlertTriangle, 
  Clock, 
  Sprout,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const DashboardCards = ({ environmentData, alerts, wateringSchedules, plantingSchedules }) => {
  const getStatusColor = (value, threshold, type = 'above') => {
    if (type === 'above') {
      return value > threshold ? 'text-red-600' : 'text-green-600';
    } else {
      return value < threshold ? 'text-red-600' : 'text-green-600';
    }
  };

  const getStatusIcon = (value, threshold, type = 'above') => {
    if (type === 'above') {
      return value > threshold ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
    } else {
      return value < threshold ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />;
    }
  };

  const activeAlerts = alerts?.filter(alert => !alert.read) || [];
  const nextWatering = wateringSchedules?.find(schedule => 
    new Date(schedule.time) > new Date() && schedule.status === 'pending'
  );
  const activePlants = plantingSchedules?.filter(plant => 
    plant.status === 'growing' || plant.status === 'seeded'
  ).length || 0;

  const cards = [
    {
      title: 'Temperature',
      value: environmentData?.temperature || 0,
      unit: '°C',
      icon: Thermometer,
      color: getStatusColor(environmentData?.temperature, 35, 'above'),
      status: environmentData?.temperature > 35 ? 'High' : 'Normal',
      trend: getStatusIcon(environmentData?.temperature, 35, 'above')
    },
    {
      title: 'Humidity',
      value: environmentData?.humidity || 0,
      unit: '%',
      icon: Cloud,
      color: getStatusColor(environmentData?.humidity, 80, 'above'),
      status: environmentData?.humidity > 80 ? 'High' : 'Normal',
      trend: getStatusIcon(environmentData?.humidity, 80, 'above')
    },
    {
      title: 'Soil Moisture',
      value: environmentData?.soilMoisture || 0,
      unit: '%',
      icon: Droplets,
      color: getStatusColor(environmentData?.soilMoisture, 40, 'below'),
      status: environmentData?.soilMoisture < 40 ? 'Low' : 'Normal',
      trend: getStatusIcon(environmentData?.soilMoisture, 40, 'below')
    },
    {
      title: 'Active Plants',
      value: activePlants,
      unit: '',
      icon: Sprout,
      color: 'text-green-600',
      status: 'Growing',
      trend: <TrendingUp className="h-4 w-4" />
    },
    {
      title: 'Next Watering',
      value: nextWatering ? 
        Math.round((new Date(nextWatering.time) - new Date()) / (1000 * 60 * 60)) : 0,
      unit: 'h',
      icon: Clock,
      color: nextWatering ? 'text-blue-600' : 'text-gray-600',
      status: nextWatering ? 'Scheduled' : 'None',
      trend: <Clock className="h-4 w-4" />
    },
    {
      title: 'Alerts Today',
      value: activeAlerts.length,
      unit: '',
      icon: AlertTriangle,
      color: activeAlerts.length > 0 ? 'text-red-600' : 'text-green-600',
      status: activeAlerts.length > 0 ? 'Active' : 'None',
      trend: activeAlerts.length > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-700 ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value}{card.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center ${card.color}`}>
                  {card.trend}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {card.status}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
