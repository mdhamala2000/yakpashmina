import { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.50,
  AUD: 1.53,
  CAD: 1.36,
  AED: 3.67
};

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', region: 'United States', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', region: 'Europe', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', region: 'United Kingdom', flag: '🇬🇧' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', region: 'India', flag: '🇮🇳' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', region: 'Australia', flag: '🇦🇺' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', region: 'Canada', flag: '🇨🇦' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', region: 'UAE', flag: '🇦🇪' }
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('selectedCurrency');
    return saved || 'USD';
  });

  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('exchangeRates');
    return saved ? JSON.parse(saved) : DEFAULT_RATES;
  });

  const [ratesSource, setRatesSource] = useState('default');

  const [region, setRegion] = useState(() => {
    return CURRENCIES[currency]?.region || 'United States';
  });

  useEffect(() => {
    localStorage.setItem('selectedCurrency', currency);
    setRegion(CURRENCIES[currency]?.region || 'United States');
  }, [currency]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(`${VITE_API_URL}/api/currency/rates`);
        const data = await res.json();
        if (data?.rates) {
          setRates(data.rates);
          setRatesSource(data.source || 'live');
          localStorage.setItem('exchangeRates', JSON.stringify(data.rates));
        }
      } catch {
        const saved = localStorage.getItem('exchangeRates');
        if (saved) {
          setRates(JSON.parse(saved));
          setRatesSource('cache');
        }
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const convertPrice = (priceInUSD) => {
    if (!priceInUSD || isNaN(priceInUSD)) return 0;
    const rate = rates[currency] || 1;
    return Math.round((priceInUSD * rate) * 100) / 100;
  };

  const formatPrice = (priceInUSD, showSymbol = true) => {
    const converted = convertPrice(priceInUSD);
    const symbol = CURRENCIES[currency]?.symbol || '$';

    if (showSymbol) {
      return `${symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatPriceRange = (minPrice, maxPrice) => {
    const min = convertPrice(minPrice);
    const max = convertPrice(maxPrice);
    const symbol = CURRENCIES[currency]?.symbol || '$';
    return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
  };

  const convertBackToUSD = (priceInCurrency) => {
    if (!priceInCurrency || isNaN(priceInCurrency)) return 0;
    const rate = rates[currency] || 1;
    return Math.round((priceInCurrency / rate) * 100) / 100;
  };

  const value = {
    currency,
    setCurrency,
    region,
    currencies: CURRENCIES,
    convertPrice,
    formatPrice,
    formatPriceRange,
    convertBackToUSD,
    currentCurrency: CURRENCIES[currency],
    CURRENCIES,
    exchangeRates: rates,
    ratesSource
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
