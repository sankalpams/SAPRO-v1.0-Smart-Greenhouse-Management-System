import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Calendar, BarChart3, TrendingUp, FileText, FileDown } from 'lucide-react';
import { generateWeeklyReport, generateMonthlyReport, exportToCSV, exportChartToPDF, exportChartDataToCSV, computePlantSummaryData } from '../utils/reportUtils';
import { generateHistoricalData, generateWateringSchedules, generatePlantingSchedules } from '../utils/dataGenerator';
import { getPlantingSchedules } from '../firebase/firestore';
import {
  getCropStatusPieData,
  getCropStatusBarData,
  getCropGrowthTimelineData,
  getPlantingHarvestScatterData,
  getCropsByZoneData
} from '../utils/reportUtils';
import CropStatusPie from '../components/reports/CropStatusPie';
import CropStatusBar from '../components/reports/CropStatusBar';
import CropStatusLine from '../components/reports/CropStatusLine';
import CropStatusScatter from '../components/reports/CropStatusScatter';
import CropStatusHorizontalBar from '../components/reports/CropStatusHorizontalBar';
import PlantSummaryCards from '../components/PlantSummaryCards';
import PlantStatusPieChart from '../components/PlantStatusPieChart';
import CropBarChart from '../components/CropBarChart';
import PlantSummaryTable from '../components/PlantSummaryTable';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';

