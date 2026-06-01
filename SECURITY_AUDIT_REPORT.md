# Security Audit Report - YakPashamina E-commerce Platform

**Date:** 2026-05-30  
**Status:** ⚠️ CRITICAL ISSUES FOUND

---

## Executive Summary

Found **8 CRITICAL security vulnerabilities** and several best-practice improvements needed. The application has good foundational security (rate limiting, CORS, sanitization) but exposes payment processing endpoints without authentication.

---

## 🔴 CRITICAL Issues

### 1. **Unauthenticated Payment Intent Creation**
- **File:** `server/route/payment.route.js:6`
- **Issue:** `/api/payment/create-stripe-intent` endpoint has NO authentication
- **Risk:** Anyone can create payment intents for any amount
- **Severity:** CRITICAL
- **Fix:** Add `auth` middleware

### 2. **Unauthenticated Stripe Payment Intent**
- **File:** `server/route/stripe.route.js:146`
- **Issue:** `POST /api/stripe/create-payment-intent` has NO authentication
- **Risk:** Unauthorized payment intent creation
- **Severity:** CRITICAL
- **Fix:** Add `auth` middleware

### 3. **Unauthenticated Payment Confirmation**
- **File:** `server/route/stripe.route.js:211`
- **Issue:** `POST /api/stripe/confirm-payment` has NO authentication
- **Risk:** Attackers can confirm arbitrary payments
- **Severity:** CRITICAL
- **Fix:** Add `auth` middleware

### 4. **Unauthenticated Airwallex Intent**
- **File:** `server/route/airwallex.route.js:6`
- **Issue:** `POST /api/airwallex/create-intent` has NO authentication
- **Risk:** Unauthorized payment gateway access
- **Severity:** CRITICAL
- **Fix:** Add `auth` middleware

### 5. **Unauthenticated Payment Intent Retrieval**
- **File:** `server/route/stripe.route.js:184`
- **Issue:** `GET /api/stripe/payment-intent/:id` has NO authentication
- **Risk:** Anyone can retrieve payment intent status/amount
- **Severity:** HIGH
- **Fix:** Add `auth` middleware

### 6. **Public Config Endpoints May Leak Data**
- **File:** `server/route/stripe.route.js:117, 127`
- **Issue:** `/api/stripe/public-config` and `/api/stripe/paypal-config` are publicly accessible
- **Risk:** May expose API keys or payment gateway configuration
- **Severity:** HIGH
- **Fix:** Review endpoint responses, ensure NO secret keys are exposed

### 7. **Webhook Signature Verification Missing**
- **File:** `server/route/stripe.route.js:239-260`
- **Issue:** Webhook verification only if `webhookSecret` exists, fails silently otherwise
- **Risk:** Webhook spoofing attacks if webhook secret isn't configured
- **Severity:** HIGH
- **Fix:** Reject webhooks if signature verification fails

### 8. **Debug Endpoint Exposed**
- **File:** `server/index.js:185`
- **Issue:** `/api/debug/fix-index` endpoint exists (though auth-protected)
- **Risk:** Debug endpoints shouldn't be in production
- **Severity:** MEDIUM
- **Fix:** Remove or only enable in development

---

## 🟡 HIGH Priority Issues

### 9. **HTTPS Not Enforced in Production**
- **Issue:** Only checks `x-forwarded-proto` header (can be spoofed)
- **Risk:** MITM attacks
- **Severity:** HIGH
- **Fix:** Use reverse proxy to enforce HTTPS, don't rely on headers

### 10. **No CSRF Protection**
- **Issue:** No CSRF tokens on state-changing endpoints
- **Severity:** MEDIUM
- **Fix:** Implement CSRF middleware for form submissions

### 11. **Insufficient Input Validation**
- **Issue:** Limit validation on payment amounts
- **Severity:** MEDIUM
- **Fix:** Add strict validation on monetary amounts (no negative, max limits)

### 12. **No Request Logging for Payment Transactions**
- **Issue:** Limited audit trail for payment attempts
- **Severity:** MEDIUM
- **Fix:** Add comprehensive transaction logging

---

## 🟢 GOOD Practices Found

✅ Rate limiting implemented (login: 5 attempts/15min, general: 100/min)  
✅ CORS properly configured with allowlist  
✅ MongoDB sanitization enabled  
✅ XSS prevention middleware  
✅ Helmet security headers  
✅ Auth checks on admin endpoints  
✅ JWT token implementation  
✅ Password hashing with bcrypt  

---

## 📋 Credentials & Environment Variables

### Current State
- ✅ `.env` file exists and is properly `.gitignore`d
- ✅ No `.env` file in git history
- ✅ Firebase config uses environment variables (admin & client)
- ✅ Cloudinary credentials use environment variables
- ⚠️ **Warning:** Stripe keys stored in both `.env` and database

### Required Environment Variables
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
CLOUDINARY_CONFIG_API_KEY=...
CLOUDINARY_CONFIG_API_SECRET=...
MONGODB_CONNECTION_STRING=...
SECRET_KEY_REFRESH_TOKEN=...
```

---

## 🔧 Dependencies Security

- ✅ No known high-severity vulnerabilities in production dependencies
- 📦 Recommended: Run `npm audit --production` regularly

---

## Priority Action Items

1. **IMMEDIATE (Today)**
   - [ ] Add authentication to all payment endpoints
   - [ ] Verify `/api/stripe/public-config` doesn't leak secrets
   - [ ] Fix webhook signature verification

2. **This Week**
   - [ ] Add CSRF protection
   - [ ] Add payment amount validation
   - [ ] Remove debug endpoints from production
   - [ ] Implement transaction logging

3. **This Month**
   - [ ] Implement proper HTTPS enforcement (via proxy, not headers)
   - [ ] Add comprehensive security testing
   - [ ] Implement API key rotation policy
   - [ ] Set up security monitoring/alerts

---

## Files Affected by Issues
- `server/route/payment.route.js`
- `server/route/stripe.route.js`
- `server/route/airwallex.route.js`
- `server/index.js`
- `server/controllers/payment.controller.js`
- `server/controllers/stripe.controller.js`

---

## Next Steps
See `SECURITY_FIXES.md` for implementation details.
