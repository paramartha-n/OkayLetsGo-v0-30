"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Car, Bus, PersonStanding } from "lucide-react";
import { useTripContext } from "@/context/TripContext";
import React from 'react';

const transportOptions = [
  {
    id: "walking",
    icon: <PersonStanding className="w-4 h-4" />,
    label: "Walking",
    description: "Explore the city on foot",
    typical: "Short distances",
  },
  {
    id: "public-transport",
    icon: <Bus className="w-4 h-4" />,
    label: "Public Transport",
    description: "Buses, metros & trams",
    typical: "City travel",
  },
  {
    id: "taxi",
    icon: <Car className="w-4 h-4" />,
    label: "Taxi/Ride-share",
    description: "On-demand rides",
    typical: "Flexible travel",
  },
  {
    id: "rental-car",
    icon: <Car className="w-4 h-4" />,
    label: "Rental Car",
    description: "Self-drive options",
    typical: "Independent travel",
  }
];

interface TransportStepProps {
  onNext: () => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function TransportStep({ onNext, onValidationChange }: TransportStepProps) {
  const { tripData, updateTripData } = useTripContext();

  const toggleTransport = (transportId: string) => {
    const newTransports = tripData.transport.includes(transportId)
      ? tripData.transport.filter((id) => id !== transportId)
      : [...tripData.transport, transportId];
    
    updateTripData('transport', newTransports);
    // Update validation state whenever transport options change
    onValidationChange?.(newTransports.length > 0);
  };

  // Set initial validation state on component mount
  React.useEffect(() => {
    onValidationChange?.(tripData.transport.length > 0);
  }, []);

  return (
    <div className="min-h-[75vh] md:min-h-full md:h-[80vh] md:px-[20%] flex items-center">
      <div className="w-full">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold mb-2">How would you like to get around?</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {transportOptions.map((transport) => (
            <Card
              key={transport.id}
              className={`cursor-pointer transition-all duration-200 ${
                tripData.transport.includes(transport.id)
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "hover:bg-primary/5"
              }`}
              onClick={() => toggleTransport(transport.id)}
            >
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-start justify-end space-x-2 sm:space-x-3">
                  <div className="flex-1 flex flex-col items-end space-y-1">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2 w-full">
                      <Label 
                        className={`font-bold text-[11px] sm:text-base truncate text-right ${
                          tripData.transport.includes(transport.id)
                            ? "text-primary"
                            : ""
                        }`}
                      >
                        {transport.label}
                      </Label>
                      <div className={`p-1.5 sm:p-2 rounded-full ${
                        tripData.transport.includes(transport.id)
                          ? "bg-primary/20 text-primary dark:bg-primary/30"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {transport.icon}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
                      {transport.description}
                    </p>
                    <div className={`inline-block px-2 py-1 mt-1 text-[10px] sm:text-xs rounded-full text-center ${
                      tripData.transport.includes(transport.id)
                        ? "bg-primary/20 text-primary dark:bg-primary/30"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {transport.typical}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}