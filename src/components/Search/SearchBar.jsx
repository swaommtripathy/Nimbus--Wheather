import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchCities } from '../../services/weatherApi';
import { addFavorite, setSelectedCity, loadCityWeather } from '../../store/slices/weatherSlice';
import toast from 'react-hot-toast';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const dispatch  = useDispatch();
  const unit      = useSelector((s) => s.weather.unit);
  const favorites = useSelector((s) => s.weather.favorites);

  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [open,       setOpen]       = useState(false);
  const [activeIdx,  setActiveIdx]  = useState(-1);   // keyboard nav

  const inputRef    = useRef(null);
  const debounceRef = useRef(null);
  const wrapRef     = useRef(null);

  // ── Search ────────────────────────────────────────────────────────────────
  const search = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const data = await searchCities(q);
      setResults(data);
      setOpen(data.length > 0);
      setActiveIdx(-1);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  // ── Select a city ─────────────────────────────────────────────────────────
  const handleSelect = useCallback((result) => {
    const cityName    = result.name;
    const alreadyFav  = favorites.includes(cityName);

    dispatch(loadCityWeather({ city: cityName, unit }));
    dispatch(setSelectedCity(cityName));

    if (!alreadyFav) {
      dispatch(addFavorite(cityName));
      toast.success(`${cityName} added to dashboard`);
    }

    setQuery('');
    setResults([]);
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  }, [dispatch, favorites, unit]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  // ── Clear input ───────────────────────────────────────────────────────────
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Cleanup debounce on unmount ───────────────────────────────────────────
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <div ref={wrapRef} className={styles.wrap} role="combobox" aria-expanded={open} aria-haspopup="listbox">
      <div className={`${styles.inputRow} ${open ? styles.inputRowOpen : ''}`}>
        {/* Search icon */}
        <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.75" />
          <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>

        <input
          ref={inputRef}
          id="city-search"
          className={styles.input}
          type="text"
          placeholder="Search cities…"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="search-listbox"
          aria-activedescendant={activeIdx >= 0 ? `result-${activeIdx}` : undefined}
          spellCheck={false}
        />

        {/* Spinner or clear button */}
        {loading ? (
          <span className={styles.spinner} aria-label="Searching…" />
        ) : query.length > 0 ? (
          <button className={styles.clearBtn} onClick={handleClear} aria-label="Clear search" tabIndex={-1}>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <ul
          id="search-listbox"
          role="listbox"
          className={styles.dropdown}
          aria-label="City search results"
        >
          {results.map((r, i) => {
            const isFav    = favorites.includes(r.name);
            const isActive = i === activeIdx;
            return (
              <li
                key={`${r.lat}-${r.lon}`}
                id={`result-${i}`}
                role="option"
                aria-selected={isActive}
                className={`${styles.result} ${isActive ? styles.resultActive : ''}`}
                style={{ animationDelay: `${i * 0.04}s` }}
                onMouseDown={() => handleSelect(r)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {/* Location pin icon */}
                <svg className={styles.pinIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.485-2.015-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="6" r="1.5" fill="currentColor" />
                </svg>

                <span className={styles.cityName}>{r.name}</span>

                <span className={styles.countryCode}>
                  {r.state ? `${r.state}, ` : ''}{r.country}
                </span>

                {isFav && (
                  <span className={styles.favBadge} aria-label="Saved">
                    ★ saved
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* No results state */}
      {open && !loading && query.length >= 2 && results.length === 0 && (
        <div className={styles.empty}>
          <span>No cities found for "<strong>{query}</strong>"</span>
        </div>
      )}
    </div>
  );
}