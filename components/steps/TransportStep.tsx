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
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "hover:bg-accent/50"
            }`}
            onClick={() => toggleTransport(transport.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${
                      tripData.transport.includes(transport.id)
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {transport.icon}
                    </div>
                    <Label 
                      className={`font-medium ${
                        tripData.transport.includes(transport.id)
                          ? "text-emerald-700 dark:text-emerald-400"
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
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "bg-accent text-muted-foreground"
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