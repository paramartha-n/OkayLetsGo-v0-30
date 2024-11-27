"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Loader2, BookmarkCheck } from "lucide-react";
import { useTripContext } from "@/context/TripContext";
import { FlightCard } from "@/components/flight-card";
import { HotelCard } from "@/components/hotel-card";
import { ActivityCard } from "@/components/ActivityCard";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { generateItinerary } from "@/lib/gemini";
import { TripHeader } from "./trip-header";
import { getCurrencyFromCity } from "@/lib/currency";

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
  origin: {
    city: string;
    nearestAirport: {
      code: string;
      city: string;
    };
  };
  destination: {
    city: string;
    nearestAirport: {
      code: string;
      city: string;
    };
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
  price?: string;
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
  // Return empty array for error messages or invalid content
  if (!content || 
      content.includes("trouble creating") || 
      content.includes("Unable to generate") || 
      content.includes("Sorry, we couldn't generate")) {
    return [];
  }

  // Split content into days, keeping the "Day X:" prefix
  const days = content.split(/(?=Day \d+:)/).filter(Boolean);
  if (!days.length) return [];

  return days.map((dayContent) => {
    const activities: Activity[] = [];
    
    // Helper function to extract activity details
    const extractActivity = (type: 'activity' | 'lunch' | 'dinner', startMarker: string) => {
      try {
        const activityMatch = dayContent.match(new RegExp(`${startMarker}([^]*?)(?=(?:Lunch:|Afternoon Activity:|Dinner:|$))`));
        if (!activityMatch) return null;

        const activityContent = activityMatch[1].trim();
        const lines = activityContent.split('\n').map(line => line.trim());
        
        if (type === 'activity') {
          // For activities, get the first line as name (excluding "Morning Activity:" or "Afternoon Activity:")
          const name = lines[0].replace(/^(Morning Activity:|Afternoon Activity:)/, '').trim();
          const duration = lines.find(l => l.startsWith('Duration:'))?.replace('Duration:', '').trim();
          const price = lines.find(l => l.startsWith('Price:'))?.replace('Price:', '').trim();
          const description = lines.find(l => l.startsWith('Description:'))?.replace('Description:', '').trim();

          if (name) {
            return {
              type,
              name,
              duration,
              price,
              description: description || ''
            };
          }
        } else {
          // For restaurants (lunch/dinner)
          const name = lines[0].replace(/^(Lunch:|Dinner:)/, '').trim();
          const description = lines.find(l => l.startsWith('Description:'))?.replace('Description:', '').trim();
          const recommendedDishLine = lines.find(l => l.startsWith('Recommended Dish:'));
          
          if (name) {
            const activity: Activity = {
              type,
              name,
              description: description || ''
            };

            if (recommendedDishLine) {
              const dishContent = recommendedDishLine.replace('Recommended Dish:', '').trim();
              const dashIndex = dishContent.indexOf('-');
              if (dashIndex !== -1) {
                activity.recommendedDish = {
                  name: dishContent.slice(0, dashIndex).trim(),
                  description: dishContent.slice(dashIndex + 1).trim()
                };
              }
            }

            return activity;
          }
        }
        return null;
      } catch (error) {
        console.error(`Error parsing ${type}:`, error);
        return null;
      }
    };

    // Extract morning activity
    const morningActivity = extractActivity('activity', 'Morning Activity:');
    if (morningActivity) activities.push(morningActivity);

    // Extract lunch
    const lunch = extractActivity('lunch', 'Lunch:');
    if (lunch) activities.push(lunch);

    // Extract afternoon activity
    const afternoonActivity = extractActivity('activity', 'Afternoon Activity:');
    if (afternoonActivity) activities.push(afternoonActivity);

    // Extract dinner
    const dinner = extractActivity('dinner', 'Dinner:');
    if (dinner) activities.push(dinner);

    // Get day number from the content
    const dayMatch = dayContent.match(/Day (\d+):/);
    const dayNumber = dayMatch ? parseInt(dayMatch[1]) : activities.length;

    return {
      day: `Day ${dayNumber}`,
      activities: activities.filter(Boolean)
    };
  }).filter(day => day.activities.length > 0);
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
            origin={flightInfo.origin}
            destination={flightInfo.destination}
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
        <LoadingAnimation retryCount={retryCount} maxRetries={MAX_RETRIES} />
      ) : itineraryContent ? (
        <div ref={contentRef} className="space-y-6">
          {parsedItinerary.length > 0 ? (
            <>
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
                          price={activity.price}
                          userCurrency={tripData.currency}
                          recommendedDish={activity.recommendedDish}
                        />
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="pt-6 flex gap-2">
                    <button
                      onClick={() => {/* TODO: Implement save functionality */}}
                      className={`${currentDay >= parsedItinerary.length ? 'w-full' : 'w-[47.5%]'} inline-flex items-center justify-center gap-1 rounded-md text-xs sm:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-teal-600 text-white hover:bg-teal-700 h-10 px-2 sm:px-4 py-2`}
                    >
                      <BookmarkCheck className="w-4 h-4" />
                      Save This Trip
                    </button>
                    {currentDay < parsedItinerary.length && (
                      <button
                        onClick={() => handleDayChange(currentDay + 1)}
                        className="w-[52.5%] inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                      >
                        Next Day
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                <p>We encountered an issue while generating your itinerary.</p>
                <p className="mt-2">Please try again or adjust your preferences.</p>
              </div>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}