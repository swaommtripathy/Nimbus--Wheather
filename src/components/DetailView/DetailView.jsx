import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearSelectedCity, removeFavorite, addFavorite } from '../../store/slices/weatherSlice';
import { useCityWeather } from '../../hooks/useWeatherPolling';
import { TemperatureChart, DailyTempChart } from '../Charts/TemperatureChart';
import { PrecipitationChart, WindChart } from '../Charts/PrecipWindChart';
import {
  getWeatherIcon, getConditionGradient, formatTemp, formatWind,
  formatDay, windDegToCompass, formatVisibility, relativeTime,
} from '../../utils/weatherUtils';
import styles from './DetailView.module.css';

export default function DetailView() {
  const dispatch = useDispatch();
  const selectedCity = useSelector((s) => s.weather.selectedCity);
  const favorites = useSelector((s) => s.weather.favorites);
  const unit = useSelector((s) => s.weather.unit);
  const { data, loading } = useCityWeather(selectedCity);

  const isFav = favorites.includes(selectedCity);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') dispatch(clearSelectedCity()); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch]);

  if (!selectedCity) return null;

  const close = () => dispatch(clearSelectedCity());

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          className={styles.header}
          style={{ background: data ? getConditionGradient(data.current.weather[0].main) : undefined }}
        >
          <button className={styles.closeBtn} onClick={close}>✕</button>

          {loading && !data ? (
            <div className={styles.headerLoading}>
              <span className={styles.spinner} />
            </div>
          ) : data ? (
            <>
              <div className={styles.headerTop}>
                <div>
                  <div className={styles.headerCity}>{data.current.name}</div>
                  <div className={styles.headerCountry}>{data.current.sys.country}</div>
                </div>
                <div className={styles.headerIcon}>
                  {getWeatherIcon(data.current.weather[0].main, data.current.weather[0].icon?.includes('n'))}
                </div>
              </div>
              <div className={styles.headerTemp}>{formatTemp(data.current.main.temp, unit)}</div>
              <div className={styles.headerDesc}>{data.current.weather[0].description}</div>

              <div className={styles.headerMeta}>
                <div className="live-dot" />
                <span>Updated {relativeTime(data.fetchedAt)}</span>
                <button
                  className={`${styles.favBtn} ${isFav ? styles.favActive : ''}`}
                  onClick={() => isFav ? dispatch(removeFavorite(selectedCity)) : dispatch(addFavorite(selectedCity))}
                >
                  {isFav ? '★ Pinned' : '☆ Pin City'}
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* Scrollable body */}
        {data && (
          <div className={styles.body}>
            {/* Current detailed stats */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Current Conditions</h2>
              <div className={styles.statsGrid}>
                <StatCard icon="🌡️" label="Feels Like" value={formatTemp(data.current.main.feels_like, unit)} />
                <StatCard icon="💧" label="Humidity" value={`${data.current.main.humidity}%`} />
                <StatCard icon="🌬️" label="Wind" value={`${formatWind(data.current.wind.speed, unit)} ${windDegToCompass(data.current.wind.deg || 0)}`} />
                <StatCard icon="🔽" label="Pressure" value={`${data.current.main.pressure} hPa`} />
                <StatCard icon="👁️" label="Visibility" value={formatVisibility(data.current.visibility || 10000)} />
                <StatCard icon="☁️" label="Cloudiness" value={`${data.current.clouds?.all ?? 0}%`} />
                <StatCard icon="🌅" label="Sunrise" value={formatTime(data.current.sys.sunrise)} />
                <StatCard icon="🌇" label="Sunset" value={formatTime(data.current.sys.sunset)} />
              </div>
            </section>

            {/* 5-7 day forecast */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>5-Day Forecast</h2>
              <div className={styles.forecastList}>
                {data.daily.map((day) => (
                  <DayForecastRow key={day.date} day={day} unit={unit} />
                ))}
              </div>
            </section>

            {/* Hourly forecast strip */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Hourly Forecast</h2>
              <div className={styles.hourlyStrip}>
                {data.hourly.map((h) => (
                  <HourlyItem key={h.time} item={h} unit={unit} />
                ))}
              </div>
            </section>

            {/* Charts */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Temperature Trends</h2>
              <div className={styles.chartsGrid}>
                <TemperatureChart hourlyData={data.hourly} unit={unit} />
                <DailyTempChart dailyData={data.daily} unit={unit} />
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Precipitation & Wind</h2>
              <div className={styles.chartsGrid}>
                <PrecipitationChart hourlyData={data.hourly} />
                <WindChart hourlyData={data.hourly} />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

function DayForecastRow({ day, unit }) {
  return (
    <div className={styles.dayRow}>
      <span className={styles.dayName}>{formatDay(day.date)}</span>
      <span className={styles.dayIcon}>{getWeatherIcon(day.condition)}</span>
      <span className={styles.dayDesc}>{day.description}</span>
      <div className={styles.dayTemps}>
        <span className={styles.dayHigh}>{formatTemp(day.maxTemp, unit)}</span>
        <span className={styles.dayLow}>{formatTemp(day.minTemp, unit)}</span>
      </div>
      <div className={styles.dayMeta}>
        <span>💧 {day.pop}%</span>
        <span>💨 {formatWind(day.windSpeed, unit)}</span>
      </div>
    </div>
  );
}

function HourlyItem({ item, unit }) {
  return (
    <div className={styles.hourItem}>
      <span className={styles.hourTime}>{item.time}</span>
      <span className={styles.hourIcon}>{getWeatherIcon(item.condition)}</span>
      <span className={styles.hourTemp}>{formatTemp(item.temp, unit)}</span>
      <span className={styles.hourPop}>{item.pop > 0 ? `💧${item.pop}%` : ''}</span>
    </div>
  );
}

function formatTime(unixTs) {
  return new Date(unixTs * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
