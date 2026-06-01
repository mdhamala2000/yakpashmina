# Credentials Management Checklist

## ✅ Required Environment Variables (for server/.env)

### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXX
```

### PayPal Configuration
```
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_ID_LIVE=
PAYPAL_CLIENT_ID_TEST=
PAYPAL_SECRET=
PAYPAL_MODE=sandbox
```

### Cloudinary Configuration
```
CLOUDINARY_CONFIG_API_KEY=
CLOUDINARY_CONFIG_API_SECRET=
CLOUDINARY_CLOUD_NAME=
```

### Database
```
MONGODB_CONNECTION_STRING=mongodb+srv://user:password@cluster.mongodb.net/database
```

### Authentication
```
SECRET_KEY_REFRESH_TOKEN=your-secret-key-for-jwt
```

### Application
```
PORT=5000
NODE_ENV=production
CLIENT_URL=https://yakpashamina.com
ALLOWED_ORIGINS=https://yakpashamina.com,https://www.yakpashamina.com
OWNER_EMAIL=admin@yakpashamina.com
```

### Optional: Firebase (for admin)
```
VITE_FIREBASE_APP_API_KEY=
VITE_FIREBASE_APP_AUTH_DOMAIN=
VITE_FIREBASE_APP_PROJECT_ID=
VITE_FIREBASE_APP_STORAGE_BUCKET=
VITE_FIREBASE_APP_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_APP_ID=
```

### Optional: Airwallex
```
AIRWALLEX_CLIENT_ID=
AIRWALLEX_API_KEY=
```

---

## 🔐 Security Verification Checklist

### Before Production Deployment:

- [ ] **Verify `.env` is in `.gitignore`**
  ```bash
  grep "\.env" .gitignore
  ```

- [ ] **Confirm no `.env` in git history**
  ```bash
  git log --all --full-history -- server/.env admin/.env client/.env
  ```

- [ ] **Check for exposed API keys in recent commits**
  ```bash
  git log -p --all | grep -i "api_key\|secret\|password" | head -20
  ```

- [ ] **Validate Stripe keys format**
  - Test key starts with: `sk_test_` or `sk_live_`
  - Publishable key starts with: `pk_test_` or `pk_live_`
  - Webhook secret starts with: `whsec_`

- [ ] **Verify MongoDB connection string**
  - Should NOT be in client-side code
  - Check it's only in `server/.env`

- [ ] **Check Firebase keys (should be fine - designed to be public)**
  - Firebase keys are intentionally exposed
  - Security is controlled via Firestore rules

- [ ] **Audit JWT secret**
  - Should be long and random (32+ characters)
  - Not derived from other credentials
  - Should be rotated if compromised

---

## 🧪 Testing Credentials Security

### 1. Test Unauthenticated Access (Should Fail)
```bash
# This should now return 401 Unauthorized
curl -X POST http://localhost:5000/api/payment/create-stripe-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'
```

Expected response:
```json
{
  "error": true,
  "message": "Unauthorized"
}
```

### 2. Test with Valid Auth Token (Should Work)
```bash
curl -X POST http://localhost:5000/api/payment/create-stripe-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount": 1000}'
```

### 3. Test Invalid Amount (Should Fail)
```bash
# Negative amount
curl -X POST http://localhost:5000/api/payment/create-stripe-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount": -100}'

# Amount too small
curl -X POST http://localhost:5000/api/payment/create-stripe-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount": 0.25}'

# Amount too large
curl -X POST http://localhost:5000/api/payment/create-stripe-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount": 1000000}'
```

### 4. Test Public Config Endpoint (Should NOT leak secrets)
```bash
curl http://localhost:5000/api/stripe/public-config | jq
```

Expected response (no API keys):
```json
{
  "error": false,
  "publishableKey": "pk_test_...",
  "currency": "usd"
}
```

### 5. Test Webhook Signature Validation (Should Fail)
```bash
# No signature
curl -X POST http://localhost:5000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid signature  
curl -X POST http://localhost:5000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid_signature" \
  -d '{}'
```

Expected response:
```json
{
  "error": true,
  "message": "Missing signature" / "Invalid webhook signature"
}
```

---

## 🔍 Credential Rotation Policy

### When to Rotate Credentials:

1. **Immediately:**
   - If any credential is accidentally committed to git
   - If breach is suspected
   - If developer leaves the team
   - If credentials appear in logs or monitoring

2. **Quarterly:**
   - Production API keys (best practice)
   - JWT secrets

3. **After Incidents:**
   - Any security incident
   - Failed payment processing
   - Unusual activity detected

### Steps to Rotate:

1. **Generate new credentials** from payment gateway/service
2. **Update `.env` file** with new values
3. **Test** with new credentials
4. **Monitor logs** for any errors
5. **Deactivate old credentials** after verification
6. **Document** the rotation in security log

---

## 📊 Credentials Audit Log

Track when credentials were last verified:

| Credential | Last Updated | By | Status |
|-----------|--------------|----|----|
| STRIPE_SECRET_KEY | 2026-05-30 | [You] | ✅ Valid |
| STRIPE_WEBHOOK_SECRET | 2026-05-30 | [You] | ✅ Valid |
| PAYPAL_CLIENT_ID | 2026-05-30 | [You] | ✅ Valid |
| MONGODB_CONNECTION | 2026-05-30 | [You] | ✅ Valid |
| JWT_SECRET | 2026-05-30 | [You] | ✅ Valid |

---

## 🚨 Emergency Actions

### If Credentials Are Leaked:

1. **Immediately notify:** Stripe, PayPal, Cloudinary support
2. **Rotate credentials:** Generate new API keys
3. **Update application:** Deploy new `.env` file
4. **Check logs:** Review for unauthorized access
5. **Monitor accounts:** Watch for fraudulent activity
6. **Update documentation:** Record incident details

---

## References

- [Stripe API Security](https://stripe.com/docs/security)
- [OWASP Credential Management](https://owasp.org/www-project-top-ten/)
- [12 Factor App - Config](https://12factor.net/config)
