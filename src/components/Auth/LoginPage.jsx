import React, { useState, useCallback ,useEffect} from 'react';
import { useDispatch } from 'react-redux';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';
import { setUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import styles from './LoginPage.module.css';

// ─── Validation rules ─────────────────────────────────────────────────────────
const RULES = {
  username: (v) => {
    if (!v.trim())                    return 'Username is required';
    if (v.trim().length < 3)          return 'Minimum 3 characters required';
    if (v.trim().length > 20)         return 'Maximum 20 characters allowed';
    if (!/^[a-zA-Z0-9_]+$/.test(v))  return 'Only letters, numbers and underscores';
    return '';
  },
  email: (v) => {
    if (!v.trim())                                  return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))     return 'Enter a valid email address';
    return '';
  },
  password: (v) => {
    if (!v)                           return 'Password is required';
    if (v.length < 8)                 return 'Minimum 8 characters required';
    if (!/[A-Z]/.test(v))             return 'Add at least one uppercase letter';
    if (!/[0-9]/.test(v))             return 'Add at least one number';
    if (!/[^a-zA-Z0-9]/.test(v))      return 'Add at least one special character';
    return '';
  },
  confirmPassword: (v, pw) => {
    if (!v)       return 'Please confirm your password';
    if (v !== pw) return 'Passwords do not match';
    return '';
  },
};

// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8)            s++;
  if (pw.length >= 12)           s++;
  if (/[A-Z]/.test(pw))          s++;
  if (/[0-9]/.test(pw))          s++;
  if (/[^a-zA-Z0-9]/.test(pw))   s++;
  const levels = [
    { label: '',             color: '' },
    { label: 'Weak',         color: '#ef4444' },
    { label: 'Fair',         color: '#f97316' },
    { label: 'Good',         color: '#eab308' },
    { label: 'Strong',       color: '#22c55e' },
    { label: 'Very strong',  color: '#10b981' },
  ];
  return { score: s, ...levels[s] };
}

