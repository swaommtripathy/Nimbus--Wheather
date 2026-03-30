import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import styles from './Charts.module.css';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} className={styles.tooltipRow} style={{ color: p.color }}>
          <span>{p.name}</span>
          <span className={styles.tooltipVal}>{p.value}°{unit === 'imperial' ? 'F' : 'C'}</span>
        </div>
      ))}
    </div>
  );
};

export function TemperatureChart({ hourlyData, unit }) {
  return (
    <div className={styles.chartWrap}>
      <h3 className={styles.chartTitle}>Hourly Temperature</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={hourlyData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#63b3ed" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#63b3ed" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4fd1c5" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4fd1c5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" tick={{ fill: '#8896b3', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8896b3', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans', color: '#8896b3' }} />
          <Area type="monotone" dataKey="temp" name="Temp" stroke="#63b3ed" strokeWidth={2} fill="url(#tempGrad)" dot={false} activeDot={{ r: 5, fill: '#63b3ed' }} />
          <Area type="monotone" dataKey="feelsLike" name="Feels Like" stroke="#4fd1c5" strokeWidth={1.5} fill="url(#feelsGrad)" strokeDasharray="4 2" dot={false} activeDot={{ r: 4, fill: '#4fd1c5' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DailyTempChart({ dailyData, unit }) {
  const chartData = dailyData.map((d) => ({
    day: d.date.slice(5), // MM-DD
    max: d.maxTemp,
    min: d.minTemp,
  }));

  return (
    <div className={styles.chartWrap}>
      <h3 className={styles.chartTitle}>Daily High / Low</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f6ad55" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f6ad55" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#63b3ed" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#63b3ed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" tick={{ fill: '#8896b3', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8896b3', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans', color: '#8896b3' }} />
          <Area type="monotone" dataKey="max" name="High" stroke="#f6ad55" strokeWidth={2} fill="url(#maxGrad)" dot={{ fill: '#f6ad55', r: 3 }} activeDot={{ r: 5 }} />
          <Area type="monotone" dataKey="min" name="Low" stroke="#63b3ed" strokeWidth={2} fill="url(#minGrad)" dot={{ fill: '#63b3ed', r: 3 }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
