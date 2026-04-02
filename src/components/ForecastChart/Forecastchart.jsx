import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { WEATHER_ICONS_URL } from '../../config/constants';
import styles from './Forecastchart.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_FORMAT = (dt) =>
  new Date(dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
const DAY_FORMAT  = (dt) => DAY_LABELS[new Date(dt * 1000).getDay()];

/** Group the flat 3-hour list into daily buckets */
function groupByDay(list) {
  const map = {};
  list.forEach((item) => {
    const key = new Date(item.dt * 1000).toDateString();
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });
  return Object.values(map).slice(0, 5); // max 5 days
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTime}>{d.time}</p>
      <p className={styles.tooltipTemp}>{d.temp}°</p>
      <p className={styles.tooltipDesc}>{d.desc}</p>
      <div className={styles.tooltipMeta}>
        <span>💧 {d.humidity}%</span>
        <span>💨 {d.wind} m/s</span>
      </div>
    </div>
  );
}

// ─── Daily Summary Card ────────────────────────────────────────────────────────

function DayCard({ items, isActive, onClick, index }) {
  const temps   = items.map((i) => i.main.temp);
  const maxTemp = Math.round(Math.max(...temps));
  const minTemp = Math.round(Math.min(...temps));
  const midItem = items[Math.floor(items.length / 2)];
  const icon    = midItem.weather[0]?.icon;
  const label   = index === 0 ? 'Today' : DAY_FORMAT(midItem.dt);

  return (
    <button
      className={`${styles.dayCard} ${isActive ? styles.dayCardActive : ''}`}
      onClick={onClick}
      style={{ animationDelay: `${index * 0.06}s` }}
      aria-pressed={isActive}
    >
      <span className={styles.dayLabel}>{label}</span>
      <img
        src={WEATHER_ICONS_URL(icon)}
        alt={midItem.weather[0]?.description}
        className={styles.dayIcon}
      />
      <span className={styles.dayMax}>{maxTemp}°</span>
      <span className={styles.dayMin}>{minTemp}°</span>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ForecastChart({ data }) {
  const [activeDay, setActiveDay] = useState(0);
  const [view,      setView]      = useState('temp'); // 'temp' | 'humidity' | 'wind'

  const days = useMemo(() => groupByDay(data?.list ?? []), [data]);

  const chartData = useMemo(() => {
    if (!days[activeDay]) return [];
    return days[activeDay].map((item) => ({
      time:     HOUR_FORMAT(item.dt),
      temp:     Math.round(item.main.temp),
      humidity: item.main.humidity,
      wind:     Math.round(item.wind.speed),
      desc:     item.weather[0]?.description ?? '',
      icon:     item.weather[0]?.icon ?? '',
    }));
  }, [days, activeDay]);

  if (!data || days.length === 0) return null;

  const viewConfig = {
    temp:     { key: 'temp',     label: 'Temp °C',   color: '#63b3ed', gradStart: 'rgba(99,179,237,0.3)',  gradEnd: 'rgba(99,179,237,0.02)'  },
    humidity: { key: 'humidity', label: 'Humidity %', color: '#4fd1c5', gradStart: 'rgba(79,209,197,0.3)',  gradEnd: 'rgba(79,209,197,0.02)'  },
    wind:     { key: 'wind',     label: 'Wind m/s',   color: '#b794f4', gradStart: 'rgba(183,148,244,0.3)', gradEnd: 'rgba(183,148,244,0.02)' },
  };
  const cfg = viewConfig[view];

  return (
    <section className={styles.container} aria-label="5-day weather forecast">

      {/* ── Header ── */}
      <div className={styles.header}>
        <h3 className={styles.title}>5-Day Forecast</h3>

        {/* Metric toggle */}
        <div className={styles.toggle} role="group" aria-label="Chart metric">
          {Object.entries(viewConfig).map(([key, { label }]) => (
            <button
              key={key}
              className={`${styles.toggleBtn} ${view === key ? styles.toggleBtnActive : ''}`}
              onClick={() => setView(key)}
              aria-pressed={view === key}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Day Selector ── */}
      <div className={styles.dayRow} role="list" aria-label="Select day">
        {days.map((items, i) => (
          <DayCard
            key={i}
            index={i}
            items={items}
            isActive={i === activeDay}
            onClick={() => setActiveDay(i)}
          />
        ))}
      </div>

      {/* ── Area Chart ── */}
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${view}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={cfg.gradStart} />
                <stop offset="100%" stopColor={cfg.gradEnd}   />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: cfg.color, strokeWidth: 1, strokeDasharray: '4 4' }} />

            {/* Noon reference line */}
            <ReferenceLine
              x={chartData[Math.floor(chartData.length / 2)]?.time}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 4"
            />

            <Area
              type="monotone"
              dataKey={cfg.key}
              stroke={cfg.color}
              strokeWidth={2.5}
              fill={`url(#grad-${view})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: cfg.color,
                stroke: '#0f1623',
                strokeWidth: 2,
              }}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Hourly Pills Row ── */}
      <div className={styles.hourRow}>
        {chartData.map((d, i) => (
          <div
            key={i}
            className={styles.hourPill}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className={styles.hourTime}>{d.time}</span>
            <img
              src={WEATHER_ICONS_URL(d.icon)}
              alt={d.desc}
              className={styles.hourIcon}
            />
            <span className={styles.hourTemp}>{d.temp}°</span>
          </div>
        ))}
      </div>

    </section>
  );
}