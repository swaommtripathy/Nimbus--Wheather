import React from 'react';
import SearchBar from '../Search/SearchBar';
import Settings from '../Settings/Settings';
import styles from './Navbar.module.css';

export default function Navbar({ lastRefresh }) {
  return (
    <header className={styles.nav}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🌤️</span>
        <span className={styles.brandName}>Nimbus</span>
      </div>

      <div className={styles.center}>
        <SearchBar />
      </div>

      <div className={styles.right}>
        <div className={styles.liveStatus}>
          <div className="live-dot" />
          <span className={styles.liveLabel}>Live</span>
        </div>
        <Settings />
      </div>
    </header>
  );
}
