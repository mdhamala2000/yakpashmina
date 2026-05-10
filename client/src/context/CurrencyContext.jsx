import { createContext, useContext, useState, useEffect } from 'react';

// Default rates (used for conversion)
const DEFAULT_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.50,
  AUD: 1.53,
  CAD: 1.36,
  AED: 3.67
};

// Base currency is USD - prices stored in USD
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1, region: 'United States', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92, region: 'Europe', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79, region: 'United Kingdom', flag: '🇬🇧' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.50, region: 'India', flag: '🇮🇳' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53, region: 'Australia', flag: '🇦🇺' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36, region: 'Canada', flag: '🇨🇦' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67, region: 'UAE', flag: '🇦🇪' }
};

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('selectedCurrency');
    return saved || 'USD';
  });
  
  const [region, setRegion] = useState(() => {
    return CURRENCIES[currency]?.region || 'United States';
  });

  useEffect(() => {
    localStorage.setItem('selectedCurrency', currency);
    setRegion(CURRENCIES[currency]?.region || 'United States');
  }, [currency]);

  const convertPrice = (priceInUSD) => {
    if (!priceInUSD || isNaN(priceInUSD)) return 0;
    const rate = CURRENCIES[currency]?.rate || 1;
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
    const rate = CURRENCIES[currency]?.rate || 1;
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
    exchangeRates: DEFAULT_RATES
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