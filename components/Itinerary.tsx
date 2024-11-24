"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { useTripContext } from "@/context/TripContext";
import { generateItinerary } from "@/lib/gemini";
import { FlightCard } from "./flight-card";
import { HotelCard } from "./hotel-card";
import { TripHeader } from "./trip-header";
import { Separator } from "./ui/separator";
import { ActivityCard } from "./ActivityCard";

interface FlightInfo {
  outbound: {
    departure: string;
    arrival: string;
    duration: string;
    airline: string;
    price: string;
  };
  return: {
    departure: string;
    arrival: string;
    duration: string;
    airline: string;
    price: string;
  };
  totalPrice: {
    min: number;
    max: number;
  };
  skyscannerUrl: string;
  hotel: {
    name: string;
    rating: string;
    pricePerNight: string;
    distanceFromCenter: string;
    bookingUrl: string;
  };
}

interface ItineraryResponse {
  content: string;
  flights: FlightInfo;
}

interface Activity {
  type: 'activity' | 'lunch' | 'dinner';
  name: string;
  description: string;
  duration?: string;
  recommendedDish?: {
    name: string;
    description: string;
  };
}

interface DayActivities {
  day: string;
  activities: Activity[];
}

const getHotelTypeDescription = (type: string): { title: string; priceRange: { min: number; max: number | null } } => {
  switch (type) {
    case 'backpacker':
      return { title: 'Backpacker Hostels', priceRange: { min: 5, max: 30 } };
    case 'budget':
      return { title: 'Budget Hotels', priceRange: { min: 30, max: 80 } };
    case 'standard':
      return { title: 'Standard Hotels', priceRange: { min: 80, max: 130 } };
    case 'comfort':
      return { title: 'Comfort Hotels', priceRange: { min: 130, max: 300 } };
    case 'first-class':
      return { title: 'First Class Hotels', priceRange: { min: 300, max: 500 } };
    case 'luxury':
      return { title: 'Luxury Hotels', priceRange: { min: 500, max: null } };
    default:
      return { title: 'Hotels', priceRange: { min: 0, max: null } };
  }
};