const Reports = () => {
  const [reportType, setReportType] = useState('weekly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plantingSchedules, setPlantingSchedules] = useState([]);
  const [chartType, setChartType] = useState('pie'); // pie, bar, line, scatter, horizontal
  const chartRef = useRef(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [chartData, setChartData] = useState({
    environmental: [],
    watering: [],
    cropStatus: []
  });
  const [plantSummaryData, setPlantSummaryData] = useState(null);

  // Load planting schedules from Firestore
  const loadPlantingSchedules = useCallback(async () => {
    try {
      const result = await getPlantingSchedules();
      if (result.success && result.data) {
        setPlantingSchedules(result.data);
      } else {
        // Fallback to mock data if Firestore fails
        console.warn('Firestore data unavailable, using mock data');
        setPlantingSchedules(generatePlantingSchedules());
      }
    } catch (error) {
      console.error('Error loading planting schedules:', error);
      // Fallback to mock data
      setPlantingSchedules(generatePlantingSchedules());
    }
  }, []);

  const generateReport = useCallback(async () => {
    setLoading(true);
    try {
      // Generate sample data
      const environmentData = generateHistoricalData(30);
      const wateringSchedules = generateWateringSchedules();
      
      // Use Firestore data if available, otherwise use mock data
      const schedules = plantingSchedules.length > 0 ? plantingSchedules : generatePlantingSchedules();

      let report;
      if (reportType === 'weekly') {
        report = generateWeeklyReport(environmentData, wateringSchedules, schedules);
      } else {
        report = generateMonthlyReport(environmentData, wateringSchedules, schedules);
      }

      setReportData(report);
      
      // Generate chart data
      generateChartData(environmentData, wateringSchedules, schedules);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  }, [reportType, plantingSchedules]);

  const generateChartData = (environmentData, wateringSchedules, plantingSchedules) => {
    // Environmental trends chart data
    const envChartData = environmentData.slice(-7).map(item => ({
      date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      temperature: item.temperature,
      humidity: item.humidity,
      soilMoisture: item.soilMoisture
    }));

    // Watering sessions chart data
    const wateringChartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const daySchedules = wateringSchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.time);
        return scheduleDate.toDateString() === date.toDateString();
      });
      
      wateringChartData.push({
        day: dayName,
        sessions: daySchedules.length
      });
    }

    // Crop status pie chart data
    const cropStatusData = [
      { name: 'Seeded', value: plantingSchedules.filter(p => p.status === 'seeded').length, color: '#3b82f6' },
      { name: 'Growing', value: plantingSchedules.filter(p => p.status === 'growing').length, color: '#10b981' },
      { name: 'Harvested', value: plantingSchedules.filter(p => p.status === 'harvested').length, color: '#f59e0b' }
    ];

    setChartData({
      environmental: envChartData,
      watering: wateringChartData,
      cropStatus: cropStatusData
    });
  };

  useEffect(() => {
    loadPlantingSchedules();
  }, [loadPlantingSchedules]);

  useEffect(() => {
    if (plantingSchedules.length > 0) {
      generateReport();
      // Compute plant summary data
      const summaryData = computePlantSummaryData(plantingSchedules);
      setPlantSummaryData(summaryData);
    } else {
      setPlantSummaryData(null);
    }
  }, [generateReport, plantingSchedules]);

  const handleExport = () => {
    if (reportData) {
      const csvData = [
        {
          'Report Type': reportData.period,
          'Average Temperature': `${reportData.environment.avgTemperature}°C`,
          'Average Humidity': `${reportData.environment.avgHumidity}%`,
          'Average Soil Moisture': `${reportData.environment.avgMoisture}%`,
          'Total Watering Sessions': reportData.watering.totalSessions,
          'Completed Sessions': reportData.watering.completedSessions,
          'Total Plantings': reportData.planting.totalPlantings
        }
      ];
      exportToCSV(csvData, `greenhouse-report-${reportType}`);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Generate comprehensive reports on greenhouse performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Report Configuration
          </h3>
          <button
            onClick={generateReport}
            className="btn-primary flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-field"
            >
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Average Temperature"
              value={`${reportData.environment.avgTemperature}°C`}
              icon={TrendingUp}
              color="bg-red-500"
              subtitle={`Range: ${reportData.environment.tempRange.min}°C - ${reportData.environment.tempRange.max}°C`}
            />
            <StatCard
              title="Average Humidity"
              value={`${reportData.environment.avgHumidity}%`}
              icon={BarChart3}
              color="bg-blue-500"
              subtitle={`Range: ${reportData.environment.humidityRange.min}% - ${reportData.environment.humidityRange.max}%`}
            />
            <StatCard
              title="Average Soil Moisture"
              value={`${reportData.environment.avgMoisture}%`}
              icon={FileText}
              color="bg-green-500"
              subtitle={`Range: ${reportData.environment.moistureRange.min}% - ${reportData.environment.moistureRange.max}%`}
            />
            <StatCard
              title="Watering Sessions"
              value={reportData.watering.totalSessions}
              icon={Calendar}
              color="bg-purple-500"
              subtitle={`${reportData.watering.completedSessions} completed`}
            />
          </div>

          {/* Detailed Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Environmental Summary */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Environmental Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Temperature Range</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {reportData.environment.tempRange.min}°C - {reportData.environment.tempRange.max}°C
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Humidity Range</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {reportData.environment.humidityRange.min}% - {reportData.environment.humidityRange.max}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Soil Moisture Range</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {reportData.environment.moistureRange.min}% - {reportData.environment.moistureRange.max}%
                  </span>
                </div>
              </div>
            </div>

            {/* Watering Summary */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Watering Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Sessions</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {reportData.watering.totalSessions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-medium text-green-600">
                    {reportData.watering.completedSessions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Pending</span>
                  <span className="font-medium text-yellow-600">
                    {reportData.watering.pendingSessions}
                  </span>
                </div>
                {reportData.watering.avgSessionsPerWeek && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Avg per Week</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {reportData.watering.avgSessionsPerWeek}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Environmental Trends Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Environmental Trends (Last 7 Days)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.environmental}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        const unit = name === 'temperature' ? '°C' : '%';
                        return [`${value}${unit}`, name];
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Temperature"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Humidity"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="soilMoisture" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Soil Moisture"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Watering Sessions Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Watering Sessions (Last 7 Days)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.watering}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" fill="#0ea5e9" name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Crop Status Charts Section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Crop Status Distribution
              </h3>
              <div className="flex items-center space-x-3">
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="pie">Pie Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="scatter">Scatter Chart</option>
                  <option value="horizontal">Horizontal Bar (Zones)</option>
                </select>
                <button
                  onClick={() => {
                    if (chartRef.current) {
                      const chartTypeNames = {
                        pie: 'crop-status-pie',
                        bar: 'crop-status-bar',
                        line: 'crop-status-line',
                        scatter: 'crop-status-scatter',
                        horizontal: 'crop-status-zones'
                      };
                      exportChartToPDF(chartRef.current, chartTypeNames[chartType]);
                    }
                  }}
                  className="btn-secondary flex items-center space-x-2 text-sm"
                  title="Export to PDF"
                >
                  <FileDown className="h-4 w-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => {
                    let dataToExport = [];
                    const filename = `crop-status-${chartType}`;
                    
                    switch(chartType) {
                      case 'pie':
                        dataToExport = getCropStatusPieData(plantingSchedules);
                        exportChartDataToCSV(dataToExport, filename, ['name', 'count', 'value']);
                        break;
                      case 'bar':
                        dataToExport = getCropStatusBarData(plantingSchedules);
                        exportChartDataToCSV(dataToExport, filename, ['status', 'count']);
                        break;
                      case 'line':
                        dataToExport = getCropGrowthTimelineData(plantingSchedules);
                        exportChartDataToCSV(dataToExport, filename, ['date', 'activeCrops', 'formattedDate']);
                        break;
                      case 'scatter':
                        dataToExport = getPlantingHarvestScatterData(plantingSchedules);
                        exportChartDataToCSV(dataToExport, filename, ['crop', 'zone', 'plantedDate', 'daysToHarvest']);
                        break;
                      case 'horizontal':
                        dataToExport = getCropsByZoneData(plantingSchedules);
                        exportChartDataToCSV(dataToExport, filename, ['zone', 'count']);
                        break;
                      default:
                        break;
                    }
                  }}
                  className="btn-secondary flex items-center space-x-2 text-sm"
                  title="Export to CSV"
                >
                  <Download className="h-4 w-4" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
            <div className="h-96" ref={chartRef}>
              {(() => {
                const schedules = plantingSchedules.length > 0 ? plantingSchedules : [];
                
                if (schedules.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 dark:text-gray-400">No data available</p>
                    </div>
                  );
                }

                switch(chartType) {
                  case 'pie':
                    return <CropStatusPie data={getCropStatusPieData(schedules)} />;
                  case 'bar':
                    return <CropStatusBar data={getCropStatusBarData(schedules)} />;
                  case 'line':
                    return <CropStatusLine data={getCropGrowthTimelineData(schedules)} />;
                  case 'scatter':
                    return <CropStatusScatter data={getPlantingHarvestScatterData(schedules)} />;
                  case 'horizontal':
                    return <CropStatusHorizontalBar data={getCropsByZoneData(schedules)} />;
                  default:
                    return <CropStatusPie data={getCropStatusPieData(schedules)} />;
                }
              })()}
            </div>
          </div>
        </>
      )}

      {/* Plant Summary Report Section */}
      {plantSummaryData && (
        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Plant Summary Report
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Comprehensive analytics and insights on all planting records
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <PlantSummaryCards data={plantSummaryData} />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crop Status Distribution Pie Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Crop Status Distribution
              </h3>
              <div className="h-80">
                <PlantStatusPieChart data={plantSummaryData} />
              </div>
            </div>

            {/* Crop Count by Type Bar Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Crop Count by Type
              </h3>
              <div className="h-80">
                <CropBarChart data={plantSummaryData} />
              </div>
            </div>
          </div>

          {/* Plant Summary Table */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Plant Summary Table
            </h3>
            <PlantSummaryTable data={plantSummaryData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
