"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Landmark, Utensils, Waves, Trees, Users, Star, Moon, Coins } from "lucide-react";
import { useTripContext } from "@/context/TripContext";

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
    label: "Free Activities Only",
    description: "No-cost experiences",
    typical: "Free attractions",
  },
];

interface ActivityStepProps {
  onNext: () => void;
}

export default function ActivityStep({ onNext }: ActivityStepProps) {
  const { tripData, updateTripData } = useTripContext();

  const toggleActivity = (activityId: string) => {
    const newActivities = tripData.activities.includes(activityId)
      ? tripData.activities.filter((id) => id !== activityId)
      : [...tripData.activities, activityId];
    
    updateTripData('activities', newActivities);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">What would you like to do?</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className={`cursor-pointer transition-all duration-200 ${
              tripData.activities.includes(activity.id)
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "hover:bg-accent/50"
            }`}
            onClick={() => toggleActivity(activity.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${
                      tripData.activities.includes(activity.id)
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {activity.icon}
                    </div>
                    <Label 
                      className={`font-medium ${
                        tripData.activities.includes(activity.id)
                          ? "text-emerald-700 dark:text-emerald-400"
                          : ""
                      }`}
                    >
                      {activity.label}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                  <div className={`inline-block px-2 py-1 mt-1 text-xs rounded-full ${
                    tripData.activities.includes(activity.id)
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "bg-accent text-muted-foreground"
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
  );
}