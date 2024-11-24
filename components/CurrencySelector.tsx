"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTripContext } from "@/context/TripContext";

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

const commonCurrencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
];

export default function CurrencySelector() {
  const { tripData, updateTripData } = useTripContext();
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY}/latest/EUR`
        );
        const data = await response.json();
        if (data.result === "success") {
          setExchangeRates(data.conversion_rates);
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
      }
    };

    fetchExchangeRates();
  }, []);

  const handleCurrencyChange = (value: string) => {
    updateTripData('currency', value);
  };

  return (
    <div className="flex justify-end">
      <Select
        value={tripData.currency}
        onValueChange={(value) => handleCurrencyChange(value)}
      >
        <SelectTrigger className="w-fit min-w-[120px] text-xs">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent className="text-xs">
          {commonCurrencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              {currency.symbol} {currency.code} - {currency.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}