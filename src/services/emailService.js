import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const emailClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

console.log('[EMAIL-SERVICE] Configured with API URL:', API_URL);

/**
 * Send verification email via Nodemailer backend
 * @param {string} email - User email address
 * @param {string} uid - Firebase user ID
 * @param {string} displayName - User display name
 * @returns {Promise}
 */
export async function sendVerificationEmailViaBackend(email, uid, displayName) {
  try {
    console.log('[EMAIL-SERVICE] Sending verification email via backend');
    console.log('[EMAIL-SERVICE] User:', { email, uid, displayName });

    const response = await emailClient.post('/send-verification-email', {
      email,
      uid,
      displayName,
    });

    console.log('[EMAIL-SERVICE] ✓ Email sent successfully');
    console.log('[EMAIL-SERVICE] Response:', response.data);

    return {
      success: true,
      message: response.data.message,
      email: response.data.email,
    };
  } catch (error) {
    console.error('[EMAIL-SERVICE] ❌ Failed to send email');
    console.error('[EMAIL-SERVICE] Error code:', error.response?.data?.error);
    console.error('[EMAIL-SERVICE] Error message:', error.response?.data?.message || error.message);
    console.error('[EMAIL-SERVICE] Full error:', error);

    throw {
      code: error.response?.data?.error || 'email/send-failed',
      message: error.response?.data?.message || error.message || 'Failed to send verification email',
    };
  }
}

/**
 * Resend verification email via Nodemailer backend
 * @param {string} email - User email address
 * @param {string} displayName - User display name
 * @returns {Promise}
 */
export async function resendVerificationEmailViaBackend(email, displayName) {
  try {
    console.log('[EMAIL-SERVICE] Resending verification email via backend');
    console.log('[EMAIL-SERVICE] Email:', email);

    const response = await emailClient.post('/resend-verification-email', {
      email,
      displayName,
    });

    console.log('[EMAIL-SERVICE] ✓ Email resent successfully');
    console.log('[EMAIL-SERVICE] Response:', response.data);

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error('[EMAIL-SERVICE] ❌ Failed to resend email');
    console.error('[EMAIL-SERVICE] Error code:', error.response?.data?.error);
    console.error('[EMAIL-SERVICE] Error message:', error.response?.data?.message || error.message);
    console.error('[EMAIL-SERVICE] Full error:', error);

    throw {
      code: error.response?.data?.error || 'email/resend-failed',
      message: error.response?.data?.message || error.message || 'Failed to resend verification email',
    };
  }
}

/**
 * Check health of email service
 * @returns {Promise}
 */
export async function checkEmailServiceHealth() {
  try {
    console.log('[EMAIL-SERVICE] Checking health...');
    const response = await emailClient.get('/health');
    console.log('[EMAIL-SERVICE] ✓ Health check passed:', response.data);
    return response.data;
  } catch (error) {
    console.error('[EMAIL-SERVICE] ❌ Health check failed:', error.message);
    throw error;
  }
}
