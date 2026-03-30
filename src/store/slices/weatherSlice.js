import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchCurrentWeather,
  fetchForecast,
  parseDailyForecast,
  parseHourlyForecast,
} from '../../services/weatherApi';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loadCityWeather = createAsyncThunk(
  'weather/loadCity',
  async ({ city, unit }, { rejectWithValue }) => {
    try {
      const [current, forecast] = await Promise.all([
        fetchCurrentWeather(city, unit),
        fetchForecast(city, unit),
      ]);
      return {
        city,
        current,
        daily: parseDailyForecast(forecast),
        hourly: parseHourlyForecast(forecast),
        fetchedAt: Date.now(),
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch weather');
    }
  }
);

export const refreshAllCities = createAsyncThunk(
  'weather/refreshAll',
  async (_, { getState, dispatch }) => {
    const { favorites, unit } = getState().weather;
    await Promise.all(favorites.map((city) => dispatch(loadCityWeather({ city, unit }))));
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    // Map of city name → weather data
    cityData: {},
    // Loading state per city
    loadingCities: {},
    // Errors per city
    errors: {},
    // Favorite cities list
    favorites: JSON.parse(localStorage.getItem('wad_favorites') || '["London","New York","Tokyo","Mumbai","Sydney"]'),
    // Selected city for detail view
    selectedCity: null,
    // Temperature unit
    unit: localStorage.getItem('wad_unit') || 'metric',
    // Global error
    globalError: null,
  },

  reducers: {
    setSelectedCity(state, action) {
      state.selectedCity = action.payload;
    },
    clearSelectedCity(state) {
      state.selectedCity = null;
    },
    setUnit(state, action) {
      state.unit = action.payload;
      localStorage.setItem('wad_unit', action.payload);
      // Clear cached data so fresh fetch happens with new unit
      state.cityData = {};
    },
    addFavorite(state, action) {
      const city = action.payload;
      if (!state.favorites.includes(city)) {
        state.favorites.push(city);
        localStorage.setItem('wad_favorites', JSON.stringify(state.favorites));
      }
    },
    removeFavorite(state, action) {
      state.favorites = state.favorites.filter((c) => c !== action.payload);
      localStorage.setItem('wad_favorites', JSON.stringify(state.favorites));
      if (state.selectedCity === action.payload) state.selectedCity = null;
    },
    reorderFavorites(state, action) {
      state.favorites = action.payload;
      localStorage.setItem('wad_favorites', JSON.stringify(state.favorites));
    },
    clearGlobalError(state) {
      state.globalError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadCityWeather.pending, (state, action) => {
        state.loadingCities[action.meta.arg.city] = true;
        delete state.errors[action.meta.arg.city];
      })
      .addCase(loadCityWeather.fulfilled, (state, action) => {
        const { city, current, daily, hourly, fetchedAt } = action.payload;
        state.cityData[city] = { current, daily, hourly, fetchedAt };
        state.loadingCities[city] = false;
      })
      .addCase(loadCityWeather.rejected, (state, action) => {
        const city = action.meta.arg.city;
        state.loadingCities[city] = false;
        state.errors[city] = action.payload;
      });
  },
});

export const {
  setSelectedCity,
  clearSelectedCity,
  setUnit,
  addFavorite,
  removeFavorite,
  reorderFavorites,
  clearGlobalError,
} = weatherSlice.actions;

export default weatherSlice.reducer;
