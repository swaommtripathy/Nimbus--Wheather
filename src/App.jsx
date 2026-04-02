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
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import styles from './App.module.css';

// ─── Inner app (rendered only when authenticated) ────────────────────────────
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
            Real-time conditions &amp; forecasts — refreshed every 60 seconds
          </p>
        </div>

        {/* Each major section is independently fault-tolerant */}
        <ErrorBoundary>
          <Dashboard />
        </ErrorBoundary>

        <ErrorBoundary>
          <DetailView />
        </ErrorBoundary>
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: '0.875rem' },
        }}
      />
    </div>
  );
}

// ─── Loading spinner while Firebase resolves auth state ──────────────────────
function AuthLoader() {
  return (
    <div className={styles.loader}>
      <div className={styles.loaderDot} />
      <div className={styles.loaderDot} style={{ animationDelay: '0.15s' }} />
      <div className={styles.loaderDot} style={{ animationDelay: '0.3s' }} />
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  // Subscribe to Firebase auth state once on mount
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Reload user to get latest email verification status
        try {
          await firebaseUser.reload();
          console.log('[APP] User reloaded. Email verified:', firebaseUser.emailVerified);
        } catch (err) {
          console.error('[APP] Error reloading user:', err);
        }
      }
      dispatch(setUser(firebaseUser));
    });
    return unsub; // cleanup listener on unmount
  }, [dispatch]);

  if (loading) return <AuthLoader />;
  
  // Check if user exists and email is verified
  if (!user) {
    console.log('[APP] No user, showing LoginPage');
    return <LoginPage />;
  }
  
  // If user exists but email is not verified, show login page with verify message
  if (!user.emailVerified) {
    console.log('[APP] User exists but email not verified. Email:', user.email, 'Verified:', user.emailVerified);
    return <LoginPage />;
  }

  console.log('[APP] User verified, showing dashboard');
  return (
    // Top-level boundary catches any catastrophic render errors
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}