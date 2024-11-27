import { useState, useEffect } from 'react';
import { getCurrencyFromCity } from '@/lib/currency';

export function useCurrency(city: string) {
  const [currency, setCurrency] = useState<string>('USD'); // Default to USD

  useEffect(() => {
    let mounted = true;

    async function fetchCurrency() {
      try {
        const result = await getCurrencyFromCity(city);
        if (mounted) {
          setCurrency(result);
        }
      } catch (error) {
        console.error('Error fetching currency:', error);
        if (mounted) {
          setCurrency('USD'); // Fallback to USD
        }
      }
    }

    fetchCurrency();

    return () => {
      mounted = false;
    };
  }, [city]);

  return currency;
}
