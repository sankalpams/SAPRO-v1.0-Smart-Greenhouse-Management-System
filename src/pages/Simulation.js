import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Settings, Thermometer, Droplets, Cloud, AlertTriangle } from 'lucide-react';
// import { generateEnvironmentData } from '../utils/dataGenerator';

const Simulation = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState({
    temperature: 25,
    humidity: 60,
    soilMoisture: 50
  });
  const [simulationSettings, setSimulationSettings] = useState({
    interval: 5000,
    temperatureRange: { min: 20, max: 35 },
    humidityRange: { min: 30, max: 80 },
    moistureRange: { min: 20, max: 70 }
  });
  const [alerts, setAlerts] = useState([]);
  const [simulationHistory, setSimulationHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const generateSimulationData = useCallback(() => {
    const temp = Math.random() * (simulationSettings.temperatureRange.max - simulationSettings.temperatureRange.min) + simulationSettings.temperatureRange.min;
    const humidity = Math.random() * (simulationSettings.humidityRange.max - simulationSettings.humidityRange.min) + simulationSettings.humidityRange.min;
    const moisture = Math.random() * (simulationSettings.moistureRange.max - simulationSettings.moistureRange.min) + simulationSettings.moistureRange.min;
    
    return {
      temperature: Math.round(temp * 10) / 10,
      humidity: Math.round(humidity),
      soilMoisture: Math.round(moisture),
      timestamp: new Date().toISOString()
    };
  }, [simulationSettings]);

  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(() => {
        const newData = generateSimulationData();
        setSimulationData(newData);
        setSimulationHistory(prev => [...prev.slice(-19), newData]); // Keep last 20 readings
        checkAlerts(newData);
      }, simulationSettings.interval);
    }
    return () => clearInterval(interval);
  }, [isSimulating, simulationSettings, generateSimulationData]);

  const checkAlerts = (data) => {
    const newAlerts = [];
    
    if (data.temperature > 35) {
      newAlerts.push({
        id: Date.now(),
        type: 'High Temperature',
        message: `Temperature ${data.temperature}°C is above threshold`,
        severity: 'high',
        timestamp: data.timestamp
      });
    }
    
    if (data.humidity > 80) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'High Humidity',
        message: `Humidity ${data.humidity}% is above threshold`,
        severity: 'medium',
        timestamp: data.timestamp
      });
    }
    
    if (data.soilMoisture < 40) {
      newAlerts.push({
        id: Date.now() + 2,
        type: 'Low Moisture',
        message: `Soil moisture ${data.soilMoisture}% is below threshold`,
        severity: 'high',
        timestamp: data.timestamp
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 9)]); // Keep last 10 alerts
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setSimulationHistory([]);
    setAlerts([]);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulationData({
      temperature: 25,
      humidity: 60,
      soilMoisture: 50
    });
    setSimulationHistory([]);
    setAlerts([]);
  };

  const getStatusColor = (value, threshold, type = 'above') => {
    if (type === 'above') {
      return value > threshold ? 'text-red-600' : 'text-green-600';
    } else {
      return value < threshold ? 'text-red-600' : 'text-green-600';
    }
  };

  const getStatusIcon = (value, threshold, type = 'above') => {
    if (type === 'above') {
      return value > threshold ? '🔴' : '🟢';
    } else {
      return value < threshold ? '🔴' : '🟢';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Data Simulation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Simulate greenhouse sensor data for testing and demonstration
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Simulation Controls
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isSimulating ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {!isSimulating ? (
            <button
              onClick={startSimulation}
              className="btn-primary flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Start Simulation</span>
            </button>
          ) : (
            <button
              onClick={stopSimulation}
              className="btn-secondary flex items-center space-x-2"
            >
              <Pause className="h-4 w-4" />
              <span>Pause Simulation</span>
            </button>
          )}
          
          <button
            onClick={resetSimulation}
            className="btn-secondary flex items-center space-x-2"
          >
            <Square className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Simulation Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Update Interval (ms)
              </label>
              <input
                type="number"
                value={simulationSettings.interval}
                onChange={(e) => setSimulationSettings({
                  ...simulationSettings,
                  interval: parseInt(e.target.value)
                })}
                className="input-field"
                min="1000"
                max="30000"
                step="1000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature Range (°C)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={simulationSettings.temperatureRange.min}
                  onChange={(e) => setSimulationSettings({
                    ...simulationSettings,
                    temperatureRange: {
                      ...simulationSettings.temperatureRange,
                      min: parseInt(e.target.value)
                    }
                  })}
                  className="input-field w-20"
                  min="0"
                  max="50"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={simulationSettings.temperatureRange.max}
                  onChange={(e) => setSimulationSettings({
                    ...simulationSettings,
                    temperatureRange: {
                      ...simulationSettings.temperatureRange,
                      max: parseInt(e.target.value)
                    }
                  })}
                  className="input-field w-20"
                  min="0"
                  max="50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Humidity Range (%)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={simulationSettings.humidityRange.min}
                  onChange={(e) => setSimulationSettings({
                    ...simulationSettings,
                    humidityRange: {
                      ...simulationSettings.humidityRange,
                      min: parseInt(e.target.value)
                    }
                  })}
                  className="input-field w-20"
                  min="0"
                  max="100"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={simulationSettings.humidityRange.max}
                  onChange={(e) => setSimulationSettings({
                    ...simulationSettings,
                    humidityRange: {
                      ...simulationSettings.humidityRange,
                      max: parseInt(e.target.value)
                    }
                  })}
                  className="input-field w-20"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Soil Moisture Range (%)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={simulationSettings.moistureRange.min}
                  onChange={(e) => setSimulationSettings({
                    ...simulationSettings,
                    moistureRange: {
                      ...simulationSettings.moistureRange,
                      min: parseInt(e.target.value)
                    }
                  })}
                  className="input-field w-20"
                  min="0"
                  max="100"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={simulationSettings.moistureRange.max}
                  onChange={(e) => setSimulationSettings({
                    ...simulationSettings,
                    moistureRange: {
                      ...simulationSettings.moistureRange,
                      max: parseInt(e.target.value)
                    }
                  })}
                  className="input-field w-20"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Sensor Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Temperature
              </p>
              <p className={`text-3xl font-bold ${getStatusColor(simulationData.temperature, 35, 'above')}`}>
                {simulationData.temperature}°C
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Thermometer className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-2xl mr-2">
              {getStatusIcon(simulationData.temperature, 35, 'above')}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {simulationData.temperature > 35 ? 'Above threshold' : 'Normal'}
            </span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Humidity
              </p>
              <p className={`text-3xl font-bold ${getStatusColor(simulationData.humidity, 80, 'above')}`}>
                {simulationData.humidity}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Cloud className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-2xl mr-2">
              {getStatusIcon(simulationData.humidity, 80, 'above')}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {simulationData.humidity > 80 ? 'Above threshold' : 'Normal'}
            </span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Soil Moisture
              </p>
              <p className={`text-3xl font-bold ${getStatusColor(simulationData.soilMoisture, 40, 'below')}`}>
                {simulationData.soilMoisture}%
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Droplets className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-2xl mr-2">
              {getStatusIcon(simulationData.soilMoisture, 40, 'below')}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {simulationData.soilMoisture < 40 ? 'Below threshold' : 'Normal'}
            </span>
          </div>
        </div>
      </div>

      {/* Simulation History */}
      {simulationHistory.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Readings ({simulationHistory.length}/20)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Temperature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Humidity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Soil Moisture
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {simulationHistory.slice().reverse().map((reading, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(reading.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {reading.temperature}°C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {reading.humidity}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {reading.soilMoisture}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Simulation Alerts ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
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
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
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

export default Simulation;
