import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCity, removeFavorite } from '../../store/slices/weatherSlice';
import { getWeatherIcon, getConditionGradient, formatTemp, formatWind, relativeTime } from '../../utils/weatherUtils';
import styles from './CityCard.module.css';

export default function CityCard({ city, index }) {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.weather.cityData[city]);
  const loading = useSelector((s) => s.weather.loadingCities[city]);
  const error = useSelector((s) => s.weather.errors[city]);
  const unit = useSelector((s) => s.weather.unit);

  if (loading && !data) return <SkeletonCard />;
  if (error) return <ErrorCard city={city} error={error} onRemove={() => dispatch(removeFavorite(city))} />;
  if (!data) return <SkeletonCard />;

  const { current, fetchedAt } = data;
  const condition = current.weather[0].main;
  const isNight = current.weather[0].icon?.includes('n');
  const gradient = getConditionGradient(condition);

  return (
    <div
      className={`${styles.card} fade-up stagger-${Math.min(index + 1, 6)}`}
      style={{ background: gradient }}
      onClick={() => dispatch(setSelectedCity(city))}
    >
      {/* Remove button */}
      <button
        className={styles.removeBtn}
        onClick={(e) => { e.stopPropagation(); dispatch(removeFavorite(city)); }}
        title="Remove city"
      >×</button>

      {/* Live indicator */}
      <div className={styles.liveRow}>
        <div className="live-dot" />
        <span className={styles.updatedAt}>Updated {relativeTime(fetchedAt)}</span>
      </div>

      {/* Main content */}
      <div className={styles.main}>
        <div>
          <div className={styles.cityName}>{current.name}</div>
          <div className={styles.country}>{current.sys.country}</div>
        </div>
        <div className={styles.icon}>
          {getWeatherIcon(condition, isNight)}
        </div>
      </div>

      {/* Temperature */}
      <div className={styles.temp}>{formatTemp(current.main.temp, unit)}</div>
      <div className={styles.condition}>{current.weather[0].description}</div>

      {/* Stats row */}
      <div className={styles.stats}>
        <Stat label="Feels" value={formatTemp(current.main.feels_like, unit)} />
        <Stat label="Humidity" value={`${current.main.humidity}%`} />
        <Stat label="Wind" value={formatWind(current.wind.speed, unit)} />
      </div>

      {/* Hover overlay */}
      <div className={styles.hoverOverlay}>
        <span>View Details →</span>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 48, width: '60%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 16, width: '50%', marginBottom: 24 }} />
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="skeleton" style={{ flex: 1, height: 40 }} />
        <div className="skeleton" style={{ flex: 1, height: 40 }} />
        <div className="skeleton" style={{ flex: 1, height: 40 }} />
      </div>
    </div>
  );
}

function ErrorCard({ city, error, onRemove }) {
  return (
    <div className={styles.errorCard}>
      <button className={styles.removeBtn} onClick={onRemove}>×</button>
      <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
      <div className={styles.cityName}>{city}</div>
      <div className={styles.errorMsg}>{error}</div>
    </div>
  );
}
