# Email Service Setup Guide

This backend service sends verification emails using Nodemailer instead of Firebase's default email.

## Prerequisites

- Node.js 14+ installed
- Firebase Admin SDK credentials
- Email account credentials (Gmail, Outlook, or custom SMTP)

---

## Step 1: Get Firebase Admin SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `nimbus-wheather`
3. Go to **Project Settings** (⚙️) → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as: `/server/firebase-service-account.json`
6. **Keep this file secret** - add to `.gitignore`

---

## Step 2: Set Up Email Credentials

### Option A: Gmail (Recommended for Testing)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Under "App passwords", create a new password for "Mail" on "Other (custom name)"
4. Name it: `Weather Dashboard`
5. Copy the 16-character password

### Option B: Custom SMTP (Outlook, SendGrid, etc.)

Use your SMTP server details:
- Service: smtp.outlook.com, smtp.sendgrid.net, etc.
- Port: 587 or 465
- Username & Password from your provider

---

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit `server/.env` with your credentials:
   ```env
   # For Gmail
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   EMAIL_FROM_NAME=Weather Dashboard

   # For Custom SMTP
   # EMAIL_SERVICE=gmail (or false)
   # EMAIL_HOST=smtp.outlook.com
   # EMAIL_PORT=587
   # EMAIL_USER=your-email@outlook.com
   # EMAIL_PASSWORD=your-password

   SERVER_PORT=5000
   NODE_ENV=development
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_FIREBASE_API_KEY=your_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

3. Create `server/firebase-service-account.json` with the service account JSON

---

## Step 4: Install & Run

### Install Dependencies

```bash
cd server
npm install
```

### Start the Service

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

You should see:
```
[SERVER] ✓ Email service started on port 5000
[SERVER] Environment: development
[SERVER] Email service: gmail
[EMAIL] ✓ Nodemailer configured successfully
```

---

## Step 5: Run Frontend with Backend

In a separate terminal:

```bash
# Make sure server is running on port 5000
cd ..
npm start
```

The React app will now:
1. Create account in Firebase
2. Call your backend to send email via Nodemailer
3. User receives email from your email address

---

## API Endpoints

### Send Verification Email
```
POST /send-verification-email
Content-Type: application/json

{
  "uid": "firebase-user-id",
  "email": "user@example.com",
  "displayName": "John Doe"
}

Response:
{
  "success": true,
  "message": "Verification email sent successfully",
  "email": "user@example.com"
}
```

### Resend Verification Email
```
POST /resend-verification-email
Content-Type: application/json

{
  "email": "user@example.com",
  "displayName": "John Doe"
}

Response:
{
  "success": true,
  "message": "Verification email resent successfully"
}
```

### Health Check
```
GET /health

Response:
{
  "status": "OK",
  "service": "email-service"
}
```

---

## Troubleshooting

### Error: "Nodemailer configuration error"
- **Cause**: Invalid email credentials
- **Solution**: Check EMAIL_USER and EMAIL_PASSWORD in .env
- For Gmail: Make sure you used app-specific password, not main password

### Error: "ECONNREFUSED: Connection refused"
- **Cause**: Server not running
- **Solution**: Make sure npm start/dev is running in server directory

### Error: "Failed to send verification email"
- **Cause**: Firebase service account not configured
- **Solution**: Add firebase-service-account.json to server directory

### Emails going to spam
- **Cause**: Google's spam filter
- **Solution**:
  1. Mark email as "Not spam" in inbox
  2. Add reply-to headers in backend
  3. Use custom domain SMTP

### "Cannot GET /send-verification-email"
- **Cause**: Frontend trying to call Firebase's sendEmailVerification instead of backend
- **Solution**: Make sure frontend API_URL is set correctly

---

## Security Best Practices

1. **Never commit credentials**
   ```bash
   echo "firebase-service-account.json" >> .gitignore
   echo "server/.env" >> .gitignore
   ```

2. **Use environment variables**
   - Never hardcode passwords
   - Store sensitive data in .env only

3. **Verify requests** (optional for production)
   - Add API key validation
   - Add CORS whitelist

4. **Rate limiting** (optional)
   - Add rate limiter to prevent spam

---

## Production Deployment

### Environment Setup
1. Set environment variables on your hosting platform:
   - Heroku: Config Vars
   - AWS: Environment Variables
   - Digital Ocean: App Spec

2. Ensure `firebase-service-account.json` is accessible:
   - Store in file system, OR
   - Set FIREBASE_CREDENTIALS as env variable

### Hosting Options
- **Heroku** (easy, free tier available)
- **AWS Lambda** (serverless)
- **Digital Ocean App Platform**
- **Railway.app** (simple deployment)
- **Render.com**

---

## Test the Email Service

```bash
# Check if server is running
curl http://localhost:5000/health

# Should return:
# {"status":"OK","service":"email-service"}
```

---

## Logs to Check

Check console for these messages:

```
[SERVER] ✓ Email service started          ← Server running
[EMAIL] ✓ Nodemailer configured          ← Email configured
[EMAIL-VERIFY] Email sent successfully    ← Email sent
[EMAIL-VERIFY] ❌ Error sending...        ← Email failed
```

---

## Need Help?

Check:
1. **Console logs** (both frontend & backend)
2. **Firebase Service Account** is valid
3. **.env file** has correct credentials
4. **email credentials** work with Gmail App Passwords
5. **CORS** configured if frontend on different port
