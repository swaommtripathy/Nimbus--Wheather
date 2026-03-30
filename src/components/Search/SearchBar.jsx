import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchCities } from '../../services/weatherApi';
import { addFavorite, setSelectedCity } from '../../store/slices/weatherSlice';
import { loadCityWeather } from '../../store/slices/weatherSlice';
import toast from 'react-hot-toast';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const dispatch = useDispatch();
  const unit = useSelector((s) => s.weather.unit);
  const favorites = useSelector((s) => s.weather.favorites);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await searchCities(q);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (result) => {
    const cityName = result.name;
    const alreadyFav = favorites.includes(cityName);

    dispatch(loadCityWeather({ city: cityName, unit }));

    if (!alreadyFav) {
      dispatch(addFavorite(cityName));
      toast.success(`Added ${cityName} to dashboard`);
    }

    dispatch(setSelectedCity(cityName));
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(`.${styles.wrap}`)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.inputRow}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          placeholder="Search cities…"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          autoComplete="off"
        />
        {loading && <span className={styles.spinner} />}
      </div>

      {open && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((r, i) => (
            <li
              key={`${r.lat}-${r.lon}`}
              className={styles.result}
              style={{ animationDelay: `${i * 0.04}s` }}
              onMouseDown={() => handleSelect(r)}
            >
              <span className={styles.cityName}>{r.name}</span>
              <span className={styles.countryCode}>
                {r.state ? `${r.state}, ` : ''}{r.country}
              </span>
              {favorites.includes(r.name) && (
                <span className={styles.favBadge}>★ saved</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
