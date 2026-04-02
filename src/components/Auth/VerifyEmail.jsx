import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [lastCheckTime, setLastCheckTime] = useState(null);

  const resendEmail = async () => {
    try {
      if (!auth.currentUser) {
        console.log('[VERIFY] No current user found');
        toast.error('❌ No user found. Please log in again.');
        window.location.href = '/login';
        return;
      }
      
      console.log('[VERIFY] Resending email to:', auth.currentUser.email);
      
      await sendEmailVerification(auth.currentUser);
      console.log('[VERIFY] ✓ Email resent');
      
      toast.success('📧 Email resent! Check inbox and spam folder', {
        duration: 4000,
      });
    } catch (err) {
      console.error('[VERIFY] Error:', err.code);
      
      let errmsg = 'Failed to resend email';
      if (err.code === 'auth/operation-not-allowed') {
        errmsg = '⚠️ Email verification not enabled in Firebase Console';
      } else if (err.code === 'auth/too-many-requests') {
        errmsg = '⏱️ Too many attempts. Wait 24 hours';
      } else {
        errmsg = err.message || 'Failed to resend email';
      }
      
      toast.error(errmsg, { duration: 4000 });
    }
  };

  const checkVerificationStatus = async () => {
    try {
      console.log('[VERIFY-CHECK] Checking...');
      await auth.currentUser?.reload();
      
      if (auth.currentUser?.emailVerified) {
        toast.success('✅ Email verified! Redirecting...', { duration: 3000 });
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        toast.info('⏳ Not verified yet. Check your email', { duration: 3000 });
        setLastCheckTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('[VERIFY-CHECK] Error:', err);
      toast.error('Error checking status');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Verify Your Email</h2>
      <p>Please check your inbox and click on the verification link.</p>
      <p style={{ fontSize: '0.875rem', color: '#666' }}>📧 Check spam/junk folder if not found</p>

      <button onClick={resendEmail} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}>
        🔄 Resend Email
      </button>

      <button onClick={checkVerificationStatus} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        ✓ Check Status
      </button>

      {lastCheckTime && (
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '10px' }}>
          Last checked: {lastCheckTime}
        </p>
      )}

      <br /><br />

      <button onClick={() => window.location.href = '/login'} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Go to Login
      </button>
    </div>
  );
}