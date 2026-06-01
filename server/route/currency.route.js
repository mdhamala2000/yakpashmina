import express from 'express';
import axios from 'axios';

const router = express.Router();

let cachedRates = null;
let lastFetchTime = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000;

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'AED'];

const DEFAULT_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.50,
  AUD: 1.53,
  CAD: 1.36,
  AED: 3.67
};

router.get('/rates', async (req, res) => {
  const now = Date.now();
  if (cachedRates && (now - lastFetchTime) < CACHE_DURATION) {
    return res.json({ error: false, rates: cachedRates, source: 'cache' });
  }

  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 5000
    });

    const allRates = response.data.rates || {};
    const filtered = {};
    for (const code of SUPPORTED_CURRENCIES) {
      filtered[code] = allRates[code] || DEFAULT_RATES[code];
    }

    cachedRates = filtered;
    lastFetchTime = now;

    return res.json({ error: false, rates: filtered, source: 'live' });
  } catch (error) {
    console.error('Currency rate fetch error:', error.message);
    if (cachedRates) {
      return res.json({ error: false, rates: cachedRates, source: 'stale-cache' });
    }
    return res.json({ error: false, rates: DEFAULT_RATES, source: 'default' });
  }
});

export default router;
