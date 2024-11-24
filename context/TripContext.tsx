"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface TripData {
  city: string;
  originCity: string;
  dates: { from: Date | undefined; to: Date | undefined };
  hotel: {
    type: string;
    customHotel?: string;
  };
  transport: string[];
  activities: string[];
  restaurants: string[];
  preferences: string;
  budget: string;
  currency: string;
  showItinerary: boolean;
}

interface TripContextType {
  tripData: TripData;
  updateTripData: (field: keyof TripData, value: any) => void;
}

const defaultTripData: TripData = {
  city: '',
  originCity: '',
  dates: { from: undefined, to: undefined },
  hotel: { type: '' },
  transport: [],
  activities: [],
  restaurants: [],
  preferences: '',
  budget: '',
  currency: 'EUR',
  showItinerary: false
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [tripData, setTripData] = useState<TripData>(defaultTripData);

  const updateTripData = (field: keyof TripData, value: any) => {
    setTripData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <TripContext.Provider value={{ tripData, updateTripData }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
}