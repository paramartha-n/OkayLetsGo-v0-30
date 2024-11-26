"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Landmark, Utensils, Waves, Trees, Users, Star, Moon, Coins } from "lucide-react";
import { useTripContext } from "@/context/TripContext";
import React from 'react';

const activities = [
  {
    id: "must-see",
    icon: <Star className="w-4 h-4" />,
    label: "Must-see Sights",
    description: "Popular attractions",
    typical: "Tourist spots",
  },
  {
    id: "cultural",
    icon: <Landmark className="w-4 h-4" />,
    label: "Arts & Culture",
    description: "Museums and exhibitions",
    typical: "Cultural venues",
  },
  {
    id: "nature",
    icon: <Trees className="w-4 h-4" />,
    label: "Nature",
    description: "Hiking and outdoors",
    typical: "Outdoor activities",
  },
  {
    id: "water-sports",
    icon: <Waves className="w-4 h-4" />,
    label: "Water Sports",
    description: "Beach and water activities",
    typical: "Water fun",
  },
  {
    id: "gastronomy",
    icon: <Utensils className="w-4 h-4" />,
    label: "Gastronomy",
    description: "Food experiences",
    typical: "Food tours",
  },
  {
    id: "nightlife",
    icon: <Moon className="w-4 h-4" />,
    label: "Nightlife",
    description: "Evening entertainment",
    typical: "Night venues",
  },
  {
    id: "family",
    icon: <Users className="w-4 h-4" />,
    label: "Family Friendly",
    description: "Activities for all ages",
    typical: "Kid-friendly",
  },
  {
    id: "free",
    icon: <Coins className="w-4 h-4" />,
    label: "Free Activities",
    description: "No-cost experiences",
    typical: "Free attractions",
  },
];

interface ActivityStepProps {
  onNext: () => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function ActivityStep({ onNext, onValidationChange }: ActivityStepProps) {
  const { tripData, updateTripData } = useTripContext();

  const toggleActivity = (activityId: string) => {
    const newActivities = tripData.activities.includes(activityId)
      ? tripData.activities.filter((id) => id !== activityId)
      : [...tripData.activities, activityId];
    
    updateTripData('activities', newActivities);
    // Update validation state whenever activities change
    onValidationChange?.(newActivities.length > 0);
  };

  // Set initial validation state on component mount
  React.useEffect(() => {
    onValidationChange?.(tripData.activities.length > 0);
  }, []);

  return (
    <div className="min-h-[75vh] md:min-h-full md:h-[80vh] md:px-[20%] flex items-center">
      <div className="w-full">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold mb-2">What would you like to do?</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {activities.map((activity) => (
            <Card
              key={activity.id}
              className={`cursor-pointer transition-all duration-200 ${
                tripData.activities.includes(activity.id)
                  ? "border-okayletsgo-primary bg-okayletsgo-primary/5 dark:bg-okayletsgo-primary/10"
                  : "hover:bg-okayletsgo-primary/5"
              }`}
              onClick={() => toggleActivity(activity.id)}
            >
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-start justify-end space-x-2 sm:space-x-3">
                  <div className="flex-1 flex flex-col items-end space-y-1">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2 w-full">
                      <Label 
                        className={`font-bold text-[11px] sm:text-base truncate text-right ${
                          tripData.activities.includes(activity.id)
                            ? "text-okayletsgo-primary"
                            : ""
                        }`}
                      >
                        {activity.label}
                      </Label>
                      <div className={`p-1.5 sm:p-2 rounded-full ${
                        tripData.activities.includes(activity.id)
                          ? "bg-okayletsgo-primary/20 text-okayletsgo-primary dark:bg-okayletsgo-primary/30"
                          : "bg-okayletsgo-primary/10 text-okayletsgo-primary"
                      }`}>
                        {activity.icon}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
                      {activity.description}
                    </p>
                    <div className={`inline-block px-2 py-1 mt-1 text-[10px] sm:text-xs rounded-full text-center ${
                      tripData.activities.includes(activity.id)
                        ? "bg-okayletsgo-primary/20 text-okayletsgo-primary dark:bg-okayletsgo-primary/30"
                        : "bg-okayletsgo-primary/10 text-okayletsgo-primary"
                    }`}>
                      {activity.typical}
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