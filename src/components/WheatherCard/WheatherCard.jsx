import { WEATHER_ICONS_URL } from "../../config/constants";
import "./WeatherCard.css";

const WeatherCard = ({ data }) => {
  if (!data) return null;

  const { name, main, weather, wind } = data;
  const icon = weather[0]?.icon;

  return (
    <div className="weather-card">
      <h2>{name}</h2>
      <img src={WEATHER_ICONS_URL(icon)} alt={weather[0]?.description} />
      <p className="temp">{Math.round(main.temp)}°C</p>
      <p className="desc">{weather[0]?.description}</p>
      <div className="details">
        <span>Humidity: {main.humidity}%</span>
        <span>Wind: {wind.speed} m/s</span>
        <span>Feels like: {Math.round(main.feels_like)}°C</span>
      </div>
    </div>
  );
};

export default WeatherCard;