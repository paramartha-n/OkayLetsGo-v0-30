"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Hotel, Home, Building2, Tent, BedDouble, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTripContext } from "@/context/TripContext";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import React from "react";

const accommodations = [
  {
    id: "backpacker",
    icon: <Tent className="w-4 h-4" />,
    title: "Backpacker",
    description: "Hostels and shared rooms",
    price: "€5-€30\nper night",
  },
  {
    id: "budget",
    icon: <Home className="w-4 h-4" />,
    title: "Budget",
    description: "Basic hotels and guesthouses",
    price: "€30-€80\nper night",
  },
  {
    id: "standard",
    icon: <BedDouble className="w-4 h-4" />,
    title: "Standard",
    description: "3-star hotels and apartments",
    price: "€80-€130\nper night",
  },
  {
    id: "comfort",
    icon: <Building2 className="w-4 h-4" />,
    title: "Comfort",
    description: "4-star hotels with amenities",
    price: "€130-€300\nper night",
  },
  {
    id: "first-class",
    icon: <Building className="w-4 h-4" />,
    title: "First Class",
    description: "Premium hotels and suites",
    price: "€300-€500\nper night",
  },
  {
    id: "luxury",
    icon: <Hotel className="w-4 h-4" />,
    title: "Luxury",
    description: "5-star hotels and resorts",
    price: "€500-€5000\nper night",
  },
];

interface HotelStepProps {
  onNext: () => void;
}

export default function HotelStep({ onNext }: HotelStepProps) {
  const [hasCustomHotel, setHasCustomHotel] = useState(false);
  const { tripData, updateTripData } = useTripContext();

  const handleSelect = (value: string) => {
    updateTripData('hotel', { type: value });
    onNext();
  };

  const handleCustomHotelChange = (value: string) => {
    updateTripData('hotel', { type: 'custom', customHotel: value });
  };

  const handleCustomHotelSubmit = () => {
    if (tripData.hotel.customHotel?.trim()) {
      onNext();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold mb-2">Where would you like to stay?</h2>
      </div>

      {!hasCustomHotel ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            {accommodations.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-200 ${
                  tripData.hotel.type === option.id
                    ? "border-traveloka-primary bg-traveloka-primary/5 dark:bg-traveloka-primary/10"
                    : "hover:bg-traveloka-primary/5"
                }`}
                onClick={() => handleSelect(option.id)}
              >
                <CardContent className="p-2 sm:p-4">
                  <div className="flex items-start justify-end space-x-2 sm:space-x-3">
                    <div className="flex-1 flex flex-col items-end space-y-1">
                      <div className="flex items-center justify-end space-x-1 sm:space-x-2 w-full">
                        <Label 
                          className={`font-bold text-[11px] sm:text-base truncate text-right ${
                            tripData.hotel.type === option.id
                              ? "text-traveloka-primary"
                              : ""
                          }`}
                        >
                          {option.title}
                        </Label>
                        <div className={`p-1.5 sm:p-2 rounded-full ${
                          tripData.hotel.type === option.id
                            ? "bg-traveloka-primary/20 text-traveloka-primary dark:bg-traveloka-primary/30"
                            : "bg-traveloka-primary/10 text-traveloka-primary"
                        }`}>
                          {option.icon}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {option.description}
                      </p>
                      <div className={`inline-block px-2 py-1 mt-1 text-xs rounded-full text-center ${
                        tripData.hotel.type === option.id
                          ? "bg-traveloka-primary/20 text-traveloka-primary dark:bg-traveloka-primary/30"
                          : "bg-traveloka-primary/10 text-traveloka-primary"
                      }`}>
                        {option.price.split('\n').map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            {index === 0 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <button
            onClick={() => setHasCustomHotel(true)}
            className="w-full text-center text-sm text-traveloka-primary hover:underline mt-4"
          >
            I already have a hotel in mind
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <PlacesAutocomplete
                value={tripData.hotel.customHotel || ''}
                onChange={handleCustomHotelChange}
                onSelect={handleCustomHotelSubmit}
                placeholder="Enter hotel name"
                autoFocus={true}
                types={['lodging']}
                locationBias={tripData.city}
              />
            </div>
            <Button 
              onClick={handleCustomHotelSubmit}
              disabled={!tripData.hotel.customHotel?.trim()}
              className="w-[30%]"
            >
              Next
            </Button>
          </div>
          <Button
            variant="ghost"
            className="text-sm text-traveloka-primary hover:text-traveloka-primary/80"
            onClick={() => setHasCustomHotel(false)}
          >
            Back to hotel options
          </Button>
        </div>
      )}
    </div>
  );
}