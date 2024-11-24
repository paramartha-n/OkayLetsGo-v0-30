"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Ticket, Star, Utensils } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActivityCardProps {
  activity: string;
  description: string;
  city: string;
  type?: 'activity' | 'lunch' | 'dinner';
  duration?: string;
  price?: string;
  recommendedDish?: {
    name: string;
    description: string;
  };
}

interface PlaceDetails {
  imageUrl: string | null;
  placeId?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  priceLevel?: number;
}

function getPriceRange(priceLevel: number): string {
  switch (priceLevel) {
    case 0:
      return "Under $10";
    case 1:
      return "$10-30";
    case 2:
      return "$30-60";
    case 3:
      return "$60-100";
    case 4:
      return "$100+";
    default:
      return "Price N/A";
  }
}

export function ActivityCard({ activity, description, city, type = 'activity', duration, price, recommendedDish }: ActivityCardProps) {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails>({ imageUrl: null });
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const fetchPlaceDetails = async (attempt: number = 0) => {
      if (!window.google?.maps) {
        console.error('Google Maps not loaded');
        return;
      }

      try {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        
        // Generate different search queries based on retry attempt
        let searchQuery = '';
        if (attempt === 0) {
          searchQuery = `${activity} ${city}`.replace(/[^\w\s]/gi, '');
        } else if (attempt === 1) {
          // Try with just the activity name
          searchQuery = activity.replace(/[^\w\s]/gi, '');
        } else {
          // Try with activity + landmarks/attractions
          searchQuery = `${activity} landmarks attractions ${city}`.replace(/[^\w\s]/gi, '');
        }

        const request = {
          query: searchQuery,
          type: type === 'activity' ? 'tourist_attraction' : 'restaurant'
        };

        service.textSearch(request, async (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
            const place = results[0];
            
            // Try to get photo from the first result
            let imageUrl = place.photos?.[0]?.getUrl?.({ maxWidth: 800, maxHeight: 600 }) || null;
            
            // If no photo in first result, try other results
            if (!imageUrl && results.length > 1) {
              for (let i = 1; i < results.length; i++) {
                const photo = results[i]?.photos?.[0];
                if (photo?.getUrl) {
                  imageUrl = photo.getUrl({ maxWidth: 800, maxHeight: 600 });
                  break;
                }
              }
            }

            setPlaceDetails({ 
              imageUrl,
              placeId: place.place_id,
              latitude: place.geometry?.location?.lat?.(),
              longitude: place.geometry?.location?.lng?.(),
              rating: place.rating,
              priceLevel: place.price_level
            });
            setLoading(false);
          } else {
            // Handle different error statuses
            if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS ||
                status === google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
              if (attempt < MAX_RETRIES - 1) {
                // Try again with a different search query
                const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff with max 5s
                await new Promise(resolve => setTimeout(resolve, delay));
                setRetryCount(attempt + 1);
                fetchPlaceDetails(attempt + 1);
              } else {
                setPlaceDetails({ imageUrl: null });
                setLoading(false);
              }
            } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
              // Wait longer for rate limit errors
              if (attempt < MAX_RETRIES - 1) {
                const delay = Math.min(2000 * Math.pow(2, attempt), 10000); // Longer delay for rate limits
                await new Promise(resolve => setTimeout(resolve, delay));
                setRetryCount(attempt + 1);
                fetchPlaceDetails(attempt + 1);
              } else {
                setPlaceDetails({ imageUrl: null });
                setLoading(false);
              }
            } else {
              setPlaceDetails({ imageUrl: null });
              setLoading(false);
            }
          }
        });
      } catch (error) {
        console.error('Error fetching place details:', error);
        if (attempt < MAX_RETRIES - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          setRetryCount(attempt + 1);
          fetchPlaceDetails(attempt + 1);
        } else {
          setPlaceDetails({ imageUrl: null });
          setLoading(false);
        }
      }
    };

    setLoading(true);
    setRetryCount(0);
    fetchPlaceDetails();
  }, [activity, city, type]);

  const getTypeLabel = () => {
    switch (type) {
      case 'lunch':
        return 'Lunch';
      case 'dinner':
        return 'Dinner';
      default:
        return 'Activity';
    }
  };

  const handleLocationClick = () => {
    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    let mapsUrl = '';

    if (placeDetails.placeId) {
      if (isMobile) {
        // For mobile devices, try to use the native maps app
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          // iOS: Use Apple Maps format
          mapsUrl = placeDetails.latitude && placeDetails.longitude
            ? `maps://maps.apple.com/?q=${encodeURIComponent(activity)}&ll=${placeDetails.latitude},${placeDetails.longitude}`
            : `maps://maps.apple.com/?q=${encodeURIComponent(`${activity} ${city}`)}`;
        } else {
          // Android: Use Google Maps app format with search instead of navigation
          mapsUrl = `geo:0,0?q=${encodeURIComponent(`${activity} ${city}`)}`;
        }
      } else {
        // Desktop: Use Google Maps website
        mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeDetails.placeId}`;
      }
    } else {
      // Fallback to search query if no place ID
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activity} ${city}`)}`;
    }

    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-6">
      <div className="w-full md:w-[47.5%] flex-shrink-0">
        {loading ? (
          <Skeleton className="w-full h-[240px] rounded-md" />
        ) : (
          <AspectRatio ratio={4/3} className="bg-muted rounded-md overflow-hidden">
            {placeDetails.imageUrl ? (
              <img
                src={placeDetails.imageUrl}
                alt={activity}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <MapPin className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </AspectRatio>
        )}
      </div>
      <div className="flex-1 min-w-0 py-2 w-full md:w-[52.5%]">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex justify-between items-start gap-3">
              <Badge 
                variant="secondary" 
                className={`flex items-center justify-center w-[104px] px-3 py-1 ${
                  type === 'activity' 
                    ? 'bg-teal-500 hover:bg-teal-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-600 text-white'
                }`}
              >
                <span>{getTypeLabel()}</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5 shrink-0"
                onClick={handleLocationClick}
              >
                <MapPin className="w-3.5 h-3.5" />
                View on Maps
              </Button>
            </div>
            <h4 className="text-lg font-medium">{activity}</h4>
            <div className="flex flex-wrap items-center gap-3">
              {type === 'activity' && duration && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{duration}</span>
                  {price && (
                    <>
                      <span className="mx-1">•</span>
                      <div className="flex items-center space-x-1">
                        <Ticket className="w-4 h-4 text-primary" />
                        <span>{price}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
              {(type === 'lunch' || type === 'dinner') && placeDetails.rating && (
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-1 fill-yellow-500" />
                  <span className="text-foreground">{placeDetails.rating.toFixed(1)}</span>
                  {placeDetails.priceLevel !== undefined && (
                    <>
                      <span className="mx-2">•</span>
                      <Utensils className="w-4 h-4 mr-1" />
                      <span className="text-foreground">
                        {getPriceRange(placeDetails.priceLevel)}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
            {(type === 'lunch' || type === 'dinner') && recommendedDish && (
              <div className="mt-3">
                <p className="text-sm font-bold text-orange-500">Must-Try Dish:</p>
                <p className="text-sm mt-1">
                  <span className="font-medium">{recommendedDish.name}</span>
                  <span className="text-muted-foreground"> - {recommendedDish.description}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}