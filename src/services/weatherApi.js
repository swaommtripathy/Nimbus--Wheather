import axios from 'axios';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
const API_KEY = process.env.REACT_APP_OWM_API_KEY;

// ─── In-memory cache (TTL: 60 seconds) ───────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const owmClient = axios.create({ baseURL: BASE_URL });

async function fetchWithCache(cacheKey, url, params) {
  const cached = getCached(cacheKey);
  if (cached) return cached;
  const { data } = await owmClient.get(url, { params: { ...params, appid: API_KEY } });
  setCache(cacheKey, data);
  return data;
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/** Fetch current weather by city name */
export async function fetchCurrentWeather(city, unit = 'metric') {
  const key = `current_${city}_${unit}`;
  return fetchWithCache(key, '/weather', { q: city, units: unit });
}

/** Fetch current weather by lat/lon */
export async function fetchCurrentWeatherByCoords(lat, lon, unit = 'metric') {
  const key = `current_${lat}_${lon}_${unit}`;
  return fetchWithCache(key, '/weather', { lat, lon, units: unit });
}

/** Fetch 5-day / 3-hour forecast */
export async function fetchForecast(city, unit = 'metric') {
  const key = `forecast_${city}_${unit}`;
  return fetchWithCache(key, '/forecast', { q: city, units: unit, cnt: 40 });
}

/** Fetch forecast by lat/lon */
export async function fetchForecastByCoords(lat, lon, unit = 'metric') {
  const key = `forecast_${lat}_${lon}_${unit}`;
  return fetchWithCache(key, '/forecast', { lat, lon, units: unit, cnt: 40 });
}

/** Geocoding autocomplete */
export async function searchCities(query) {
  if (!query || query.length < 2) return [];
  const key = `geo_${query}`;
  const cached = getCached(key);
  if (cached) return cached;
  const { data } = await axios.get(`${GEO_URL}/direct`, {
    params: { q: query, limit: 5, appid: API_KEY },
  });
  setCache(key, data);
  return data;
}

// ─── Data Transformers ────────────────────────────────────────────────────────

/** Parse OWM forecast into daily buckets (5-7 days) */
export function parseDailyForecast(forecastData) {
  const byDay = {};
  forecastData.list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!byDay[date]) byDay[date] = [];
    byDay[date].push(item);
  });

  return Object.entries(byDay).map(([date, items]) => {
    const temps = items.map((i) => i.main.temp);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const noon = items.find((i) => i.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)];
    return {
      date,
      maxTemp: Math.round(maxTemp),
      minTemp: Math.round(minTemp),
      condition: noon.weather[0].main,
      description: noon.weather[0].description,
      icon: noon.weather[0].icon,
      humidity: noon.main.humidity,
      windSpeed: noon.wind.speed,
      pop: Math.round((noon.pop || 0) * 100),
    };
  });
}

/** Parse OWM forecast into hourly data for charts */
export function parseHourlyForecast(forecastData) {
  return forecastData.list.slice(0, 24).map((item) => ({
    time: item.dt_txt.split(' ')[1].slice(0, 5),
    temp: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    windSpeed: Math.round(item.wind.speed * 3.6), // m/s → km/h
    pop: Math.round((item.pop || 0) * 100),
    condition: item.weather[0].main,
  }));
}

/** Cache stats for debugging */
export function getCacheStats() {
  return { size: cache.size, keys: [...cache.keys()] };
}

export function clearCache() {
  cache.clear();
}
