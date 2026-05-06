import React, { useState, useEffect } from 'react';
import DashboardCards from '../components/DashboardCards';
import { EnvironmentalChart, WateringChart, CropStatusChart } from '../components/Charts';
import {
  generateEnvironmentData,
  generateHistoricalData,
  generateWateringSchedules,
  generatePlantingSchedules,
} from '../utils/dataGenerator';
import { Activity, CheckCircle, Droplets, Sprout, Leaf } from 'lucide-react';

const WATERING_DATA = [
  { day: 'Mon', sessions: 2 },
  { day: 'Tue', sessions: 3 },
  { day: 'Wed', sessions: 1 },
  { day: 'Thu', sessions: 4 },
  { day: 'Fri', sessions: 2 },
  { day: 'Sat', sessions: 1 },
  { day: 'Sun', sessions: 3 },
];

const CROP_STATUS_DATA = [
  { status: 'Seeded',    count: 8 },
  { status: 'Growing',   count: 15 },
  { status: 'Harvested', count: 12 },
];

const RECENT_ACTIVITY = [
  { icon: Droplets,    label: 'Watering completed in Zone A',   time: '15 minutes ago', iconBg: 'bg-cyan-50',   iconColor: 'text-cyan-500',   bg: 'bg-cyan-50/60',   border: 'border-cyan-100'   },
  { icon: Sprout,      label: 'Tomato seeds planted in Zone B', time: '2 hours ago',    iconBg: 'bg-green-50',  iconColor: 'text-green-600',  bg: 'bg-green-50/60',  border: 'border-green-100'  },
  { icon: Activity,    label: 'Temperature alert triggered',    time: '3 hours ago',    iconBg: 'bg-amber-50',  iconColor: 'text-amber-500',  bg: 'bg-amber-50/60',  border: 'border-amber-100'  },
  { icon: CheckCircle, label: 'Harvest completed — Lettuce',   time: '5 hours ago',    iconBg: 'bg-primary-50',iconColor: 'text-primary-600',bg: 'bg-primary-50/60',border: 'border-primary-100'},
];

const Dashboard = () => {
  const [environmentData,   setEnvironmentData]   = useState(null);
  const [historicalData,    setHistoricalData]    = useState([]);
  const [wateringSchedules, setWateringSchedules] = useState([]);
  const [plantingSchedules, setPlantingSchedules] = useState([]);
  const [alerts,            setAlerts]            = useState([]);
  const [loading,           setLoading]           = useState(true);

  useEffect(() => {
    setEnvironmentData(generateEnvironmentData());
    setHistoricalData(generateHistoricalData(1));
    setWateringSchedules(generateWateringSchedules());
    setPlantingSchedules(generatePlantingSchedules());
    setAlerts([
      { id: 1, type: 'High Temperature', message: 'Temperature above 35°C detected',
        timestamp: new Date(Date.now() - 2 * 60_000).toISOString(), severity: 'high',  read: false },
      { id: 2, type: 'Watering Due',     message: 'Scheduled watering time approaching',
        timestamp: new Date(Date.now() - 5 * 60_000).toISOString(), severity: 'medium',read: false },
      { id: 3, type: 'Planting Due',     message: 'New planting scheduled for tomorrow',
        timestamp: new Date(Date.now() - 60 * 60_000).toISOString(), severity: 'low',  read: true },
    ]);
    setLoading(false);

    const interval = setInterval(() => setEnvironmentData(generateEnvironmentData()), 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 rounded-full border-2 border-primary-500
                        border-t-transparent animate-spin" />
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Hero header ── */}
      <div className="card p-6 overflow-hidden relative">
        {/* Accent blob */}
        <div className="absolute -right-16 -top-16 w-48 h-48
                        bg-primary-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32
                        bg-blue-100 rounded-full blur-xl opacity-40 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="h-4 w-4 text-primary-600" />
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                Smart Greenhouse
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a8a] tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-primary-700 font-semibold
                            bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-full w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse-slow" />
            Live Monitoring
          </span>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <DashboardCards
        environmentData={environmentData}
        alerts={alerts}
        wateringSchedules={wateringSchedules}
        plantingSchedules={plantingSchedules}
      />

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="lg:col-span-2">
          <EnvironmentalChart data={historicalData} />
        </div>
        <WateringChart   data={WATERING_DATA} />
        <CropStatusChart data={CROP_STATUS_DATA} />
      </div>

      {/* ── Recent Activity ── */}
      <div className="card p-6">
        <h2 className="text-sm font-bold text-[#1e3a8a] mb-4 uppercase tracking-wide">
          Recent Activity
        </h2>
        <div className="space-y-2.5">
          {RECENT_ACTIVITY.map(({ icon: Icon, label, time, iconBg, iconColor, bg, border }, i) => (
            <div key={i}
              className={`flex items-center gap-3 p-3.5 rounded-xl border ${bg} ${border}
                          transition-all duration-200 hover:brightness-98`}>
              <div className={`p-2 rounded-xl ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
