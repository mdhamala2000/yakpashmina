# Security Fixes Implementation Guide

## Fix 1: Add Authentication to Payment Endpoints

### Payment Route (`server/route/payment.route.js`)

**Current:**
```javascript
router.post('/create-stripe-intent', createStripePaymentIntent);
```

**Fixed:**
```javascript
import auth from '../middlewares/auth.js';
router.post('/create-stripe-intent', auth, createStripePaymentIntent);
```

---

## Fix 2: Secure Stripe Routes (`server/route/stripe.route.js`)

### Add Authentication to Payment Operations

**Lines 146-161:** `POST /create-payment-intent`
```javascript
// BEFORE: No auth
router.post('/create-payment-intent', async (req, res) => {

// AFTER: Add auth
router.post('/create-payment-intent', auth, async (req, res) => {
```

**Lines 211-238:** `POST /confirm-payment`
```javascript
// BEFORE: No auth
router.post('/confirm-payment', async (req, res) => {

// AFTER: Add auth
router.post('/confirm-payment', auth, async (req, res) => {
```

**Lines 184-208:** `GET /payment-intent/:id`
```javascript
// BEFORE: No auth
router.get('/payment-intent/:id', async (req, res) => {

// AFTER: Add auth + ownership check
router.get('/payment-intent/:id', auth, async (req, res) => {
  // Verify user owns this payment intent (check against user ID in request)
```

### Fix Webhook Verification

**Lines 239-331:** The webhook handler
```javascript
// ADD STRICT VERIFICATION:
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const config = await getStripeKeys();
  const webhookSecret = config.webhookSecret;
  const sig = req.headers['stripe-signature'];

  // FIX: Reject if no webhook secret configured
  if (!webhookSecret) {
    console.error('SECURITY: Stripe webhook secret not configured');
    return res.status(400).json({ 
      error: true, 
      message: 'Webhook not configured' 
    });
  }

  // FIX: Reject if signature missing
  if (!sig) {
    console.error('SECURITY: Missing stripe signature');
    return res.status(401).json({ 
      error: true, 
      message: 'Missing signature' 
    });
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    // ... rest of handler
  } catch (err) {
    console.error('SECURITY: Webhook signature verification failed', err);
    return res.status(400).json({ error: err.message });
  }
});
```

### Secure Config Endpoints

**Lines 98-130:** Review these endpoints
```javascript
// Line 98: GET /config
router.get('/config', async (req, res) => {
  // ⚠️ ADD: Only return publishable key, NEVER secret key
  const config = await getStripeKeys();
  res.json({
    publishableKey: config.publishableKey,
    environment: config.environment
    // DO NOT include: secretKey, webhookSecret
  });
});

// Line 117: GET /public-config
router.get('/public-config', async (req, res) => {
  // ⚠️ ADD: Return ONLY non-sensitive config
  res.json({
    environment: 'test', // or 'live' based on keys
    // NO API keys, secrets, or sensitive data
  });
});

// Line 127: GET /paypal-config
router.get('/paypal-config', async (req, res) => {
  // ⚠️ ADD: Return ONLY client-side config
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID, // Public data only
    // NO secret, no sensitive config
  });
});
```

---

## Fix 3: Secure Airwallex Routes (`server/route/airwallex.route.js`)

**Line 6:** Add authentication
```javascript
import auth from '../middlewares/auth.js';

// BEFORE:
router.post('/create-intent', async (req, res) => {

// AFTER:
router.post('/create-intent', auth, async (req, res) => {
```

**Line 38:** Add authentication to intent retrieval
```javascript
// BEFORE:
router.get('/intent/:id', async (req, res) => {

// AFTER:
router.get('/intent/:id', auth, async (req, res) => {
```

---

## Fix 4: Add Payment Amount Validation

**Create new file:** `server/middlewares/paymentValidation.js`

```javascript
export const validatePaymentAmount = (req, res, next) => {
  const { amount, currency } = req.body;
  
  // Validate amount
  if (!amount || typeof amount !== 'number') {
    return res.status(400).json({
      error: true,
      message: 'Invalid amount'
    });
  }
  
  // Check amount is positive
  if (amount <= 0) {
    return res.status(400).json({
      error: true,
      message: 'Amount must be positive'
    });
  }
  
  // Check amount doesn't exceed max (e.g., $999,999)
  const MAX_AMOUNT = 999999.99;
  if (amount > MAX_AMOUNT) {
    return res.status(400).json({
      error: true,
      message: `Amount exceeds maximum limit of ${MAX_AMOUNT}`
    });
  }
  
  // Check minimum amount (e.g., $0.50)
  const MIN_AMOUNT = 0.50;
  if (amount < MIN_AMOUNT) {
    return res.status(400).json({
      error: true,
      message: `Amount must be at least ${MIN_AMOUNT}`
    });
  }
  
  next();
};
```

