"use client";

import { format } from "date-fns";
import { Calendar, MapPin, Plane, PlaneTakeoff, PlaneLanding } from "lucide-react";
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
        <div className="absolute inset-0 flex flex-col justify-end">
          {/* Dark gradient overlay for mobile */}
          <div className="absolute inset-x-0 bottom-0 h-48 md:h-32 bg-gradient-to-t from-black/70 to-transparent" />
          
          <div className="relative p-6">
            <h2 className="text-xl md:text-3xl font-bold mb-2 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              Your <span>{numberOfDays} {numberOfDays === 1 ? 'day' : 'days'}</span> Trip to {city}
            </h2>
            <div className="md:hidden text-sm text-white/90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] space-y-0.5">
              <p className="flex items-center gap-1.5">
                <PlaneTakeoff className="w-4 h-4" />
                {format(startDate, "EEEE MMMM d, yyyy")}
              </p>
              <p className="flex items-center gap-1.5">
                <PlaneLanding className="w-4 h-4" />
                {format(endDate, "EEEE MMMM d, yyyy")}
              </p>
            </div>
            <p className="hidden md:block text-lg text-white/90 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              {format(startDate, "EEEE MMMM d")} - {format(endDate, "EEEE MMMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}