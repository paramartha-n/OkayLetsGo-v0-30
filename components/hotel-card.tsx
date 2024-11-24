"use client";

import { Building, ExternalLink, MapPin, Star, CircleDollarSign, Banknote } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

interface HotelCardProps {
  title: string;
  priceRange: { min: number; max: number | null };
  numberOfNights: number;
  bookingUrl: string;
}

export function HotelCard({
  title,
  priceRange,
  numberOfNights,
  bookingUrl,
}: HotelCardProps) {
  const formatPriceRange = (range: { min: number; max: number | null }): string => {
    if (range.max === null) {
      return `€${range.min}+`;
    }
    return `€${range.min}-€${range.max}`;
  };

  const calculateTotalPriceRange = (range: { min: number; max: number | null }, nights: number): string => {
    const totalMin = range.min * nights;
    if (range.max === null) {
      return `€${totalMin}+`;
    }
    const totalMax = range.max * nights;
    return `€${totalMin}-€${totalMax}`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] sm:text-xl font-semibold">Hotels</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(bookingUrl, '_blank')}
            className="flex items-center space-x-2"
          >
            <span className="text-[11px] sm:text-sm">Search on Booking.com</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-primary" />
                <h4 className="text-[12px] sm:text-base font-medium">{title}</h4>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-6 text-[11px] sm:text-sm">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-primary" />
                <span>8.0+</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Within 3km of city center</span>
              </div>
              <div className="flex items-center space-x-2">
                <CircleDollarSign className="w-4 h-4 text-primary" />
                <span>{formatPriceRange(priceRange)} per night</span>
              </div>
            </div>
          </div>

          <Separator />
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-[11px] sm:text-sm">
              <Banknote className="w-4 h-4" />
              <span>Estimated total for {numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'}</span>
            </div>
            <span className="text-[11px] sm:text-sm">
              {calculateTotalPriceRange(priceRange, numberOfNights)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}