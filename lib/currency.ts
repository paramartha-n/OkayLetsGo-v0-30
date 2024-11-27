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
  
  // Try exact match first
  let currency = cityToCurrency[normalizedCity];
  
  if (!currency) {
    // Try case-insensitive match
    const cityLower = normalizedCity.toLowerCase();
    const match = Object.entries(cityToCurrency).find(
      ([key]) => key.toLowerCase() === cityLower
    );
    if (match) {
      currency = match[1];
    }
  }

  // Default to USD if city not found (more common than EUR)
  return currency || 'USD';
}

export async function getExchangeRate(from: string, to: string): Promise<number> {
  // If same currency, return 1
  if (from === to) return 1;

  const apiKey = process.env.NEXT_PUBLIC_FREE_CURRENCY_API_KEY;
  if (!apiKey) {
    console.error('Free Currency API key not found');
    return 1;
  }

  try {
    const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${from}&currencies=${to}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.data || typeof data.data[to] !== 'number') {
      throw new Error('Invalid response format or missing rate');
    }
    
    const rate = data.data[to];
    if (rate <= 0) {
      throw new Error('Invalid exchange rate (less than or equal to 0)');
    }
    
    return rate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 1;
  }
}

export function formatCurrency(amount: string | number, currency: string): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return 'Free';
  }

  try {
    // Format number with 2 decimal places
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);

    // Return with ISO currency code
    return `${formattedNumber} ${currency}`;
  } catch (error) {
    // Fallback formatting if something goes wrong
    return `${numericAmount.toFixed(2)} ${currency}`;
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
