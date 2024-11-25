"use client";

import { useTripContext } from "@/context/TripContext";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const getNearestMajorCity = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&result_type=locality`
        );
        const data = await response.json();
        
        if (data.results && data.results[0]) {
          const city = data.results[0].address_components.find(
            (component: any) => component.types.includes('locality')
          )?.long_name;
          
          if (city) {
            handleCityChange(city);
          }
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    }, (error) => {
      console.error('Error getting location:', error);
    });
  };

  return (
    <div className="min-h-[75vh] md:min-h-full md:h-[80vh] md:px-[20%] flex items-center">
      <div className="w-full">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold mb-2">Where are you traveling from?</h2>
        </div>

        <div className="relative flex gap-2">
          <div className="flex-1">
            <PlacesAutocomplete
              value={tripData.originCity}
              onChange={handleCityChange}
              onSelect={() => onNext()}
              placeholder="Enter your departure city"
              autoFocus={true}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={getNearestMajorCity}
            title="Detect my location"
            className="w-[20%]"
          >
            <LocateFixed className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}