"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Ticket, Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDualPrice, DualPriceResult } from "@/lib/currency";

interface ActivityCardProps {
  activity: string;
  description: string;
  city: string;
  type?: 'activity' | 'lunch' | 'dinner';
  duration?: string;
  price?: string;
  localCurrency: string;
  userCurrency: string;
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
  userRatingsTotal?: number;
}

const formatPrice = async (price: string | undefined, localCurrency: string, userCurrency: string) => {
  if (!price || price.toLowerCase() === 'free') return 'Free';
  
  // Extract the numeric amount from the price string
  let amount: string | number = price;
  if (price.includes('(')) {
    // If price is in format "1500 JPY (€10)", extract the local amount
    const [localPrice] = price.split('(');
    const [numericAmount] = localPrice.trim().split(' ');
    amount = numericAmount;
  } else if (price.includes('€')) {
    // If price is in EUR format
    amount = price.replace('€', '').trim();
  }

  try {
    const dualPrice = await formatDualPrice(amount, localCurrency, userCurrency);
    return (
      <span>
        <span className="font-medium">{dualPrice.localPrice}</span>
        <span className="text-muted-foreground text-xs"> ({dualPrice.userPrice})</span>
      </span>
    );
  } catch (error) {
    console.error('Error formatting price:', error);
    return price;
  }
};

export function ActivityCard({ 
  activity, 
  description, 
  city, 
  type = 'activity', 
  duration, 
  price, 
  localCurrency,
  userCurrency,
  recommendedDish 
}: ActivityCardProps) {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails>({ imageUrl: null });
  const [loading, setLoading] = useState(true);
  const [formattedPrice, setFormattedPrice] = useState<string | JSX.Element>(price || '');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const updatePrice = async () => {
      const formatted = await formatPrice(price, localCurrency, userCurrency);
      setFormattedPrice(formatted);
    };
    updatePrice();
  }, [price, localCurrency, userCurrency]);

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
          type: type === 'activity' ? 'tourist_attraction' : 'restaurant',
          fields: ['name', 'photos', 'rating', 'user_ratings_total', 'place_id', 'geometry']
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
              userRatingsTotal: place.user_ratings_total
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
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-3">
            <Badge 
              variant="secondary" 
              className={`flex items-center justify-center w-[104px] px-3 py-1 ${
                type === 'activity' 
                  ? 'bg-teal-500 hover:bg-teal-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-600 text-white'
              }`}
            >
              <span>{type === 'activity' ? 'Activity' : type === 'lunch' ? 'Lunch' : 'Dinner'}</span>
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-[26px] sm:h-8 text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5 shrink-0"
              onClick={() => {
                const query = placeDetails.placeId
                  ? `place_id:${placeDetails.placeId}`
                  : `${activity} ${city}`;
                
                // Check if device is iOS
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                // Check if device is Android
                const isAndroid = /Android/.test(navigator.userAgent);
                
                let mapsUrl;
                if (isIOS) {
                  // iOS uses comgooglemaps:// protocol if the app is installed, otherwise falls back to maps.google.com
                  mapsUrl = placeDetails.placeId
                    ? `comgooglemaps://?q=${encodeURIComponent(query)}&query_place_id=${placeDetails.placeId}`
                    : `comgooglemaps://?q=${encodeURIComponent(query)}`;
                } else if (isAndroid) {
                  // Android uses google.com/maps format with a special intent scheme
                  mapsUrl = placeDetails.placeId
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity)}&query_place_id=${placeDetails.placeId}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                } else {
                  // Desktop fallback
                  mapsUrl = placeDetails.placeId
                    ? `https://www.google.com/maps/place/?q=place_id:${placeDetails.placeId}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                }

                window.open(mapsUrl, '_blank');
              }}
            >
              <MapPin className="w-3.5 h-3.5" />
              View on Maps
            </Button>
          </div>
          
          <h4 className="text-lg font-medium">{activity}</h4>
          
          {/* Activity Details */}
          <div className="flex flex-wrap items-center gap-3">
            {type === 'activity' && (duration || price) && (
              <div className="flex items-center gap-3 text-sm">
                {duration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{duration}</span>
                  </div>
                )}
                {price && (
                  <div className="flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-primary" />
                    {formattedPrice}
                  </div>
                )}
              </div>
            )}
            {(type === 'lunch' || type === 'dinner') && placeDetails.rating && (
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 mr-1 fill-yellow-500 stroke-yellow-500" />
                <span className="text-foreground">{placeDetails.rating.toFixed(1)}</span>
                {placeDetails.userRatingsTotal && (
                  <span className="text-muted-foreground ml-1">
                    ({placeDetails.userRatingsTotal.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <div className="mt-3">
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          )}

          {/* Recommended Dish for Restaurants */}
          {(type === 'lunch' || type === 'dinner') && recommendedDish && (
            <div className="mt-4 bg-muted/50 rounded-lg p-3">
              <p className="text-sm font-medium text-orange-500 mb-1">Must-Try Dish:</p>
              <p className="text-sm">
                <span className="font-medium">{recommendedDish.name}</span>
                {recommendedDish.description && (
                  <span className="text-muted-foreground"> - {recommendedDish.description}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}