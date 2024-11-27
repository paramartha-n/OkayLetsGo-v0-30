import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

type CurrencyMap = {
  [key: string]: string;
};

// Keep the map as a cache to avoid unnecessary API calls
const currencyCache: CurrencyMap = {};

export async function getCurrencyFromCity(city: string): Promise<string> {
  const normalizedCity = city.trim();
  
  // Check cache first
  const cachedCurrency = currencyCache[normalizedCity];
  if (cachedCurrency) {
    return cachedCurrency;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `What is the official currency (in ISO 4217 code) used in ${normalizedCity}?
    Only respond with the 3-letter currency code in uppercase.
    Example: For "Paris" respond with "EUR" or for "Tokyo" respond with "JPY".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const currency = response.text().trim().toUpperCase();

    // Validate that we got a proper 3-letter currency code
    if (/^[A-Z]{3}$/.test(currency)) {
      // Cache the result
      currencyCache[normalizedCity] = currency;
      return currency;
    }

    throw new Error("Invalid currency code format");
  } catch (error) {
    console.error(`Error getting currency for ${normalizedCity}:`, error);
    return 'USD'; // Default to USD if there's an error
  }
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
