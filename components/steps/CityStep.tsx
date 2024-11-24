"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useTripContext } from "@/context/TripContext";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";

interface CityStepProps {
  onNext: () => void;
  isFirstStep: boolean;
}

export default function CityStep({ onNext, isFirstStep }: CityStepProps) {
  const { tripData, updateTripData } = useTripContext();

  const handleCityChange = (value: string) => {
    updateTripData('city', value);
  };

  const handleNext = () => {
    if (tripData.city.trim()) {
      onNext();
    }
  };

  const handleSelect = () => {
    // When a place is selected from autocomplete, advance immediately
    onNext();
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Where would you like to go?</h2>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <PlacesAutocomplete
            value={tripData.city}
            onChange={handleCityChange}
            onSelect={handleSelect}
            placeholder="Enter a city name"
            autoFocus={true}
          />
        </div>
        <Button 
          onClick={handleNext}
          disabled={!tripData.city.trim()}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}