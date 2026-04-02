require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('[EMAIL] Nodemailer configuration error:', error);
  } else {
    console.log('[EMAIL] ✓ Nodemailer configured successfully');
    console.log('[EMAIL] Using:', process.env.EMAIL_USER);
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'email-service' });
});

// Send Verification Email
app.post('/send-verification-email', async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;

    console.log('[EMAIL-VERIFY] Sending verification email to:', email);
    console.log('[EMAIL-VERIFY] User:', { uid, displayName });

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate custom verification link
    const verificationLink = await admin.auth().generateEmailVerificationLink(email);
    console.log('[EMAIL-VERIFY] Generated verification link');

    // Send email
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✉️ Verify Your Email - Weather Dashboard',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          
          <!-- Main Container -->
          <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
            
            <!-- Header with Gradient -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 300; letter-spacing: 1px;">
                ☁️ Weather Dashboard
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Email Verification</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <h2 style="color: #333; font-size: 24px; margin: 0 0 10px 0; font-weight: 600;">
                Welcome, ${displayName || 'Friend'}! 🎉
              </h2>
              
              <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <!-- Message -->
              <div style="margin: 30px 0;">
                <p style="color: #555; font-size: 16px; line-height: 1.8; margin: 0 0 15px 0;">
                  Thank you for joining <strong>Weather Dashboard</strong>! We're excited to have you on board.
                </p>
                <p style="color: #555; font-size: 16px; line-height: 1.8; margin: 0 0 15px 0;">
                  To get started and access all features, please verify your email address by clicking the button below.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 45px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                  ✓ Verify Email Address
                </a>
              </div>

              <!-- Info Box -->
              <div style="background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 4px; margin: 30px 0;">
                <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>Link not working?</strong> Copy and paste this link in your browser:
                </p>
                <p style="color: #667eea; font-size: 12px; word-break: break-all; margin: 10px 0 0 0; font-family: 'Courier New', monospace;">
                  ${verificationLink}
                </p>
              </div>

              <!-- Features -->
              <div style="background-color: #f8f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #333; font-weight: 600; font-size: 14px; margin: 0 0 15px 0;">
                  What you can do with Weather Dashboard:
                </p>
                <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">🌍 Check weather in any city worldwide</li>
                  <li style="margin-bottom: 8px;">📊 View detailed forecasts and charts</li>
                  <li style="margin-bottom: 8px;">⚙️ Customize your dashboard settings</li>
                  <li style="margin-bottom: 8px;">🔔 Get real-time weather updates</li>
                </ul>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 30px 0;">
                <p style="color: #856404; font-size: 13px; margin: 0; line-height: 1.6;">
                  <strong>🔒 Security:</strong> This verification link expires in <strong>24 hours</strong>. Don't share this email with others.
                </p>
              </div>

            </div>

            <!-- Divider -->
            <div style="height: 1px; background-color: #eee; margin: 0;"></div>

            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0 0 15px 0;">
                If you didn't create this account, please <a href="mailto:${process.env.EMAIL_USER}" style="color: #667eea; text-decoration: none;">contact us</a> immediately.
              </p>
              <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                <p style="color: #bbb; font-size: 11px; margin: 0;">
                  Weather Dashboard • © ${new Date().getFullYear()} All rights reserved<br>
                  Powered by modern weather technology 🌤️
                </p>
              </div>
            </div>

          </div>

        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL-VERIFY] ✓ Email sent successfully:', info.response);

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      email: email,
    });
  } catch (error) {
    console.error('[EMAIL-VERIFY] ❌ Error sending verification email:', error);
    res.status(500).json({
      error: 'Failed to send verification email',
      message: error.message,
    });
  }
});

// Resend Verification Email
app.post('/resend-verification-email', async (req, res) => {
  try {
    const { email, displayName } = req.body;

    console.log('[EMAIL-RESEND] Resending verification email to:', email);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get user from Firebase
    const user = await admin.auth().getUserByEmail(email);
    console.log('[EMAIL-RESEND] User found:', user.uid);

    // Generate verification link
    const verificationLink = await admin.auth().generateEmailVerificationLink(email);

    // Send email (same as above)
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔄 Resend: Verify Your Email - Weather Dashboard',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          
          <!-- Main Container -->
          <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
            
            <!-- Header with Gradient -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 300; letter-spacing: 1px;">
                ☁️ Weather Dashboard
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Email Verification (Resend)</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <h2 style="color: #333; font-size: 24px; margin: 0 0 10px 0; font-weight: 600;">
                Verification Link Resent 🔔
              </h2>
              
              <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <!-- Message -->
              <div style="margin: 30px 0;">
                <p style="color: #555; font-size: 16px; line-height: 1.8; margin: 0 0 15px 0;">
                  We've sent you a fresh verification link! Click the button below to verify your email address.
                </p>
                <p style="color: #555; font-size: 16px; line-height: 1.8; margin: 0 0 15px 0;">
                  This is a new link, so any previous links are no longer valid.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 45px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                  ✓ Verify Email Address
                </a>
              </div>

              <!-- Info Box -->
              <div style="background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 4px; margin: 30px 0;">
                <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>Link not working?</strong> Copy and paste this link in your browser:
                </p>
                <p style="color: #667eea; font-size: 12px; word-break: break-all; margin: 10px 0 0 0; font-family: 'Courier New', monospace;">
                  ${verificationLink}
                </p>
              </div>

              <!-- Tips -->
              <div style="background-color: #f8f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #333; font-weight: 600; font-size: 14px; margin: 0 0 15px 0;">
                  💡 Tips:
                </p>
                <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Check your spam or junk folder</li>
                  <li style="margin-bottom: 8px;">Look for emails from Weather Dashboard</li>
                  <li style="margin-bottom: 8px;">Make sure you're using the right email address</li>
                  <li style="margin-bottom: 8px;">Link expires in 24 hours - verify soon!</li>
                </ul>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 30px 0;">
                <p style="color: #856404; font-size: 13px; margin: 0; line-height: 1.6;">
                  <strong>🔒 Security:</strong> This verification link expires in <strong>24 hours</strong>. Don't share this email with others.
                </p>
              </div>

            </div>

            <!-- Divider -->
            <div style="height: 1px; background-color: #eee; margin: 0;"></div>

            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0 0 15px 0;">
                If you still need help, please <a href="mailto:${process.env.EMAIL_USER}" style="color: #667eea; text-decoration: none;">contact support</a>.
              </p>
              <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                <p style="color: #bbb; font-size: 11px; margin: 0;">
                  Weather Dashboard • © ${new Date().getFullYear()} All rights reserved<br>
                  Powered by modern weather technology 🌤️
                </p>
              </div>
            </div>

          </div>

        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL-RESEND] ✓ Email resent successfully');

    res.json({
      success: true,
      message: 'Verification email resent successfully',
    });
  } catch (error) {
    console.error('[EMAIL-RESEND] ❌ Error resending verification email:', error);
    res.status(500).json({
      error: 'Failed to resend verification email',
      message: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[SERVER] Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n[SERVER] ✓ Email service started on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV}`);
  console.log(`[SERVER] Email service: ${process.env.EMAIL_SERVICE}`);
});
