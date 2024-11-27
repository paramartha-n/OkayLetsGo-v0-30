type CurrencyMap = {
  [key: string]: string;
};

const cityToCurrency: CurrencyMap = {
  // Asia
  'Tokyo': 'JPY',
  'Osaka': 'JPY',
  'Kyoto': 'JPY',
  'Seoul': 'KRW',
  'Busan': 'KRW',
  'Beijing': 'CNY',
  'Shanghai': 'CNY',
  'Hong Kong': 'HKD',
  'Bangkok': 'THB',
  'Singapore': 'SGD',
  'Kuala Lumpur': 'MYR',
  'Jakarta': 'IDR',
  'Mumbai': 'INR',
  'Delhi': 'INR',

  // Middle East
  'Dubai': 'AED',
  'Abu Dhabi': 'AED',

  // Europe
  'Paris': 'EUR',
  'Rome': 'EUR',
  'Madrid': 'EUR',
  'Barcelona': 'EUR',
  'Berlin': 'EUR',
  'Amsterdam': 'EUR',
  'London': 'GBP',
  'Manchester': 'GBP',

  // North America
  'New York': 'USD',
  'Los Angeles': 'USD',
  'San Francisco': 'USD',
  'Las Vegas': 'USD',
  'Chicago': 'USD',
  'Toronto': 'CAD',
  'Vancouver': 'CAD',

  // Oceania
  'Sydney': 'AUD',
  'Melbourne': 'AUD',
  'Brisbane': 'AUD',
};

export function getCurrencyFromCity(city: string): string {
  // Clean up the city name and try to match
  const normalizedCity = city.trim();
  const currency = cityToCurrency[normalizedCity];
  
  // Default to EUR if city not found
  return currency || 'EUR';
}

export async function getExchangeRate(from: string, to: string): Promise<number> {
  const apiKey = process.env.NEXT_PUBLIC_FREE_CURRENCY_API_KEY;
  if (!apiKey) {
    console.error('Free Currency API key not found');
    return 1; // Fallback to 1:1 rate
  }

  try {
    const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${from}&currencies=${to}`;
    console.log('Fetching exchange rate:', { from, to, url });
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}, response:`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Exchange rate response:', data);
    
    if (!data.data || !data.data[to]) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format');
    }
    
    return data.data[to];
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 1; // Fallback to 1:1 rate
  }
}

export function formatCurrency(amount: string | number, currency: string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return 'Free';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  } catch (error) {
    // Fallback formatting if currency code is invalid
    return `${currency} ${numericAmount.toFixed(2)}`;
  }
}

export interface DualPriceResult {
  localPrice: string;
  userPrice: string;
  localAmount: number;
  userAmount: number;
}

export async function formatDualPrice(
  amount: string | number,
  localCurrency: string,
  userCurrency: string
): Promise<DualPriceResult> {
  if (!amount || amount === 'Free') {
    return {
      localPrice: 'Free',
      userPrice: 'Free',
      localAmount: 0,
      userAmount: 0
    };
  }

  const localAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(localAmount)) {
    return {
      localPrice: 'Free',
      userPrice: 'Free',
      localAmount: 0,
      userAmount: 0
    };
  }

  try {
    const rate = await getExchangeRate(localCurrency, userCurrency);
    const userAmount = localAmount * rate;

    return {
      localPrice: formatCurrency(localAmount, localCurrency),
      userPrice: formatCurrency(userAmount, userCurrency),
      localAmount,
      userAmount
    };
  } catch (error) {
    console.error('Error formatting dual price:', error);
    return {
      localPrice: formatCurrency(localAmount, localCurrency),
      userPrice: formatCurrency(localAmount, userCurrency), // Fallback to 1:1 conversion
      localAmount,
      userAmount: localAmount
    };
  }
}
