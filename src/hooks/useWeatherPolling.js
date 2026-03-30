import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadCityWeather } from '../store/slices/weatherSlice';

const REFRESH_INTERVAL = 60 * 1000; // 60 seconds

/**
 * Polls weather data for all favorite cities.
 * Respects the 60s cache — duplicate calls within cache TTL are no-ops.
 */
export function useWeatherPolling() {
  const dispatch = useDispatch();
  const { favorites, unit } = useSelector((s) => s.weather);

  const fetchAll = useCallback(() => {
    favorites.forEach((city) => dispatch(loadCityWeather({ city, unit })));
  }, [favorites, unit, dispatch]);

  // Initial load
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Polling
  useEffect(() => {
    const interval = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAll]);
}

/** Hook to load a single city's data */
export function useCityWeather(city) {
  const dispatch = useDispatch();
  const unit = useSelector((s) => s.weather.unit);
  const data = useSelector((s) => s.weather.cityData[city]);
  const loading = useSelector((s) => s.weather.loadingCities[city]);
  const error = useSelector((s) => s.weather.errors[city]);

  useEffect(() => {
    if (city) dispatch(loadCityWeather({ city, unit }));
  }, [city, unit, dispatch]);

  return { data, loading, error };
}
