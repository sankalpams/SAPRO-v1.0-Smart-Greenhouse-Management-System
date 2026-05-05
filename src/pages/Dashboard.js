import React, { useState, useEffect } from 'react';
import DashboardCards from '../components/DashboardCards';
import { EnvironmentalChart, WateringChart, CropStatusChart } from '../components/Charts';
import { generateEnvironmentData, generateHistoricalData, generateWateringSchedules, generatePlantingSchedules } from '../utils/dataGenerator';

const Dashboard = () => {
  const [environmentData, setEnvironmentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [wateringSchedules, setWateringSchedules] = useState([]);
  const [plantingSchedules, setPlantingSchedules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      try {
        // Generate initial data
        const envData = generateEnvironmentData();
        const histData = generateHistoricalData(1); // Last 24 hours
        const wateringData = generateWateringSchedules();
        const plantingData = generatePlantingSchedules();
        
        setEnvironmentData(envData);
        setHistoricalData(histData);
        setWateringSchedules(wateringData);
        setPlantingSchedules(plantingData);
        
        // Generate some alerts
        setAlerts([
          {
            id: 1,
            type: 'High Temperature',
            message: 'Temperature above 35°C detected',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            severity: 'high',
            read: false
          },
          {
            id: 2,
            type: 'Watering Due',
            message: 'Scheduled watering time approaching',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            severity: 'medium',
            read: false
          },
          {
            id: 3,
            type: 'Planting Due',
            message: 'New planting scheduled for tomorrow',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            severity: 'low',
            read: true
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    loadData();

    // Set up real-time updates every 5 seconds
    const interval = setInterval(() => {
      const newEnvData = generateEnvironmentData();
      setEnvironmentData(newEnvData);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Prepare chart data
  const wateringChartData = [
    { day: 'Mon', sessions: 2 },
    { day: 'Tue', sessions: 3 },
    { day: 'Wed', sessions: 1 },
    { day: 'Thu', sessions: 4 },
    { day: 'Fri', sessions: 2 },
    { day: 'Sat', sessions: 1 },
    { day: 'Sun', sessions: 3 }
  ];

  const cropStatusData = [
    { status: 'Seeded', count: 8 },
    { status: 'Growing', count: 15 },
    { status: 'Harvested', count: 12 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor your greenhouse conditions and activities
        </p>
      </div>

      {/* Dashboard Cards */}
      <DashboardCards
        environmentData={environmentData}
        alerts={alerts}
        wateringSchedules={wateringSchedules}
        plantingSchedules={plantingSchedules}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Environmental Chart */}
        <div className="lg:col-span-2">
          <EnvironmentalChart data={historicalData} />
        </div>

        {/* Watering Chart */}
        <WateringChart data={wateringChartData} />

        {/* Crop Status Chart */}
        <CropStatusChart data={cropStatusData} />
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Watering completed in Zone A
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                15 minutes ago
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Tomato seeds planted in Zone B
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                2 hours ago
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Temperature alert triggered
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                3 hours ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
