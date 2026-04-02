import { API_BASE_URL, DEFAULT_UNITS } from "../config/constants";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch weather data");
  }
  return response.json();
};

export const fetchCurrentWeather = async (city) => {
  const url = `${API_BASE_URL}/weather?q=${encodeURIComponent(city)}&units=${DEFAULT_UNITS}&appid=${API_KEY}`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const fetchForecast = async (city) => {
  const url = `${API_BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=${DEFAULT_UNITS}&appid=${API_KEY}`;
  const response = await fetch(url);
  return handleResponse(response);
};