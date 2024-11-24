"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock } from "lucide-react";
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
}

export function ActivityCard({ activity, description, city, type = 'activity', duration, recommendedDish }: ActivityCardProps) {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails>({ imageUrl: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaceDetails = async () => {
      if (!window.google?.maps) {
        console.error('Google Maps not loaded');
        return;
      }

      try {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        const searchQuery = `${activity} ${city}`.replace(/[^\w\s]/gi, '');

        const request = {
          query: searchQuery,
          type: type === 'activity' ? 'tourist_attraction' : 'restaurant'
        };

        service.textSearch(request, (results, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results[0]
          ) {
            const place = results[0];
            const imageUrl = place.photos?.[0]?.getUrl({ maxWidth: 800, maxHeight: 600 }) || null;
            setPlaceDetails({ 
              imageUrl,
              placeId: place.place_id,
              latitude: place.geometry?.location?.lat(),
              longitude: place.geometry?.location?.lng()
            });
          } else {
            setPlaceDetails({ imageUrl: null });
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error fetching place details:', error);
        setPlaceDetails({ imageUrl: null });
        setLoading(false);
      }
    };

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
      <div className="w-full md:w-[40%] flex-shrink-0">
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
      <div className="flex-1 min-w-0 py-2 w-full">
        <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
          <div className="space-y-1.5">
            <h4 className="text-lg font-medium">{activity}</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5"
                onClick={handleLocationClick}
              >
                <MapPin className="w-3.5 h-3.5" />
                View on Maps
              </Button>
              {type === 'activity' && duration && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {duration}
                </div>
              )}
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`flex items-center w-fit gap-1.5 px-3 py-1 ${
              type === 'lunch' || type === 'dinner' ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <span>{getTypeLabel()}</span>
          </Badge>
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