import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Download, Filter, AlertTriangle, Play, Square } from 'lucide-react';
import { EnvironmentalChart } from '../components/Charts';
import { generateEnvironmentData, generateHistoricalData } from '../utils/dataGenerator';
import { useAlerts } from '../context/AlertContext';

const Monitoring = () => {
  const [environmentData, setEnvironmentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [selectedZone, setSelectedZone] = useState('A');
  const [isSimulating, setIsSimulating] = useState(false);
  const { addAlert } = useAlerts();

  const checkAlerts = useCallback((data) => {
    const newAlerts = [];
    
    if (data.temperature > 35) {
      const alert = {
        type: 'High Temperature',
        message: `Temperature ${data.temperature}°C is above threshold in Zone ${selectedZone}`,
        severity: 'high'
      };
      addAlert(alert);
      newAlerts.push(alert);
    }
    
    if (data.humidity > 80) {
      const alert = {
        type: 'High Humidity',
        message: `Humidity ${data.humidity}% is above threshold in Zone ${selectedZone}`,
        severity: 'medium'
      };
      addAlert(alert);
      newAlerts.push(alert);
    }
    
    if (data.soilMoisture < 40) {
      const alert = {
        type: 'Low Moisture',
        message: `Soil moisture ${data.soilMoisture}% is below threshold in Zone ${selectedZone}`,
        severity: 'high'
      };
      addAlert(alert);
      newAlerts.push(alert);
    }
    
    setAlerts(newAlerts);
  }, [selectedZone, addAlert]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentData = generateEnvironmentData();
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      const histData = generateHistoricalData(days);
      
      setEnvironmentData(currentData);
      setHistoricalData(histData);
      checkAlerts(currentData);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange, checkAlerts]);

  useEffect(() => {
    loadData();
    
    // Set up real-time updates only if simulating
    let interval;
    if (isSimulating) {
      interval = setInterval(() => {
        const newData = generateEnvironmentData();
        setEnvironmentData(newData);
        checkAlerts(newData);
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadData, isSimulating, checkAlerts]);

  const exportData = () => {
    const csvContent = [
      'Timestamp,Temperature,Humidity,Soil Moisture',
      ...historicalData.map(item => 
        `${item.timestamp},${item.temperature},${item.humidity},${item.soilMoisture}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `environmental-data-${timeRange}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (value, threshold, type = 'above') => {
    if (type === 'above') {
      return value > threshold ? 'text-red-600' : 'text-green-600';
    } else {
      return value < threshold ? 'text-red-600' : 'text-green-600';
    }
  };

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Environmental Monitoring
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time monitoring of greenhouse conditions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSimulation}
            className={`flex items-center space-x-2 ${
              isSimulating 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            } px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            {isSimulating ? (
              <>
                <Square className="h-4 w-4" />
                <span>Stop Simulation</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Start Simulation</span>
              </>
            )}
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportData}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Zone Selection */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Zone Selection
          </h3>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="input-field w-auto"
            >
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
              <option value="C">Zone C</option>
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Temperature
              </p>
              <p className={`text-3xl font-bold ${getStatusColor(environmentData?.temperature, 35, 'above')}`}>
                {environmentData?.temperature || 0}°C
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Min: 20°C</span>
              <span>Max: 35°C</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${Math.min((environmentData?.temperature / 40) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Humidity
              </p>
              <p className={`text-3xl font-bold ${getStatusColor(environmentData?.humidity, 80, 'above')}`}>
                {environmentData?.humidity || 0}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Min: 30%</span>
              <span>Max: 80%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${environmentData?.humidity || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Soil Moisture
              </p>
              <p className={`text-3xl font-bold ${getStatusColor(environmentData?.soilMoisture, 40, 'below')}`}>
                {environmentData?.soilMoisture || 0}%
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Min: 20%</span>
              <span>Max: 80%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${environmentData?.soilMoisture || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historical Data
          </h3>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field w-auto"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Environmental Chart */}
      <EnvironmentalChart data={historicalData} zone={selectedZone} />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high' 
                    ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                    : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {alert.type}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Monitoring;
