import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

const CalendarView = ({ schedules, onDateClick, onAddSchedule }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getSchedulesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => 
      schedule.plantedDate === dateStr || 
      schedule.harvestDate === dateStr ||
      (schedule.time && new Date(schedule.time).toISOString().split('T')[0] === dateStr)
    );
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const daySchedules = getSchedulesForDate(date);
      if (daySchedules.length > 0) {
        return (
          <div className="flex flex-wrap gap-1 justify-center mt-1">
            {daySchedules.slice(0, 3).map((schedule, index) => {
              const type = getScheduleType(schedule);
              return (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full ${
                    type === 'planting' ? 'bg-green-500' :
                    type === 'watering' ? 'bg-blue-500' :
                    'bg-orange-500'
                  }`}
                  title={`${schedule.crop || 'Schedule'} - ${schedule.status}`}
                />
              );
            })}
            {daySchedules.length > 3 && (
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400" title={`+${daySchedules.length - 3} more`} />
            )}
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const daySchedules = getSchedulesForDate(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];
      
      // Check if today
      const isToday = dateStr === todayStr;
      
      // Build class name based on schedules and date
      let classes = [];
      
      if (isToday) {
        classes.push('!bg-blue-500 !text-white border-2 border-blue-600');
      } else if (daySchedules.length > 0) {
        classes.push('!bg-green-100 dark:!bg-green-900/30');
      }
      
      return classes.length > 0 ? classes.join(' ') : null;
    }
    return null;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScheduleType = (schedule) => {
    if (schedule.crop) return 'planting';
    if (schedule.zone) return 'watering';
    return 'other';
  };

  const getScheduleColor = (type) => {
    switch (type) {
      case 'planting':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'watering':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const selectedDateSchedules = getSchedulesForDate(selectedDate);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Schedule Calendar
        </h3>
        <button
          onClick={() => onAddSchedule(selectedDate)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Schedule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            className="react-calendar w-full"
            prevLabel={<ChevronLeft className="h-4 w-4" />}
            nextLabel={<ChevronRight className="h-4 w-4" />}
          />
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {formatDate(selectedDate)}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedDateSchedules.length} schedule(s)
            </p>
          </div>

          {selectedDateSchedules.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedDateSchedules.map((schedule, index) => {
                const type = getScheduleType(schedule);
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 ${getScheduleColor(type)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">
                          {schedule.crop || `Zone ${schedule.zone}`}
                        </p>
                        <div className="text-xs space-y-1">
                          {schedule.plantedDate && (
                            <p className="opacity-75">
                              🌱 Planted: {new Date(schedule.plantedDate).toLocaleDateString()}
                            </p>
                          )}
                          {schedule.harvestDate && (
                            <p className="opacity-75">
                              📅 Harvest: {new Date(schedule.harvestDate).toLocaleDateString()}
                            </p>
                          )}
                          {schedule.time && (
                            <p className="opacity-75">
                              ⏰ Time: {new Date(schedule.time).toLocaleTimeString()}
                            </p>
                          )}
                          {schedule.zone && (
                            <p className="opacity-75">
                              📍 Zone: {schedule.zone}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ml-2 ${
                        schedule.status === 'completed' ? 'bg-green-600 text-white' :
                        schedule.status === 'pending' ? 'bg-yellow-600 text-white' :
                        schedule.status === 'harvested' ? 'bg-purple-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {schedule.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                📅 No schedules for this date
              </p>
              <button
                onClick={() => onAddSchedule(selectedDate)}
                className="btn-secondary text-sm mt-4"
              >
                Add Schedule
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
