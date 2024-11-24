"use client";

import { useTripContext } from "@/context/TripContext";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";

interface OriginCityStepProps {
  onNext: () => void;
  isFirstStep: boolean;
}

export default function OriginCityStep({ onNext, isFirstStep }: OriginCityStepProps) {
  const { tripData, updateTripData } = useTripContext();

  const handleCityChange = (value: string) => {
    updateTripData('originCity', value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tripData.originCity.trim()) {
      onNext();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Where are you traveling from?</h2>
      </div>

      <div className="relative">
        <PlacesAutocomplete
          value={tripData.originCity}
          onChange={handleCityChange}
          onSelect={() => onNext()}
          placeholder="Enter your departure city"
          autoFocus={true}
        />
      </div>
    </div>
  );
}