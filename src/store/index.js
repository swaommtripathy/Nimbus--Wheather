import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './slices/weatherSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
