// ─── Weather condition → emoji icon ──────────────────────────────────────────
export function getWeatherIcon(condition, isNight = false) {
  const c = (condition || '').toLowerCase();
  if (c.includes('thunderstorm')) return '⛈️';
  if (c.includes('drizzle')) return '🌦️';
  if (c.includes('rain')) return isNight ? '🌧️' : '🌧️';
  if (c.includes('snow')) return '❄️';
  if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return '🌫️';
  if (c.includes('smoke') || c.includes('dust') || c.includes('sand')) return '🌪️';
  if (c.includes('cloud')) return isNight ? '☁️' : '⛅';
  if (c.includes('clear')) return isNight ? '🌙' : '☀️';
  return '🌡️';
}

// ─── Temperature → color gradient ─────────────────────────────────────────────
export function getTempColor(temp, unit = 'metric') {
  const celsius = unit === 'imperial' ? (temp - 32) * (5 / 9) : temp;
  if (celsius >= 35) return '#fc8181';      // hot red
  if (celsius >= 25) return '#f6ad55';      // warm amber
  if (celsius >= 15) return '#f6e05e';      // mild yellow
  if (celsius >= 5)  return '#68d391';      // cool green
  if (celsius >= -5) return '#63b3ed';      // cold blue
  return '#b794f4';                          // freezing violet
}

// ─── Condition → card background gradient ─────────────────────────────────────
export function getConditionGradient(condition) {
  const c = (condition || '').toLowerCase();
  if (c.includes('thunder')) return 'linear-gradient(135deg, #2d1b69 0%, #553c9a 100%)';
  if (c.includes('rain') || c.includes('drizzle')) return 'linear-gradient(135deg, #1a365d 0%, #2a4a7f 100%)';
  if (c.includes('snow')) return 'linear-gradient(135deg, #1a2744 0%, #2d4a8a 100%)';
  if (c.includes('cloud')) return 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)';
  if (c.includes('clear')) return 'linear-gradient(135deg, #1a2a4a 0%, #0f3460 100%)';
  if (c.includes('mist') || c.includes('fog')) return 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)';
  return 'linear-gradient(135deg, #111827 0%, #1f2937 100%)';
}

// ─── Format temperature with unit symbol ──────────────────────────────────────
export function formatTemp(temp, unit = 'metric') {
  const sym = unit === 'imperial' ? '°F' : '°C';
  return `${Math.round(temp)}${sym}`;
}

// ─── Format wind speed ────────────────────────────────────────────────────────
export function formatWind(speed, unit = 'metric') {
  if (unit === 'imperial') return `${Math.round(speed)} mph`;
  return `${Math.round(speed * 3.6)} km/h`;
}

// ─── Format date ──────────────────────────────────────────────────────────────
export function formatDay(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ─── UV Index label ───────────────────────────────────────────────────────────
export function getUVLabel(uvi) {
  if (uvi <= 2) return { label: 'Low', color: '#68d391' };
  if (uvi <= 5) return { label: 'Moderate', color: '#f6e05e' };
  if (uvi <= 7) return { label: 'High', color: '#f6ad55' };
  if (uvi <= 10) return { label: 'Very High', color: '#fc8181' };
  return { label: 'Extreme', color: '#b794f4' };
}

// ─── Wind direction degrees → compass ─────────────────────────────────────────
export function windDegToCompass(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// ─── Visibility ───────────────────────────────────────────────────────────────
export function formatVisibility(meters) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
}

// ─── Relative time ────────────────────────────────────────────────────────────
export function relativeTime(timestamp) {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 10) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
