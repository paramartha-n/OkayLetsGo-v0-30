"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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
  duration: string;
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
        <div className="space-y-6">
          {parsedItinerary.map(({ day, activities }, index) => (
            <Card key={index} className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">{day}</h3>
                <div className="space-y-6">
                  {activities.map((activity, actIndex) => (
                    <>
                      {actIndex > 0 && <Separator className="my-6" />}
                      <ActivityCard 
                        key={actIndex}
                        activity={activity.name}
                        description={activity.description}
                        city={tripData.city}
                        type={activity.type}
                        duration={activity.duration}
                      />
                    </>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            No itinerary content available. Please try again.
          </div>
        </Card>
      )}
    </div>
  );
}