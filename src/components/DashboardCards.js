import React from 'react';
import {
  Thermometer, Droplets, Cloud, AlertTriangle,
  Clock, Sprout, TrendingUp, TrendingDown,
} from 'lucide-react';

const CARD_CONFIG = [
  {
    icon: Thermometer,
    iconBg:  'bg-orange-50',
    iconColor: 'text-orange-500',
    bar:     'from-orange-400 to-amber-400',
    badgeBg: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    icon: Cloud,
    iconBg:  'bg-blue-50',
    iconColor: 'text-blue-500',
    bar:     'from-blue-400 to-cyan-400',
    badgeBg: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: Droplets,
    iconBg:  'bg-cyan-50',
    iconColor: 'text-cyan-500',
    bar:     'from-cyan-400 to-teal-400',
    badgeBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  },
  {
    icon: Sprout,
    iconBg:  'bg-green-50',
    iconColor: 'text-green-600',
    bar:     'from-green-500 to-emerald-400',
    badgeBg: 'bg-green-50 text-green-700 border-green-100',
  },
  {
    icon: Clock,
    iconBg:  'bg-purple-50',
    iconColor: 'text-purple-500',
    bar:     'from-purple-400 to-violet-400',
    badgeBg: 'bg-purple-50 text-purple-600 border-purple-100',
  },
  {
    icon: AlertTriangle,
    iconBg:  'bg-red-50',
    iconColor: 'text-red-500',
    bar:     'from-red-400 to-rose-400',
    badgeBg: 'bg-red-50 text-red-600 border-red-100',
  },
];

const DashboardCards = ({ environmentData, alerts, wateringSchedules, plantingSchedules }) => {
  const activeAlerts = alerts?.filter(a => !a.read) ?? [];
  const nextWatering = wateringSchedules?.find(
    s => new Date(s.time) > new Date() && s.status === 'pending'
  );
  const activePlants = plantingSchedules?.filter(
    p => p.status === 'growing' || p.status === 'seeded'
  ).length ?? 0;

  const temp     = environmentData?.temperature  ?? 0;
  const humidity = environmentData?.humidity     ?? 0;
  const moisture = environmentData?.soilMoisture ?? 0;

  const cards = [
    {
      title:  'Temperature',
      value:  `${temp.toFixed(1)}°C`,
      status: temp > 35 ? 'Above limit' : 'Normal',
      ok:     temp <= 35,
      trend:  temp > 35 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />,
    },
    {
      title:  'Humidity',
      value:  `${humidity.toFixed(0)}%`,
      status: humidity > 80 ? 'High' : 'Optimal',
      ok:     humidity <= 80,
      trend:  humidity > 80 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />,
    },
    {
      title:  'Soil Moisture',
      value:  `${moisture.toFixed(0)}%`,
      status: moisture < 40 ? 'Low — needs water' : 'Good',
      ok:     moisture >= 40,
      trend:  moisture < 40 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />,
    },
    {
      title:  'Active Plants',
      value:  activePlants,
      status: 'Currently growing',
      ok:     true,
      trend:  <TrendingUp className="h-3.5 w-3.5" />,
    },
    {
      title:  'Next Watering',
      value:  nextWatering
        ? `${Math.round((new Date(nextWatering.time) - Date.now()) / 3_600_000)}h`
        : '—',
      status: nextWatering ? 'Scheduled' : 'None today',
      ok:     !!nextWatering,
      trend:  <Clock className="h-3.5 w-3.5" />,
    },
    {
      title:  'Active Alerts',
      value:  activeAlerts.length,
      status: activeAlerts.length > 0 ? 'Needs attention' : 'All clear',
      ok:     activeAlerts.length === 0,
      trend:  activeAlerts.length > 0
        ? <TrendingUp className="h-3.5 w-3.5" />
        : <TrendingDown className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card, i) => {
        const cfg  = CARD_CONFIG[i];
        const Icon = cfg.icon;
        return (
          <div key={i} className="card-hover p-5 overflow-hidden">
            {/* Subtle top gradient accent */}
            <div className={`h-1 w-full bg-gradient-to-r ${cfg.bar} rounded-full mb-4`} />

            <div className="flex items-start justify-between">
              {/* Left: icon + value */}
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${cfg.iconBg}`}>
                  <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-[#1e3a8a] mt-0.5 leading-none">
                    {card.value}
                  </p>
                </div>
              </div>

              {/* Right: badge + trend */}
              <div className="flex flex-col items-end gap-1.5">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full
                                   text-[10px] font-semibold border ${cfg.badgeBg}`}>
                  {card.status}
                </span>
                <div className={`flex items-center gap-1 text-xs font-medium
                                  ${card.ok ? 'text-green-600' : 'text-red-500'}`}>
                  {card.trend}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
