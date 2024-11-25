"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, Coffee, Wine, Salad, Beef, Coins } from "lucide-react";
import { useTripContext } from "@/context/TripContext";

const cuisineTypes = [
  {
    id: "local",
    icon: <Beef className="w-4 h-4" />,
    label: "Local Food",
    description: "Traditional cuisine",
    typical: "Local specialties",
  },
  {
    id: "vegan",
    icon: <Salad className="w-4 h-4" />,
    label: "Vegan",
    description: "Plant-based options",
    typical: "Vegan restaurants",
  },
  {
    id: "budget",
    icon: <Coins className="w-4 h-4" />,
    label: "Budget Dining",
    description: "Affordable meals",
    typical: "Street food",
  },
  {
    id: "casual",
    icon: <Coffee className="w-4 h-4" />,
    label: "Casual Dining",
    description: "Relaxed atmosphere",
    typical: "Cafes & bistros",
  },
  {
    id: "fine-dining",
    icon: <UtensilsCrossed className="w-4 h-4" />,
    label: "Fine Dining",
    description: "Upscale restaurants",
    typical: "Gourmet cuisine",
  },
  {
    id: "wine-bars",
    icon: <Wine className="w-4 h-4" />,
    label: "Wine Bars",
    description: "Wine and tapas",
    typical: "Wine tasting",
  },
];

interface RestaurantStepProps {
  onNext: () => void;
}

export default function RestaurantStep({ onNext }: RestaurantStepProps) {
  const { tripData, updateTripData } = useTripContext();

  const toggleCuisine = (cuisineId: string) => {
    const newCuisines = tripData.restaurants.includes(cuisineId)
      ? tripData.restaurants.filter((id) => id !== cuisineId)
      : [...tripData.restaurants, cuisineId];
    
    updateTripData('restaurants', newCuisines);
  };

  return (
    <div className="min-h-full md:h-[80vh] md:px-[20%] flex items-center">
      <div className="w-full">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold mb-2">What would you like to eat?</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {cuisineTypes.map((cuisine) => (
            <Card
              key={cuisine.id}
              onClick={() => toggleCuisine(cuisine.id)}
              className={`cursor-pointer transition-all duration-200 ${
                tripData.restaurants.includes(cuisine.id)
                  ? "border-traveloka-primary bg-traveloka-primary/5 dark:bg-traveloka-primary/10"
                  : "hover:bg-traveloka-primary/5"
              }`}
            >
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-start justify-end space-x-2 sm:space-x-3">
                  <div className="flex-1 flex flex-col items-end space-y-1">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2 w-full">
                      <Label 
                        className={`font-bold text-[11px] sm:text-base truncate text-right ${
                          tripData.restaurants.includes(cuisine.id)
                            ? "text-traveloka-primary"
                            : ""
                        }`}
                      >
                        {cuisine.label}
                      </Label>
                      <div className={`p-1.5 sm:p-2 rounded-full ${
                        tripData.restaurants.includes(cuisine.id)
                          ? "bg-traveloka-primary/20 text-traveloka-primary dark:bg-traveloka-primary/30"
                          : "bg-traveloka-primary/10 text-traveloka-primary"
                      }`}>
                        {cuisine.icon}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
                      {cuisine.description}
                    </p>
                    <div className={`inline-block px-2 py-1 mt-1 text-[10px] sm:text-xs rounded-full text-center ${
                      tripData.restaurants.includes(cuisine.id)
                        ? "bg-traveloka-primary/20 text-traveloka-primary dark:bg-traveloka-primary/30"
                        : "bg-traveloka-primary/10 text-traveloka-primary"
                    }`}>
                      {cuisine.typical}
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