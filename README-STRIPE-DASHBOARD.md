# Stripe Payment Dashboard - Setup Guide

## Quick Start

### Prerequisites
1. **Node.js** (v18+)
2. **Stripe Account** - Get API keys from https://dashboard.stripe.com/apikeys
3. **Stripe CLI** - For webhook forwarding (https://stripe.com/docs/stripe-cli)

---

## 1. Environment Setup

### Server (.env file)
Add these to your server's `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Client (.env file)
Add to client's `.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
VITE_API_URL=http://localhost:8000
```

---

## 2. Start the Application

### Terminal 1 - Server
```bash
cd server
npm run dev
```

### Terminal 2 - Client
```bash
cd client
npm run dev
```

---

## 3. Stripe Webhook Setup (Required)

### Option A: Using Stripe CLI (Recommended for Development)

1. **Install Stripe CLI**: https://stripe.com/docs/stripe-cli

2. **Login to Stripe**:
```bash
stripe login
```

3. **Forward webhooks**:
```bash
stripe listen --forward-to localhost:8000/api/stripe-webhook/webhook
```

4. **Copy the webhook secret** - The CLI will show a secret like `whsec_xxxxxxx`. Add it to your `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

### Option B: Using Stripe Dashboard (Production)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Add endpoint: `https://your-domain.com/api/stripe-webhook/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy the signing secret to your `.env`

---

## 4. Access the Dashboard

- **URL**: http://localhost:5173/admin/stripe-dashboard
- **Features**:
  - View all transactions
  - Filter by status (Succeeded, Incomplete, Failed, Refunded)
  - Search by payment ID, email, or description
  - Create new payments
  - Complete incomplete payments
  - Capture uncaptured payments
  - Issue refunds
  - View analytics charts

---

## 5. Test Payments

Use Stripe's test cards:

| Card Number | Description |
|-------------|-------------|
| `4242424242424242` | Success - Valid card |
| `4000000000000002` | Failure - Declined |
| `4000002500003155` | Requires authentication |
| `4242424242424242` | 3D Secure challenge |

**Test Expiry**: Any future date (e.g., 12/28)
**Test CVC**: Any 3 digits (e.g., 123)

---

## 6. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stripe-payments/payments` | List all payments |
| GET | `/api/stripe-payments/payments/:id` | Get payment details |
| POST | `/api/stripe-payments/create-payment` | Create payment intent |
| POST | `/api/stripe-payments/confirm-payment` | Confirm payment |
| POST | `/api/stripe-payments/capture-payment` | Capture uncaptured payment |
| POST | `/api/stripe-payments/refund-payment` | Refund payment |
| POST | `/api/stripe-payments/cancel-payment` | Cancel payment |
| GET | `/api/stripe-payments/analytics` | Get analytics data |
| POST | `/api/stripe-webhook/webhook` | Stripe webhook handler |

---

## 7. Production Deployment

### Deploy to Railway/Render (Backend)

1. Push your code to GitHub
2. Connect repo to Railway/Render
3. Set environment variables:
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Your webhook signing secret
   - `NODE_ENV=production`
4. Deploy

### Deploy to Vercel (Frontend)

1. Build the client: `cd client && npm run build`
2. Deploy the `dist` folder to Vercel
3. Set environment variables in Vercel dashboard

### Update Webhook URL for Production

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Update endpoint URL to your production URL:
   ```
   https://your-backend-domain.com/api/stripe-webhook/webhook
   ```

---

## 8. Customization Notes

### Authentication
Currently no authentication is required. To add auth:

```javascript
// Add to any API route
const auth = require('./middlewares/auth');

// Apply to routes
router.get('/payments', auth, async (req, res) => {
  // Your code
});
```

### Database Integration
Currently payments are fetched directly from Stripe. To store in your database:

1. Create a `payments` collection in MongoDB
2. In the webhook handler, save payment data:

```javascript
// In webhook handler
if (event.type === 'payment_intent.succeeded') {
  const payment = event.data.object;
  await PaymentModel.create({
    stripeId: payment.id,
    amount: payment.amount / 100,
    currency: payment.currency,
    status: 'succeeded',
    customerEmail: payment.receipt_email,
    createdAt: new Date(payment.created * 1000)
  });
}
```

---

## 9. Troubleshooting

### "Payment method not found" error
- Ensure the payment intent exists in Stripe dashboard
- Check that the client secret is valid

### Webhook not receiving events
- Verify Stripe CLI is running (`stripe listen`)
- Check the webhook secret matches in `.env` and Stripe dashboard

### CORS errors
- Ensure your server allows requests from your frontend domain
- Update the `allowedOrigins` in `server/index.js`

---

## 10. Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + TanStack Table
- **Backend**: Node.js + Express
- **Payment**: Stripe SDK
- **Charts**: Recharts (optional)
- **Forms**: React Hook Form (optional)

---

## License

MIT License - Feel free to use this for your projects!