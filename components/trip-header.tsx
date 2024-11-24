"use client";

import { format } from "date-fns";
import { Calendar, MapPin, Plane } from "lucide-react";
import { Card } from "./ui/card";
import { CityImageCarousel } from "./CityImageCarousel";

interface TripHeaderProps {
  city: string;
  originCity: string;
  startDate: Date;
  endDate: Date;
  budget: string;
  numberOfDays: number;
}

export function TripHeader({
  city,
  originCity,
  startDate,
  endDate,
  budget,
  numberOfDays,
}: TripHeaderProps) {
  return (
    <Card className="overflow-hidden">
      {/* Image Carousel */}
      <div className="relative h-[80vh]">
        <CityImageCarousel city={city} />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            Your <span>{numberOfDays} {numberOfDays === 1 ? 'day' : 'days'}</span> Trip to {city}
          </h2>
          <p className="text-lg text-white/90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
            {format(startDate, "MMMM d")} - {format(endDate, "MMMM d, yyyy") }
          </p>
        </div>
      </div>
    </Card>
  );
}