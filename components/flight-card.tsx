"use client";

import { format } from "date-fns";
import { Ban, Banknote, ExternalLink, Plane } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

interface FlightCardProps {
  originCity: string;
  destinationCity: string;
  departureDate: Date;
  returnDate: Date;
  skyscannerUrl?: string;
  estimatedPrice?: {
    min: number;
    max: number;
  };
}

export function FlightCard({
  originCity,
  destinationCity,
  departureDate,
  returnDate,
  skyscannerUrl,
  estimatedPrice = { min: 150, max: 300 },
}: FlightCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Flights</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(skyscannerUrl, '_blank')}
            className="flex items-center space-x-2"
          >
            <span>Search on Skyscanner</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Outbound Flight */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Plane className="w-4 h-4" />
              <h4 className="font-medium">Outbound Flight</h4>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{originCity.split(',')[0]}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(departureDate, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{destinationCity.split(',')[0]}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(departureDate, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              {/* Connecting line with plane */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 flex items-center justify-center">
                <div className="h-px bg-border flex-1" />
                <Plane className="w-4 h-4 text-muted-foreground mx-2 rotate-45" />
                <div className="h-px bg-border flex-1" />
              </div>
            </div>
          </div>

          {/* Return Flight */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Plane className="w-4 h-4" />
              <h4 className="font-medium">Return Flight</h4>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{destinationCity.split(',')[0]}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(returnDate, "MMM d, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{originCity.split(',')[0]}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(returnDate, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              {/* Connecting line with plane */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 flex items-center justify-center">
                <div className="h-px bg-border flex-1" />
                <Plane className="w-4 h-4 text-muted-foreground mx-2 rotate-45" />
                <div className="h-px bg-border flex-1" />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Ban className="w-4 h-4" />
              <span>Maximum Stops</span>
            </div>
            <span className="font-medium">1 stop</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Banknote className="w-4 h-4" />
              <span className="text-sm">Estimated Total Cost</span>
            </div>
            <span className="text-sm">€{estimatedPrice.min}-€{estimatedPrice.max}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}