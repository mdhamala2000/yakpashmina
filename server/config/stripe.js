import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Currency conversion helpers
export const formatAmountForStripe = (amount, currency) => {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = false;
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = true;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount, currency) => {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = false;
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = true;
    }
  }
  return zeroDecimalCurrency ? amount : amount / 100;
};

// Map Stripe status to our status
export const mapStripeStatus = (stripeStatus) => {
  const statusMap = {
    'succeeded': 'succeeded',
    'requires_payment_method': 'requires_payment_method',
    'requires_confirmation': 'requires_confirmation',
    'requires_action': 'requires_action',
    'processing': 'processing',
    'canceled': 'canceled',
    'payment_failed': 'failed',
  };
  return statusMap[stripeStatus] || stripeStatus;
};

// Get status display info
export const getStatusInfo = (status) => {
  const statusConfig = {
    succeeded: { label: 'Succeeded', color: 'text-green-600', bgColor: 'bg-green-100' },
    refunded: { label: 'Refunded', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    partially_refunded: { label: 'Partially Refunded', color: 'text-purple-500', bgColor: 'bg-purple-50' },
    requires_payment_method: { label: 'Incomplete', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    requires_confirmation: { label: 'Pending', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    requires_action: { label: 'Action Required', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    processing: { label: 'Processing', color: 'text-blue-500', bgColor: 'bg-blue-50' },
    canceled: { label: 'Canceled', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    failed: { label: 'Failed', color: 'text-red-600', bgColor: 'bg-red-100' },
  };
  return statusConfig[status] || { label: status, color: 'text-gray-600', bgColor: 'bg-gray-100' };
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

// Date formatting
export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatShortDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};