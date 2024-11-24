"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Car, Bus, PersonStanding } from "lucide-react";
import { useTripContext } from "@/context/TripContext";

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
}

export default function TransportStep({ onNext }: TransportStepProps) {
  const { tripData, updateTripData } = useTripContext();

  const toggleTransport = (transportId: string) => {
    const newTransports = tripData.transport.includes(transportId)
      ? tripData.transport.filter((id) => id !== transportId)
      : [...tripData.transport, transportId];
    
    updateTripData('transport', newTransports);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">How would you like to get around?</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {transportOptions.map((transport) => (
          <Card
            key={transport.id}
            className={`cursor-pointer transition-all duration-200 ${
              tripData.transport.includes(transport.id)
                ? "border-traveloka-primary bg-traveloka-primary/5 dark:bg-traveloka-primary/10"
                : "hover:bg-traveloka-primary/5"
            }`}
            onClick={() => toggleTransport(transport.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${
                      tripData.transport.includes(transport.id)
                        ? "bg-traveloka-primary/20 text-traveloka-primary dark:bg-traveloka-primary/30"
                        : "bg-traveloka-primary/10 text-traveloka-primary"
                    }`}>
                      {transport.icon}
                    </div>
                    <Label 
                      className={`font-medium ${
                        tripData.transport.includes(transport.id)
                          ? "text-traveloka-primary"
                          : ""
                      }`}
                    >
                      {transport.label}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {transport.description}
                  </p>
                  <div className={`inline-block px-2 py-1 mt-1 text-xs rounded-full ${
                    tripData.transport.includes(transport.id)
                      ? "bg-traveloka-primary/20 text-traveloka-primary dark:bg-traveloka-primary/30"
                      : "bg-traveloka-primary/10 text-traveloka-primary"
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
  );
}