**Usage in stripe.route.js:**
```javascript
import { validatePaymentAmount } from '../middlewares/paymentValidation.js';

router.post('/create-payment-intent', auth, validatePaymentAmount, async (req, res) => {
  // ...
});

router.post('/confirm-payment', auth, validatePaymentAmount, async (req, res) => {
  // ...
});
```

---

## Fix 5: Remove Debug Endpoint

**File:** `server/index.js`, Lines 185-220

```javascript
// DELETE OR COMMENT OUT for production:
// app.get('/api/debug/fix-index', auth, requireAdmin, async (req, res) => { ... });

// OR keep only in development:
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/fix-index', auth, requireAdmin, async (req, res) => {
    // ... existing code
  });
}
```

---

## Fix 6: Add Transaction Logging Middleware

**Create new file:** `server/middlewares/transactionLogging.js`

```javascript
import TransactionLog from '../models/transactionLog.model.js';

export const logTransaction = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function(data) {
    try {
      if (req.path.includes('payment') || req.path.includes('stripe') || req.path.includes('airwallex')) {
        const log = {
          userId: req.user?._id || 'anonymous',
          method: req.method,
          path: req.path,
          body: req.body,
          statusCode: res.statusCode,
          timestamp: new Date(),
          ipAddress: req.ip
        };
        
        // Log async (don't block response)
        TransactionLog.create(log).catch(err => 
          console.error('Failed to log transaction:', err)
        );
      }
    } catch (err) {
      console.error('Logging error:', err);
    }

    originalSend.call(this, data);
  };

  next();
};
```

**Usage in index.js:**
```javascript
import { logTransaction } from './middlewares/transactionLogging.js';

app.use(logTransaction);
```

---

## Fix 7: Create TransactionLog Model

**Create new file:** `server/models/transactionLog.model.js`

```javascript
import mongoose from 'mongoose';

const transactionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  method: String,
  path: String,
  body: mongoose.Schema.Types.Mixed,
  statusCode: Number,
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 7776000 // Auto-delete after 90 days
  }
}, { collection: 'transactionLogs' });

export default mongoose.model('TransactionLog', transactionLogSchema);
```

---

## Fix 8: Add CSRF Protection (Optional but Recommended)

**Install dependency:**
```bash
npm install csurf
```

**Usage in index.js:**
```javascript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: false });

// Protect state-changing operations
app.post('/api/payment/*', csrfProtection, (req, res, next) => {
  // Verify CSRF token before processing
  next();
});
```

---

## Fix 9: Improve HTTPS Enforcement

**Replace in index.js lines 91-98:**

```javascript
// BEFORE - Header-based (unreliable):
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// AFTER - Use trusted proxy setting:
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy (nginx, cloudflare, etc)
  app.use((req, res, next) => {
    if (req.secure || req.get('X-Forwarded-Proto') === 'https') {
      return next();
    }
    res.redirect(`https://${req.get('host')}${req.url}`);
  });
  
  // Also add Strict-Transport-Security header
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Add authentication to all payment endpoints
- [ ] Verify config endpoints don't leak secrets
- [ ] Implement webhook signature verification
- [ ] Add payment amount validation
- [ ] Remove debug endpoints
- [ ] Enable transaction logging
- [ ] Set `NODE_ENV=production`
- [ ] Configure all required `.env` variables
- [ ] Run `npm audit --production`
- [ ] Test all payment flows
- [ ] Verify CORS allowlist is correct
- [ ] Enable HTTPS on reverse proxy
- [ ] Set up monitoring/alerting for payment failures

---

## Testing Commands

```bash
# Test unauthenticated endpoint (should fail)
curl -X POST http://localhost:5000/api/payment/create-stripe-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'

# Test with auth token (should work)
curl -X POST http://localhost:5000/api/payment/create-stripe-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 1000}'

# Test webhook signature verification
curl -X POST http://localhost:5000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid_signature" \
  -d '{}'
```

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Stripe Security Best Practices](https://stripe.com/docs/security/general)
