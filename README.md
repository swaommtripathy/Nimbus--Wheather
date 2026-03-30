# 🌤️ Nimbus — Weather Analytics Dashboard

A production-grade Weather Analytics Dashboard built with React, Redux Toolkit, Recharts, Firebase, and the OpenWeatherMap API.

---

## ✅ Features Implemented

### Core
| Feature | Status |
|---|---|
| Dashboard with city summary cards | ✅ |
| Current temp, condition icon, humidity, wind | ✅ |
| Detailed city view (slide-in panel) | ✅ |
| 5-day forecast | ✅ |
| Hour-by-hour forecast strip | ✅ |
| Detailed stats (pressure, visibility, cloudiness, sunrise/sunset) | ✅ |
| City search with API autocomplete | ✅ |
| Favorite/pin cities | ✅ |
| Favorites persist via localStorage | ✅ |
| Temperature charts (hourly + daily high/low) | ✅ |
| Precipitation chart | ✅ |
| Wind speed chart | ✅ |
| Interactive tooltips on all charts | ✅ |
| Celsius ↔ Fahrenheit toggle | ✅ |

### Bonus
| Feature | Status |
|---|---|
| Google Sign-In (Firebase Auth) | ✅ |
| Real-time refresh every 60s | ✅ |
| In-memory cache (60s TTL) | ✅ |
| Cache stats + manual clear in Settings | ✅ |

---

## 🛠️ Tech Stack

- **React 18** with Hooks
- **Redux Toolkit** — centralized state (weather data, favorites, unit preference, auth)
- **Recharts** — interactive charts (AreaChart, BarChart, LineChart)
- **Firebase** — Google Authentication
- **OpenWeatherMap API** — current weather + 5-day/3-hour forecast + geocoding
- **Axios** — HTTP client
- **react-hot-toast** — toast notifications
- **CSS Modules** — scoped component styles

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
REACT_APP_OWM_API_KEY=your_openweathermap_api_key_here

REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

#### Getting an OpenWeatherMap API Key
1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Go to **API keys** in your account
3. Copy the default key (or generate a new one)
4. APIs used: **Current Weather**, **5 Day / 3 Hour Forecast**, **Geocoding**

#### Setting Up Firebase (Google Auth)
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication → Sign-in method → Google**
4. Go to **Project Settings → Your apps → Web app**
5. Copy the config values into your `.env`

### 3. Run the App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginPage.jsx         # Google Sign-In screen
│   │   └── LoginPage.module.css
│   ├── Charts/
│   │   ├── TemperatureChart.jsx  # Hourly + daily area charts
│   │   ├── PrecipWindChart.jsx   # Precipitation bar + wind line
│   │   └── Charts.module.css
│   ├── Common/
│   │   ├── Navbar.jsx            # Top nav with search + settings
│   │   └── Navbar.module.css
│   ├── Dashboard/
│   │   ├── Dashboard.jsx         # City card grid
│   │   ├── Dashboard.module.css
│   │   ├── CityCard.jsx          # Individual city weather card
│   │   └── CityCard.module.css
│   ├── DetailView/
│   │   ├── DetailView.jsx        # Slide-in panel with full analytics
│   │   └── DetailView.module.css
│   ├── Search/
│   │   ├── SearchBar.jsx         # Autocomplete city search
│   │   └── SearchBar.module.css
│   └── Settings/
│       ├── Settings.jsx          # Unit toggle, cache, sign-out
│       └── Settings.module.css
├── hooks/
│   └── useWeatherPolling.js      # 60s real-time polling hook
├── services/
│   ├── firebase.js               # Firebase init + auth
│   └── weatherApi.js             # OWM API calls + 60s cache + transformers
├── store/
│   ├── index.js                  # Redux store
│   └── slices/
│       ├── weatherSlice.js       # Weather data, favorites, unit
│       └── authSlice.js          # Auth user state
├── utils/
│   └── weatherUtils.js           # Icons, colors, formatters
├── App.jsx                       # Root component + auth guard
├── App.module.css
├── index.css                     # Global styles + design tokens
└── index.js                      # Entry point
```

---

## 🏗️ Architecture Notes

### Caching Strategy
Every API call checks an in-memory `Map` for a cached entry. If the entry exists and is **less than 60 seconds old**, the cached data is returned — no API call is made. This satisfies both the "data not older than 60s" and "cache to reduce API calls" bonus requirements simultaneously.

### Real-time Updates
`useWeatherPolling` runs `setInterval` at 60s, dispatching `loadCityWeather` for all favorites. Because of the 60s cache TTL, the interval and cache TTL are aligned — the cache expires just as the next poll fires.

### Redux State Shape
```js
{
  weather: {
    cityData: { "London": { current, daily, hourly, fetchedAt } },
    loadingCities: { "London": false },
    errors: {},
    favorites: ["London", "New York"],
    selectedCity: "London" | null,
    unit: "metric" | "imperial",
  },
  auth: {
    user: { uid, displayName, email, photoURL } | null,
    loading: true | false,
  }
}
```

---

## 🎨 Design

- **Aesthetic**: Dark atmospheric with glassmorphism accents
- **Font**: Syne (display) + DM Sans (body) + DM Mono (data)
- **Color system**: CSS variables for consistent theming
- **Animations**: Staggered card reveals, floating weather icons, smooth slide-in panel
- **Responsive**: Works on mobile and desktop
