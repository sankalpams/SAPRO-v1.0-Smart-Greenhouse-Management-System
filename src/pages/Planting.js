import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Sprout, TrendingUp } from 'lucide-react';
import CalendarView from '../components/CalendarView';
import { generatePlantingSchedules } from '../utils/dataGenerator';

const Planting = () => {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    crop: '',
    plantedDate: '',
    harvestDate: '',
    status: 'seeded',
    zone: '',
    quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('table'); // 'table' or 'calendar'

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const data = generatePlantingSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading planting schedules:', error);
    } finally {
      setLoading(false);
    }
  };

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
    setFormData({ crop: '', plantedDate: '', harvestDate: '', status: 'seeded', zone: '', quantity: '' });
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData(schedule);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  // const handleStatusChange = (id, status) => {
  //   setSchedules(schedules.map(schedule => 
  //     schedule.id === id 
  //       ? { ...schedule, status }
  //       : schedule
  //   ));
  // };

  const handleAddSchedule = (date) => {
    setFormData({
      ...formData,
      plantedDate: date.toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      seeded: 'status-seeded',
      growing: 'status-growing',
      harvested: 'status-harvested'
    };
    
    return `status-badge ${statusClasses[status] || 'status-seeded'}`;
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

  const getGrowthProgress = (plantedDate, harvestDate, status) => {
    if (status === 'harvested') return 100;
    if (status === 'seeded') return 10;
    
    const planted = new Date(plantedDate);
    const harvest = new Date(harvestDate);
    const now = new Date();
    
    const totalDays = (harvest - planted) / (1000 * 60 * 60 * 24);
    const daysPassed = (now - planted) / (1000 * 60 * 60 * 24);
    
    return Math.min(Math.max((daysPassed / totalDays) * 100, 10), 90);
  };

  const cropStats = {
    total: schedules.length,
    seeded: schedules.filter(s => s.status === 'seeded').length,
    growing: schedules.filter(s => s.status === 'growing').length,
    harvested: schedules.filter(s => s.status === 'harvested').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🌱 Planting Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage planting schedules and track crop growth
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === 'table' 
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📊 Table View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === 'calendar' 
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Calendar View
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            <span className="font-semibold">➕ Add Planting</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Sprout className="h-7 w-7 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                🌾 Total Crops
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {cropStats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="h-7 w-7 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                📈 Growing
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {cropStats.growing}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Sprout className="h-7 w-7 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                🌱 Seeded
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {cropStats.seeded}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Calendar className="h-7 w-7 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                ✅ Harvested
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {cropStats.harvested}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on view */}
      {view === 'calendar' ? (
        <CalendarView
          schedules={schedules}
          onDateClick={(date) => console.log('Date clicked:', date)}
          onAddSchedule={handleAddSchedule}
        />
      ) : (
        /* Table View */
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Planting Schedules
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
                      Crop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Planted Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Harvest Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Progress
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
                  {schedules.map((schedule) => {
                    const progress = getGrowthProgress(schedule.plantedDate, schedule.harvestDate, schedule.status);
                    return (
                      <tr key={schedule.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <Sprout className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {schedule.crop}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Qty: {schedule.quantity}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getZoneColor(schedule.zone)}`}>
                            Zone {schedule.zone}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(schedule.plantedDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(schedule.harvestDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(schedule.status)}>
                            {schedule.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(schedule.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md shadow-2xl rounded-lg bg-white dark:bg-gray-800 p-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingSchedule ? '✏️ Edit Planting' : '➕ Add New Planting'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🌱 Crop Name
                  </label>
                  <input
                    type="text"
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Tomato, Lettuce, Cucumber"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📍 Zone
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
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📅 Planted Date
                  </label>
                  <input
                    type="date"
                    value={formData.plantedDate}
                    onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🌾 Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🔢 Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="input-field"
                    placeholder="Number of plants"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📊 Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="seeded">Seeded</option>
                    <option value="growing">Growing</option>
                    <option value="harvested">Harvested</option>
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingSchedule(null);
                      setFormData({ crop: '', plantedDate: '', harvestDate: '', status: 'seeded', zone: '', quantity: '' });
                    }}
                    className="btn-secondary px-6"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary px-6">
                    {editingSchedule ? '✓ Update' : '➕ Add'} Planting
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

export default Planting;
