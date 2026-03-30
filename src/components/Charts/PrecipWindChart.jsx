import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import styles from './Charts.module.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} className={styles.tooltipRow} style={{ color: p.color }}>
          <span>{p.name}</span>
          <span className={styles.tooltipVal}>{p.value}{p.unit || ''}</span>
        </div>
      ))}
    </div>
  );
};

export function PrecipitationChart({ hourlyData }) {
  const chartData = hourlyData.map((h) => ({
    time: h.time,
    chance: h.pop,
  }));

  return (
    <div className={styles.chartWrap}>
      <h3 className={styles.chartTitle}>Precipitation Chance (%)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#63b3ed" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#4fd1c5" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: '#8896b3', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} interval={3} />
          <YAxis domain={[0, 100]} tick={{ fill: '#8896b3', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="chance" name="Rain chance" fill="url(#precipGrad)" radius={[4, 4, 0, 0]} unit="%" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WindChart({ hourlyData }) {
  const chartData = hourlyData.map((h) => ({
    time: h.time,
    wind: h.windSpeed,
  }));

  return (
    <div className={styles.chartWrap}>
      <h3 className={styles.chartTitle}>Wind Speed (km/h)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="windGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b794f4" />
              <stop offset="100%" stopColor="#63b3ed" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" tick={{ fill: '#8896b3', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} interval={3} />
          <YAxis tick={{ fill: '#8896b3', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="wind"
            name="Wind"
            stroke="#b794f4"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#b794f4', strokeWidth: 0 }}
            unit=" km/h"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
