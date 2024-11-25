"use client";

import { MapPin } from "lucide-react";
import { useTripContext } from "@/context/TripContext";
import { Textarea } from "@/components/ui/textarea";

interface PreferencesStepProps {
  onNext: () => void;
}

export default function PreferencesStep({ onNext }: PreferencesStepProps) {
  const { tripData, updateTripData } = useTripContext();

  const handlePreferencesChange = (value: string) => {
    updateTripData('preferences', value);
  };

  return (
    <div className="min-h-[75vh] md:min-h-full md:h-[80vh] md:px-[20%] flex items-center">
      <div className="w-full">
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold mb-2">Any specific places or activities?</h2>
            <p className="text-muted-foreground text-sm">
              List any must-visit places or must-do activities you'd like included in your itinerary
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-3 left-3 text-muted-foreground">
              <MapPin className="w-5 h-5" />
            </div>
            <Textarea
              value={tripData.preferences}
              onChange={(e) => handlePreferencesChange(e.target.value)}
              className="min-h-[200px] pl-10 resize-none"
              placeholder="Visit the Eiffel Tower at sunset, Take a cooking class.."
            />
          </div>
        </div>
      </div>
    </div>
  );
}