// ─── Eye icon ─────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ─── Reusable Field ───────────────────────────────────────────────────────────
function Field({ label, id, type = 'text', value, onChange, onBlur, error, touched, placeholder, autoComplete, rightSlot }) {
  const isValid = touched && !error && value.length > 0;
  const isError = touched && !!error;
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={`${styles.inputWrap} ${isError ? styles.hasError : ''} ${isValid ? styles.hasValid : ''}`}>
        <input
          id={id} type={type} value={value}
          onChange={onChange} onBlur={onBlur}
          placeholder={placeholder} autoComplete={autoComplete}
          className={styles.input}
          aria-describedby={isError ? `${id}-err` : undefined}
          aria-invalid={isError}
          spellCheck={false}
        />
        {rightSlot
          ? <div className={styles.inputRight}>{rightSlot}</div>
          : isValid && (
            <span className={styles.checkIcon}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7l3 3L11.5 4" stroke="#22c55e" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )
        }
      </div>
      {isError && (
        <p id={`${id}-err`} className={styles.errorText} role="alert">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Firebase errors ──────────────────────────────────────────────────────────
const FB_ERRORS = {
  'auth/user-not-found':         'No account found with this email.',
  'auth/wrong-password':         'Incorrect password. Try again.',
  'auth/invalid-credential':     'Invalid email or password.',
  'auth/email-already-in-use':   'This email is already registered.',
  'auth/too-many-requests':      'Too many attempts. Please wait.',
  'auth/network-request-failed': 'Network error. Check your connection.',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const dispatch = useDispatch();
  const [page, setPage] = useState('login'); 
  // 'login' | 'register' | 'verify'
  const isLogin = page === 'login';
  const isRegister = page === 'register';
  const isVerify = page === 'verify';
  
  // Define blank object first
  const blank = { username: '', email: '', password: '', confirmPassword: '' };
  
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [emailSendError, setEmailSendError] = useState('');
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [emailExistsMessage, setEmailExistsMessage] = useState('');
  const [fields,  setFields]  = useState(blank);
  const [touched, setTouched] = useState({ username:false, email:false, password:false, confirmPassword:false });
  const [errors,  setErrors]  = useState({ username:'',    email:'',    password:'',    confirmPassword:'' });
  const strength = getStrength(fields.password);

  const validate = useCallback((name, value) => {
    if (name === 'confirmPassword') return RULES.confirmPassword(value, fields.password);
    return RULES[name]?.(value) ?? '';
  }, [fields.password]);

  const handleChange = (name) => (e) => {
    const val = e.target.value;
    setFields((f) => ({ ...f, [name]: val }));
    if (touched[name]) setErrors((err) => ({ ...err, [name]: validate(name, val) }));
    if (name === 'password' && touched.confirmPassword)
      setErrors((err) => ({ ...err, confirmPassword: RULES.confirmPassword(fields.confirmPassword, val) }));
  };

  const handleBlur = (name) => () => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((err) => ({ ...err, [name]: validate(name, fields[name]) }));
  };

  const validateAll = () => {
    const active = isLogin ? ['email','password'] : ['username','email','password','confirmPassword'];
    const newT = { ...touched }; const newE = { ...errors };
    active.forEach((n) => { newT[n]=true; newE[n]=validate(n, fields[n]); });
    setTouched(newT); setErrors(newE);
    return active.every((n) => !newE[n]);
  };

  const switchMode = (m) => {
    setPage(m);
    setFields(blank);
    setTouched({ username:false, email:false, password:false, confirmPassword:false });
    setErrors({ username:'', email:'', password:'', confirmPassword:'' });
    setShowPw(false); setShowCpw(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setLoading(true);
    try {
      if (isLogin) {
        console.log('[AUTH] Attempting login for:', fields.email);
        const cred = await signInWithEmailAndPassword(auth, fields.email, fields.password);
        console.log('[AUTH] Login successful. Email verified:', cred.user.emailVerified);

        if (!cred.user.emailVerified) {
          console.log('[AUTH] Email not verified, redirecting to verify page');
          toast.error('Please verify your email first.');
          setPage('verify');
          return;
        }

        console.log('[AUTH] Email verified, user logged in successfully');
        
        // Reload user to ensure latest email verification status
        await auth.currentUser?.reload();
        
        // Dispatch user to Redux to trigger immediate re-render in App.jsx
        dispatch(setUser(auth.currentUser));
        console.log('[AUTH] Redux state updated, dashboard should render now');
        
        toast.success('Welcome back! 🎉', {
          duration: 3000,
          icon: '✓',
        });
      } else {
        const cred = await createUserWithEmailAndPassword(auth, fields.email, fields.password);

        await updateProfile(cred.user, {
          displayName: fields.username.trim()
        });

        // Send verification email
        try {
          console.log('[AUTH] Sending verification email to:', cred.user.email);
          
          await sendEmailVerification(cred.user);
          console.log('[AUTH] ✓ Verification email sent successfully');
          
          toast.success(
            `Welcome ${fields.username}! 🎉\nVerification email sent to ${cred.user.email}`,
            { duration: 4000 }
          );
        } catch (emailErr) {
          console.error('[AUTH] Failed to send verification email:', emailErr.code);
          
          let errmsg = 'Failed to send verification email';
          if (emailErr.code === 'auth/operation-not-allowed') {
            errmsg = '⚠️ Email verification is not enabled in Firebase Console';
          } else if (emailErr.code === 'auth/too-many-requests') {
            errmsg = '⏱️ Too many attempts. Please wait before trying again';
          }
          
          toast.error(errmsg, { duration: 5000 });
        }

        // Redirect to verification page
        setPage('verify');
      }
    } catch (err) {
      console.error('[AUTH] Registration error:', err.code, err.message);
      
      if (err.code === 'auth/email-already-in-use') {
        console.log('[AUTH] Email already in use - prompting user to login');
        toast.error('This email is already registered. Switching to login...', {
          duration: 4000,
        });
        // Switch to login after a short delay
        setTimeout(() => {
          setPage('login');
          setFields(blank);
          setErrors({ username:'', email:'', password:'', confirmPassword:'' });
        }, 1500);
      } else {
        toast.error(FB_ERRORS[err.code] || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user')
        toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const eyeBtn = (show, toggle, label) => (
    <button type="button" className={styles.eyeBtn} onClick={toggle} aria-label={show ? `Hide ${label}` : `Show ${label}`}>
      {show ? <EyeOpen /> : <EyeClosed />}
    </button>
  );

  useEffect(() => {
    if (page === 'verify') {
      console.log('[VERIFY-CHECK] Starting email verification polling...');
      const interval = setInterval(async () => {
        try {
          console.log('[VERIFY-CHECK] Checking email verification status...');
          await auth.currentUser?.reload();

          if (auth.currentUser?.emailVerified) {
            console.log('[VERIFY-CHECK] Email verified! User:', auth.currentUser.email);
            toast.success('Email verified!');
            setPage('login');
          } else {
            console.log('[VERIFY-CHECK] Email not yet verified. User:', auth.currentUser?.email);
          }
        } catch (err) {
          console.error('[VERIFY-CHECK] Error checking email verification:', err);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [page]);

  if (isVerify) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2>Verify Your Email</h2>
        <p>Please check your inbox and click the verification link.</p>

        <button
          className={styles.primaryBtn}
          onClick={async () => {
            try {
              if (!auth.currentUser) {
                console.log('[LOGIN-VERIFY] No current user found');
                toast.error('No user found. Please log in again.');
                setPage('login');
                return;
              }
              
              console.log('[LOGIN-VERIFY] Current user status:', {
                email: auth.currentUser.email,
                emailVerified: auth.currentUser.emailVerified,
                uid: auth.currentUser.uid
              });
              
              console.log('[LOGIN-VERIFY] Resending verification email to:', auth.currentUser.email);
              
              await sendEmailVerification(auth.currentUser);
              
              console.log('[LOGIN-VERIFY] ✓ Verification email resent');
              toast.success('📧 Verification email resent!\nCheck your inbox and spam folder', {
                duration: 4000,
              });
            } catch (err) {
              console.error('[LOGIN-VERIFY] Failed to resend verification email:', err);
              
              let errmsg = 'Failed to resend email';
              if (err.code === 'auth/operation-not-allowed') {
                errmsg = '⚠️ Email verification not enabled in Firebase';
              } else if (err.code === 'auth/too-many-requests') {
                errmsg = '⏱️ Too many attempts. Wait before trying again';
              } else {
                errmsg = err.message || 'Failed to resend email';
              }
              
              toast.error(errmsg, { duration: 4000 });
            }
          }}
        >
          Resend Email
        </button>

        <br /><br />

        <button
          className={styles.primaryBtn}
          onClick={async () => {
            try {
              console.log('[LOGIN-VERIFY] Manually checking email verification...');
              await auth.currentUser?.reload();
              console.log('[LOGIN-VERIFY] Email verified status:', auth.currentUser?.emailVerified);
              
              if (auth.currentUser?.emailVerified) {
                toast.success('Email verified! Redirecting...');
                setPage('login');
              } else {
                toast.info('Email not yet verified. Keep checking your inbox.');
                setLastCheckTime(new Date().toLocaleTimeString());
              }
            } catch (err) {
              console.error('[LOGIN-VERIFY] Error checking verification:', err);
              toast.error('Error checking status');
            }
          }}
        >
          Check Email Status
        </button>

        <br /><br />

        {lastCheckTime && (
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
            Last checked: {lastCheckTime}
          </p>
        )}

        <button
          className={styles.googleBtn}
          onClick={() => setPage('login')}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 15.5A7.5 7.5 0 0115 8.5c.17 0 .33.01.5.02A5.5 5.5 0 0121 14a5.5 5.5 0 01-5.5 5.5H5A2 2 0 013 17.5v-2z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.brandName}>Nimbus</span>
        </div>

        {/* Heading */}
        <div className={styles.headingGroup}>
          <h1 className={styles.heading}>{isLogin ? 'Welcome back' : 'Create account'}</h1>
          <p className={styles.sub}>{isLogin ? 'Sign in to continue to your dashboard.' : 'Start tracking real-time weather today.'}</p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist">
          <button role="tab" aria-selected={isLogin}  className={`${styles.tab} ${isLogin  ? styles.tabActive : ''}`} onClick={() => setPage('login')}>Sign in</button>
          <button role="tab" aria-selected={!isLogin} className={`${styles.tab} ${!isLogin ? styles.tabActive : ''}`} onClick={() => setPage('register')}>Register</button>
          <span className={styles.tabIndicator} style={{ left: isLogin ? '4px' : 'calc(50% + 2px)', width: 'calc(50% - 6px)' }} />
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {!isLogin && (
            <Field label="Username" id="username"
              value={fields.username} onChange={handleChange('username')} onBlur={handleBlur('username')}
              error={errors.username} touched={touched.username}
              placeholder="e.g. storm_chaser" autoComplete="username" />
          )}

          <Field label="Email address" id="email" type="email"
            value={fields.email} onChange={handleChange('email')} onBlur={handleBlur('email')}
            error={errors.email} touched={touched.email}
            placeholder="you@example.com" autoComplete={isLogin ? 'email' : 'new-email'} />

          <Field label="Password" id="password"
            type={showPw ? 'text' : 'password'}
            value={fields.password} onChange={handleChange('password')} onBlur={handleBlur('password')}
            error={errors.password} touched={touched.password}
            placeholder={isLogin ? 'Your password' : 'Min 8 chars, uppercase, number, symbol'}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            rightSlot={eyeBtn(showPw, () => setShowPw(v => !v), 'password')} />

          {!isLogin && fields.password && (
            <div className={styles.strengthRow}>
              <div className={styles.strengthSegs}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={styles.seg}
                    style={{ background: n <= strength.score ? strength.color : undefined }} />
                ))}
              </div>
              {strength.label && <span className={styles.strengthText} style={{ color: strength.color }}>{strength.label}</span>}
            </div>
          )}

          {!isLogin && (
            <Field label="Confirm password" id="confirmPassword"
              type={showCpw ? 'text' : 'password'}
              value={fields.confirmPassword} onChange={handleChange('confirmPassword')} onBlur={handleBlur('confirmPassword')}
              error={errors.confirmPassword} touched={touched.confirmPassword}
              placeholder="Repeat your password" autoComplete="new-password"
              rightSlot={eyeBtn(showCpw, () => setShowCpw(v => !v), 'confirm password')} />
          )}

          {isLogin && (
            <div className={styles.forgotRow}>
              <button type="button" className={styles.forgotLink}>Forgot password?</button>
            </div>
          )}

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading && <span className={styles.btnSpinner} />}
            {loading ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Sign in' : 'Create account')}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.orRow}><span>or</span></div>

        {/* Google */}
        <button className={styles.googleBtn} onClick={handleGoogle} disabled={loading} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className={styles.legal}>
          By continuing you agree to our{' '}
          <button type="button" className={styles.legalLink}>Terms of Service</button>
          {' '}and{' '}
          <button type="button" className={styles.legalLink}>Privacy Policy</button>.
        </p>
      </div>
    </div>
  );
}