function parseItineraryContent(content: string): DayActivities[] {
  const days = content.split(/Day \d+:/);
  return days
    .slice(1)
    .map((day, index) => {
      const lines = day
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.includes('Day'));

      const activities: Activity[] = [];
      let currentActivity: Partial<Activity> | null = null;

      for (const line of lines) {
        if (line.startsWith('Morning Activity:') || line.startsWith('Afternoon Activity:') || 
            line.startsWith('Lunch:') || line.startsWith('Dinner:')) {
          if (currentActivity?.name && currentActivity.type) {
            activities.push(currentActivity as Activity);
          }
          const [type, name] = line.split(': ');
          currentActivity = {
            type: type.toLowerCase().includes('activity') ? 'activity' : 
                  type.toLowerCase().includes('lunch') ? 'lunch' : 'dinner',
            name,
            description: '',
            duration: ''
          };
        } else if (line.startsWith('Duration:') && currentActivity) {
          currentActivity.duration = line.replace('Duration:', '').trim();
        } else if (line.startsWith('Description:') && currentActivity) {
          currentActivity.description = line.replace('Description:', '').trim();
        } else if (line.startsWith('Recommended Dish:') && currentActivity && 
                  (currentActivity.type === 'lunch' || currentActivity.type === 'dinner')) {
          const dishContent = line.replace('Recommended Dish:', '').trim();
          const [dishName, dishDescription] = dishContent.split(' - ');
          currentActivity.recommendedDish = {
            name: dishName.trim(),
            description: dishDescription.trim()
          };
        }
      }

      if (currentActivity?.name && currentActivity.type) {
        activities.push(currentActivity as Activity);
      }

      return {
        day: `Day ${index + 1}`,
        activities
      };
    })
    .filter(day => day.activities.length > 0);
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export default function Itinerary() {
  const { tripData } = useTripContext();
  const [itineraryContent, setItineraryContent] = useState<string>("");
  const [flightInfo, setFlightInfo] = useState<FlightInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const flightSectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDayChange = (day: number) => {
    setCurrentDay(day);
    scrollToTop();
  };

  const [currentDay, setCurrentDay] = useState(1);

  const fetchItineraryWithRetry = async (retryAttempt = 0): Promise<void> => {
    try {
      const { content, flights } = await generateItinerary(tripData);
      
      // Check if the content is valid (contains at least one day)
      const parsedContent = parseItineraryContent(content);
      if (parsedContent.length === 0) {
        throw new Error("Invalid itinerary content");
      }

      setItineraryContent(content);
      setFlightInfo(flights);
      setRetryCount(0); // Reset retry count on success
      
      // Scroll to flight section after content is loaded
      setTimeout(() => {
        flightSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error(`Attempt ${retryAttempt + 1} failed:`, error);
      
      if (retryAttempt < MAX_RETRIES) {
        setRetryCount(retryAttempt + 1);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchItineraryWithRetry(retryAttempt + 1);
      }
      
      // If all retries failed
      setItineraryContent("Sorry, we couldn't generate your itinerary at this time. Please try again later.");
      setFlightInfo(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initiateFetch() {
      if (tripData.showItinerary && tripData.dates.from && tripData.dates.to) {
        setLoading(true);
        try {
          await fetchItineraryWithRetry();
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    }

    initiateFetch();

    return () => {
      mounted = false;
    };
  }, [tripData.showItinerary, tripData.dates.from, tripData.dates.to, tripData]);

  if (!tripData.city || !tripData.dates.from || !tripData.dates.to || !tripData.showItinerary) {
    return null;
  }

  const numberOfDays = Math.ceil(
    (tripData.dates.to.getTime() - tripData.dates.from.getTime()) / (1000 * 60 * 60 * 24)
  );

  const hotelType = getHotelTypeDescription(tripData.hotel.type);
  const parsedItinerary = parseItineraryContent(itineraryContent);

  return (
    <div className="space-y-6">
      <TripHeader
        city={tripData.city}
        originCity={tripData.originCity}
        startDate={tripData.dates.from}
        endDate={tripData.dates.to}
        budget={tripData.budget}
        numberOfDays={numberOfDays}
      />

      {flightInfo && (
        <div ref={flightSectionRef} className="space-y-6">
          <FlightCard
            originCity={tripData.originCity}
            destinationCity={tripData.city}
            departureDate={tripData.dates.from}
            returnDate={tripData.dates.to}
            skyscannerUrl={flightInfo.skyscannerUrl}
            estimatedPrice={flightInfo.totalPrice}
          />

          <HotelCard
            title={hotelType.title}
            priceRange={hotelType.priceRange}
            numberOfNights={numberOfDays}
            bookingUrl={flightInfo.hotel.bookingUrl}
          />
        </div>
      )}

      {loading ? (
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2">
              {retryCount > 0 
                ? `Retrying... (Attempt ${retryCount} of ${MAX_RETRIES})`
                : "Generating your personalized itinerary..."}
            </span>
          </div>
        </Card>
      ) : parsedItinerary.length > 0 ? (
        <div ref={contentRef} className="space-y-6">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex overflow-x-auto py-2 px-4 gap-2 no-scrollbar">
              {parsedItinerary.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDayChange(index + 1)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                    ${currentDay === index + 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    }`}
                >
                  Day {index + 1}
                </button>
              ))}
            </div>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">{parsedItinerary[currentDay - 1].day}</h3>
              <div className="space-y-6">
                {parsedItinerary[currentDay - 1].activities.map((activity, actIndex) => (
                  <React.Fragment key={actIndex}>
                    {actIndex > 0 && <Separator className="my-6" />}
                    <ActivityCard 
                      activity={activity.name}
                      description={activity.description}
                      city={tripData.city}
                      type={activity.type}
                      duration={activity.duration}
                      recommendedDish={activity.recommendedDish}
                    />
                  </React.Fragment>
                ))}
              </div>

              {currentDay < parsedItinerary.length && (
                <div className="pt-6">
                  <button
                    onClick={() => handleDayChange(currentDay + 1)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Next Day
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}