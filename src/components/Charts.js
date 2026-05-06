import React from 'react';
import {
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
} from 'recharts';

/* ─── Custom Tooltip (light theme) ──────────────── */
const CustomTooltip = ({ active, payload, label, labelFormatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-blue-100 rounded-xl px-3 py-2.5
                    shadow-card text-xs">
      <p className="text-slate-400 mb-1.5">
        {labelFormatter ? labelFormatter(label) : label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: entry.color }} />
          <span className="text-slate-500 capitalize">{entry.name}:</span>
          <span className="text-[#1e3a8a] font-bold ml-auto pl-3">
            {entry.value}{entry.unit ?? ''}
          </span>
        </div>
      ))}
    </div>
  );
};

const axisStyle = { fill: '#94a3b8', fontSize: 11 };
const gridStyle = { stroke: '#eff6ff', strokeDasharray: '3 3' };

const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

/* ─── Generic chart ──────────────────────────────── */
const Charts = ({ data, type = 'line', title, dataKey, color = '#16a34a' }) => {
  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="timestamp" tickFormatter={fmtTime} tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip labelFormatter={(l) => new Date(l).toLocaleString()} />} />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
                  fill={`url(#grad-${dataKey})`} dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="timestamp" tickFormatter={fmtTime} tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip labelFormatter={(l) => new Date(l).toLocaleString()} />} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
                  dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        );
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-[#1e3a8a] mb-5">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ─── Environmental multi-line ───────────────────── */
export const EnvironmentalChart = ({ data, zone = 'A' }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
      <h3 className="text-sm font-semibold text-[#1e3a8a]">
        Environmental Trends — Zone {zone}
      </h3>
      <div className="flex items-center gap-4 text-[11px]">
        {[
          { label: 'Temperature', color: '#f97316' },
          { label: 'Humidity',    color: '#06b6d4' },
          { label: 'Soil Moisture', color: '#22c55e' },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-5 rounded-full" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey="timestamp" tickFormatter={fmtTime} tick={axisStyle} />
          <YAxis yAxisId="left"  tick={axisStyle} />
          <YAxis yAxisId="right" orientation="right" tick={axisStyle} />
          <Tooltip content={<CustomTooltip labelFormatter={(l) => new Date(l).toLocaleString()} />} />
          <Line yAxisId="left"  type="monotone" dataKey="temperature"
                stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Temperature" />
          <Line yAxisId="right" type="monotone" dataKey="humidity"
                stroke="#06b6d4" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Humidity" />
          <Line yAxisId="right" type="monotone" dataKey="soilMoisture"
                stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Soil Moisture" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

/* ─── Watering bar chart ─────────────────────────── */
export const WateringChart = ({ data }) => (
  <div className="card p-6">
    <h3 className="text-sm font-semibold text-[#1e3a8a] mb-5">
      Watering Sessions — Last 7 Days
    </h3>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={28}>
          <defs>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#06b6d4" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#0e7490" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey="day" tick={axisStyle} />
          <YAxis tick={axisStyle} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="sessions" fill="url(#waterGrad)" radius={[6, 6, 0, 0]} name="Sessions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

/* ─── Crop status bar chart ──────────────────────── */
export const CropStatusChart = ({ data }) => (
  <div className="card p-6">
    <h3 className="text-sm font-semibold text-[#1e3a8a] mb-5">
      Crop Status Distribution
    </h3>
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={32}>
          <defs>
            <linearGradient id="cropGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="#22c55e" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#15803d" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey="status" tick={axisStyle} />
          <YAxis tick={axisStyle} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="url(#cropGrad)" radius={[6, 6, 0, 0]} name="Plants" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default Charts;
