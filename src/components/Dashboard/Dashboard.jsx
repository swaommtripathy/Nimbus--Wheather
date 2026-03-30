import React from 'react';
import { useSelector } from 'react-redux';
import CityCard from './CityCard';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const favorites = useSelector((s) => s.weather.favorites);

  return (
    <div className={styles.container}>
      {favorites.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🌍</div>
          <h3>No cities yet</h3>
          <p>Search for a city above to add it to your dashboard.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {favorites.map((city, i) => (
            <CityCard key={city} city={city} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
