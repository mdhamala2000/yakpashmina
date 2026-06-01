import React, { useState, useMemo, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import { useCurrency } from '../../context/CurrencyContext';

const PriceFilter = ({ products = [], minPrice = 0, maxPrice, onPriceChange }) => {
  const { formatPrice } = useCurrency();

  const maxProductPrice = useMemo(() => {
    if (!products.length) return 10000;
    return Math.max(...products.map(p => Number(p.price) || 0));
  }, [products]);

  const max = maxPrice || maxProductPrice || 10000;
  const min = minPrice;

  const [uiRange, setUiRange] = useState([min, max]);

  useEffect(() => {
    setUiRange([min, max]);
  }, [min, max]);

  const debouncedNotify = useRef(
    debounce((range) => {
      onPriceChange?.(range);
    }, 300)
  ).current;

  useEffect(() => {
    return () => debouncedNotify.cancel();
  }, [debouncedNotify]);

  const handleMinChange = (e) => {
    const val = Number(e.target.value);
    const clamped = Math.min(val, uiRange[1] - 1);
    const newRange = [clamped, uiRange[1]];
    setUiRange(newRange);
    debouncedNotify(newRange);
  };

  const handleMaxChange = (e) => {
    const val = Number(e.target.value);
    const clamped = Math.max(val, uiRange[0] + 1);
    const newRange = [uiRange[0], clamped];
    setUiRange(newRange);
    debouncedNotify(newRange);
  };

  const range = max - min || 1;
  const leftPct = ((uiRange[0] - min) / range) * 100;
  const rightPct = 100 - ((uiRange[1] - min) / range) * 100;

  return (
    <div className="px-2">
      <div className="relative h-12">
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-200 rounded-full -translate-y-1/2">
          <div
            className="absolute h-full bg-orange-500 rounded-full"
            style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={uiRange[0]}
          onChange={handleMinChange}
          className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:z-10 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:z-10"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={uiRange[1]}
          onChange={handleMaxChange}
          className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:z-10 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:z-10"
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700 min-w-[70px] text-center">
          {formatPrice(uiRange[0])}
        </div>
        <span className="text-gray-400 text-xs">to</span>
        <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700 min-w-[70px] text-center">
          {formatPrice(uiRange[1])}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PriceFilter);
