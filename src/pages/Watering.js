import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Play, Edit, Trash2, Clock, Droplets } from 'lucide-react';
import { generateWateringSchedules } from '../utils/dataGenerator';
import { WateringChart } from '../components/Charts';
import { useAlerts } from '../context/AlertContext';
import useToast from '../utils/useToast';

const Watering = () => {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    zone: '',
    time: '',
    duration: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [wateringChartData, setWateringChartData] = useState([]);
  const { addAlert } = useAlerts();
  const { showToast, ToastRenderer } = useToast();

  const generateWateringChartData = useCallback(() => {
    const chartData = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const daySchedules = schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.time);
        return scheduleDate.toDateString() === date.toDateString();
      });
      
      chartData.push({
        day: dayName,
        sessions: daySchedules.length
      });
    }
    
    setWateringChartData(chartData);
  }, [schedules]);

  const checkMissedSchedules = useCallback(() => {
    const now = new Date();
    const missedSchedules = schedules.filter(schedule => {
      const scheduleTime = new Date(schedule.time);
      return schedule.status === 'pending' && scheduleTime < now;
    });

    if (missedSchedules.length > 0) {
      missedSchedules.forEach(schedule => {
        const alert = {
          type: 'Missed Watering',
          message: `Watering schedule for Zone ${schedule.zone} was missed at ${new Date(schedule.time).toLocaleString()}`,
          severity: 'high'
        };
        addAlert(alert);
      });
    }
  }, [schedules, addAlert]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = generateWateringSchedules();
        setSchedules(data);
        setTimeout(() => {
          generateWateringChartData();
        }, 100);
      } catch (error) {
        console.error('Error loading watering schedules:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Check for missed watering schedules every minute
    const interval = setInterval(checkMissedSchedules, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSchedule) {
      // Update existing schedule
      setSchedules(schedules.map(schedule => 
        schedule.id === editingSchedule.id 
          ? { ...schedule, ...formData }
          : schedule
      ));
    } else {
      // Add new schedule
      const newSchedule = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setSchedules([...schedules, newSchedule]);
    }
    setShowModal(false);
    setEditingSchedule(null);
    setFormData({ zone: '', time: '', duration: '', status: 'pending' });
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData(schedule);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule && window.confirm(`Are you sure you want to delete the watering schedule for Zone ${schedule.zone}?`)) {
      setSchedules(schedules.filter(schedule => schedule.id !== id));
      showToast(`Schedule deleted successfully for Zone ${schedule.zone}`, 'success');
      // Update chart data after deletion
      setTimeout(() => {
        generateWateringChartData();
      }, 100);
    }
  };

  // const handleStatusChange = (id, status) => {
  //   setSchedules(schedules.map(schedule => 
  //     schedule.id === id 
  //       ? { ...schedule, status }
  //       : schedule
  //   ));
  // };

  const simulateWatering = (id) => {
    const schedule = schedules.find(s => s.id === id);
    // Update status to in-progress first, then completed
    setSchedules(schedules.map(schedule => 
      schedule.id === id 
        ? { ...schedule, status: 'in-progress' }
        : schedule
    ));
    
    showToast(`Starting watering for Zone ${schedule.zone}...`, 'success');
    
    // Simulate watering completion after a short delay
    setTimeout(() => {
      setSchedules(prevSchedules => prevSchedules.map(schedule => 
        schedule.id === id 
          ? { ...schedule, status: 'completed' }
          : schedule
      ));
      
      showToast(`Watering completed for Zone ${schedule.zone}`, 'success');
      
      // Update chart data
      setTimeout(() => {
        generateWateringChartData();
      }, 100);
    }, 2000);
  };

  const simulateWateringNow = () => {
    const newSchedule = {
      id: Date.now(),
      zone: 'A',
      time: new Date().toISOString(),
      duration: '15min',
      status: 'completed',
      createdAt: new Date().toISOString(),
      isManual: true
    };
    setSchedules([newSchedule, ...schedules]);
    showToast('Watering simulated successfully', 'success');
    
    // Update chart data after adding new schedule
    setTimeout(() => {
      generateWateringChartData();
    }, 100);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      'in-progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    
    if (status === 'in-progress') {
      return `status-badge ${statusClasses[status]}`;
    }
    
    return `status-badge ${statusClasses[status] || 'status-pending'}`;
  };

  const getZoneColor = (zone) => {
    const colors = {
      A: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      B: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      C: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      D: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };
    return colors[zone] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  return (
    <div className="space-y-6">
      <ToastRenderer />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Watering Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage watering schedules and monitor irrigation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={simulateWateringNow}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>Simulate Watering</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Schedules
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {schedules.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Droplets className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {schedules.filter(s => s.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {schedules.filter(s => s.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Droplets className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today's Sessions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {schedules.filter(s => {
                  const today = new Date().toISOString().split('T')[0];
                  return new Date(s.time).toISOString().split('T')[0] === today;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Watering Chart */}
      <WateringChart data={wateringChartData} />

      {/* Schedules Table */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Watering Schedules
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getZoneColor(schedule.zone)}`}>
                        Zone {schedule.zone}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(schedule.time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {schedule.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(schedule.status)}>
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {schedule.status === 'pending' && (
                          <button
                            onClick={() => simulateWatering(schedule.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            title="Start Watering"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {schedule.status === 'in-progress' && (
                          <div className="flex items-center text-yellow-600">
                            <div className="animate-spin h-3 w-3 border-2 border-yellow-600 border-t-transparent rounded-full mr-2"></div>
                            <span className="text-xs">In Progress...</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Edit"
                          disabled={schedule.status === 'completed'}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Zone
                  </label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Zone</option>
                    <option value="A">Zone A</option>
                    <option value="B">Zone B</option>
                    <option value="C">Zone C</option>
                    <option value="D">Zone D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Duration</option>
                    <option value="5min">5 minutes</option>
                    <option value="10min">10 minutes</option>
                    <option value="15min">15 minutes</option>
                    <option value="20min">20 minutes</option>
                    <option value="30min">30 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSchedule(null);
                      setFormData({ zone: '', time: '', duration: '', status: 'pending' });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingSchedule ? 'Update' : 'Add'} Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watering;
