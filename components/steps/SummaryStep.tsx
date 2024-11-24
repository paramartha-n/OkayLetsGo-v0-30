"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  MapPin,
  Calendar,
  Hotel,
  Activity,
  UtensilsCrossed,
  Car,
  Heart,
  Wallet,
  Pencil,
  Plane,
} from "lucide-react";
import { useTripContext } from "@/context/TripContext";

interface SummaryStepProps {
  onEdit: (step: number) => void;
  onCreateItinerary: () => void;
}

const getAccommodationPrice = (type: string): string => {
  switch (type) {
    case 'backpacker':
      return '€5-€30 per night';
    case 'budget':
      return '€30-€80 per night';
    case 'standard':
      return '€80-€130 per night';
    case 'comfort':
      return '€130-€300 per night';
    case 'first-class':
      return '€300-€500 per night';
    case 'luxury':
      return '€500-€5000 per night';
    default:
      return type;
  }
};

const summaryItems = [
  {
    id: 'origin',
    icon: <Plane className="w-4 h-4" />,
    title: 'Origin',
    step: 2,
    getValue: (tripData: any) => tripData.originCity || 'Not specified'
  },
  {
    id: 'destination',
    icon: <MapPin className="w-4 h-4" />,
    title: 'Destination',
    step: 1,
    getValue: (tripData: any) => tripData.city || 'Not specified'
  },
  {
    id: 'dates',
    icon: <Calendar className="w-4 h-4" />,
    title: 'Dates',
    step: 3,
    getValue: (tripData: any) => tripData.dates.from && tripData.dates.to ? 
      `${format(tripData.dates.from, 'MMM d, yyyy')} - ${format(tripData.dates.to, 'MMM d, yyyy')} (${Math.ceil(
        (tripData.dates.to.getTime() - tripData.dates.from.getTime()) / (1000 * 60 * 60 * 24)
      )} nights)` : 'Not specified'
  },
  {
    id: 'accommodation',
    icon: <Hotel className="w-4 h-4" />,
    title: 'Accommodation',
    step: 4,
    getValue: (tripData: any) => tripData.hotel.customHotel || getAccommodationPrice(tripData.hotel.type) || 'Not specified'
  },
  {
    id: 'transport',
    icon: <Car className="w-4 h-4" />,
    title: 'Transportation',
    step: 5,
    getValue: (tripData: any) => (
      <div className="flex flex-wrap gap-1.5">
        {tripData.transport.length > 0 ? (
          tripData.transport.map((transport: string) => (
            <span
              key={transport}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {transport}
            </span>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">Not specified</span>
        )}
      </div>
    )
  },
  {
    id: 'activities',
    icon: <Activity className="w-4 h-4" />,
    title: 'Activities',
    step: 6,
    getValue: (tripData: any) => (
      <div className="flex flex-wrap gap-1.5">
        {tripData.activities.length > 0 ? (
          tripData.activities.map((activity: string) => (
            <span
              key={activity}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {activity}
            </span>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">Not specified</span>
        )}
      </div>
    )
  },
  {
    id: 'dining',
    icon: <UtensilsCrossed className="w-4 h-4" />,
    title: 'Dining Preferences',
    step: 7,
    getValue: (tripData: any) => (
      <div className="flex flex-wrap gap-1.5">
        {tripData.restaurants.length > 0 ? (
          tripData.restaurants.map((restaurant: string) => (
            <span
              key={restaurant}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {restaurant}
            </span>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">Not specified</span>
        )}
      </div>
    )
  },
  {
    id: 'preferences',
    icon: <Heart className="w-4 h-4" />,
    title: 'Special Requests',
    step: 8,
    getValue: (tripData: any) => tripData.preferences || 'Not specified'
  },
  {
    id: 'budget',
    icon: <Wallet className="w-4 h-4" />,
    title: 'Budget',
    step: 9,
    getValue: (tripData: any) => tripData.budget || 'Not specified'
  }
];

export default function SummaryStep({ onEdit, onCreateItinerary }: SummaryStepProps) {
  const { tripData, updateTripData } = useTripContext();

  const handleCreateItinerary = () => {
    updateTripData('showItinerary', true);
    onCreateItinerary();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Trip Summary</h2>
        <p className="text-muted-foreground">Review your travel preferences</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {summaryItems.map((item) => (
          <Card key={item.id} className="p-3">
            <div className="flex items-start justify-between h-full">
              <div className="flex items-start space-x-3 min-w-0">
                <div className="w-4 h-4 text-primary mt-0.5 flex-shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  <div className="text-sm text-muted-foreground mt-0.5 break-words">
                    {item.getValue(tripData)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary flex-shrink-0 -mt-1 -mr-2 h-8 w-8"
                onClick={() => onEdit(item.step)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg"
          onClick={handleCreateItinerary}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Create Itinerary
        </Button>
      </div>
    </div>
  );
}