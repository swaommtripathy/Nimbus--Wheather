import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { setUnit } from '../../store/slices/weatherSlice';
import { getCacheStats, clearCache } from '../../services/weatherApi';
import toast from 'react-hot-toast';
import styles from './Settings.module.css';

export default function Settings() {
  const dispatch = useDispatch();
  const unit = useSelector((s) => s.weather.unit);
  const user = useSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const [cacheStats, setCacheStats] = useState({ size: 0 });
  const ref = useRef(null);

  useEffect(() => {
    if (open) setCacheStats(getCacheStats());
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!e.target.closest(`.${styles.wrap}`)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleUnitToggle = (newUnit) => {
    if (newUnit !== unit) {
      dispatch(setUnit(newUnit));
      toast.success(`Switched to °${newUnit === 'metric' ? 'C' : 'F'}`);
    }
  };

  const handleClearCache = () => {
    clearCache();
    setCacheStats({ size: 0 });
    toast.success('Cache cleared');
  };

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success('Signed out');
    setOpen(false);
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.trigger} onClick={() => setOpen(!open)} title="Settings">
        {user?.photoURL
          ? <img src={user.photoURL} alt="" className={styles.avatar} />
          : <span>⚙️</span>
        }
      </button>

      {open && (
        <div className={styles.panel}>
          {user && (
            <div className={styles.userRow}>
              {user.photoURL && <img src={user.photoURL} alt="" className={styles.avatarLg} />}
              <div>
                <div className={styles.userName}>{user.displayName}</div>
                <div className={styles.userEmail}>{user.email}</div>
              </div>
            </div>
          )}

          <div className={styles.divider} />

          {/* Temperature unit */}
          <div className={styles.setting}>
            <span className={styles.settingLabel}>Temperature Unit</span>
            <div className={styles.toggle}>
              <button
                className={`${styles.toggleBtn} ${unit === 'metric' ? styles.active : ''}`}
                onClick={() => handleUnitToggle('metric')}
              >°C</button>
              <button
                className={`${styles.toggleBtn} ${unit === 'imperial' ? styles.active : ''}`}
                onClick={() => handleUnitToggle('imperial')}
              >°F</button>
            </div>
          </div>

          {/* Cache info */}
          <div className={styles.setting}>
            <span className={styles.settingLabel}>Cache</span>
            <div className={styles.cacheRow}>
              <span className={styles.cacheInfo}>{cacheStats.size} entries</span>
              <button className={styles.clearBtn} onClick={handleClearCache}>Clear</button>
            </div>
          </div>

          <div className={styles.divider} />

          <button className={styles.signOutBtn} onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
