import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import { setUser } from './store/slices/authSlice';
import { useWeatherPolling } from './hooks/useWeatherPolling';
import LoginPage from './components/Auth/LoginPage';
import Navbar from './components/Common/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import DetailView from './components/DetailView/DetailView';
import { Toaster } from 'react-hot-toast';
import styles from './App.module.css';

function AppInner() {
  // Starts real-time polling once authenticated
  useWeatherPolling();

  return (
    <div className={styles.app}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Weather Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Real-time conditions & forecasts — refreshed every 60 seconds
          </p>
        </div>
        <Dashboard />
      </main>
      <DetailView />
    </div>
  );
}

function AuthLoader() {
  return (
    <div className={styles.loader}>
      <div className={styles.loaderDot} />
      <div className={styles.loaderDot} style={{ animationDelay: '0.15s' }} />
      <div className={styles.loaderDot} style={{ animationDelay: '0.3s' }} />
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      dispatch(setUser(firebaseUser));
    });
    return unsub;
  }, [dispatch]);

  if (loading) return <AuthLoader />;
  if (!user) return <LoginPage />;
  return <AppInner />;
}
